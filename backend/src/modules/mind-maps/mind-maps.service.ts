import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMindMapDto } from './dto/create-mind-map.dto';

@Injectable()
export class MindMapService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateMindMapDto) {
    const { nodes = [], edges = [], ...metadata } = dto;

    return this.prisma.mindMap.create({
      data: {
        ...metadata,
        userId,
        nodes: {
          create: nodes.map(n => ({
            id: n.id,
            type: n.type,
            positionX: n.positionX,
            positionY: n.positionY,
            data: n.data,
            style: n.style,
          })),
        },
        edges: {
          create: edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label,
            type: e.type,
            animated: e.animated,
            style: e.style,
          })),
        },
      },
      include: {
        nodes: true,
        edges: true,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.mindMap.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const mindMap = await this.prisma.mindMap.findFirst({
      where: { id, userId },
      include: {
        nodes: true,
        edges: true,
      },
    });

    if (!mindMap) {
      throw new NotFoundException(`Mind map with ID ${id} not found`);
    }

    return mindMap;
  }

  async update(userId: number, id: number, dto: any) {
    const { nodes, edges, ...metadata } = dto;

    // 1. Update metadata
    await this.prisma.mindMap.update({
      where: { id, userId },
      data: metadata,
    });

    // 2. Handle Nodes (Sync)
    if (nodes) {
      // Delete missing nodes
      const nodeIds = nodes.map(n => n.id);
      await this.prisma.mindMapNode.deleteMany({
        where: { mindMapId: id, id: { notIn: nodeIds } },
      });

      // Upsert existing nodes
      for (const node of nodes) {
        await this.prisma.mindMapNode.upsert({
          where: { id: node.id },
          update: {
            type: node.type,
            positionX: node.positionX,
            positionY: node.positionY,
            data: node.data,
            style: node.style,
          },
          create: {
            id: node.id,
            mindMapId: id,
            type: node.type,
            positionX: node.positionX,
            positionY: node.positionY,
            data: node.data,
            style: node.style,
          },
        });
      }
    }

    // 3. Handle Edges (Sync)
    if (edges) {
      const edgeIds = edges.map(e => e.id);
      await this.prisma.mindMapEdge.deleteMany({
        where: { mindMapId: id, id: { notIn: edgeIds } },
      });

      for (const edge of edges) {
        await this.prisma.mindMapEdge.upsert({
          where: { id: edge.id },
          update: {
            source: edge.source,
            target: edge.target,
            label: edge.label,
            type: edge.type,
            animated: edge.animated,
            style: edge.style,
          },
          create: {
            id: edge.id,
            mindMapId: id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            type: edge.type,
            animated: edge.animated,
            style: edge.style,
          },
        });
      }
    }

    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number) {
    const mindMap = await this.findOne(userId, id);
    await this.prisma.mindMap.delete({ where: { id: mindMap.id } });
    return { success: true };
  }
}
