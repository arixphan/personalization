import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMindMapDto } from './dto/create-mind-map.dto';

@Injectable()
export class MindMapService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateMindMapDto) {
    const { nodes = [], edges = [], id: _id, ...metadata } = dto as any;

    try {
      return await this.prisma.mindMap.create({
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
              sourceHandle: e.sourceHandle,
              targetHandle: e.targetHandle,
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
    } catch (error) {
      console.error('MindMapService.create error:', error);
      throw error;
    }
  }

  async findAll(userId: number) {
    return this.prisma.mindMap.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { nodes: true } },
      },
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
      const nodeIds = nodes.map((n: any) => n.id);
      await this.prisma.mindMapNode.deleteMany({
        where: { mindMapId: id, id: { notIn: nodeIds } },
      });

      for (const node of nodes) {
        await this.prisma.mindMapNode.upsert({
          where: { mindMapId_id: { mindMapId: id, id: node.id } },
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
      const edgeIds = edges.map((e: any) => e.id);
      await this.prisma.mindMapEdge.deleteMany({
        where: { mindMapId: id, id: { notIn: edgeIds } },
      });

      for (const edge of edges) {
        await this.prisma.mindMapEdge.upsert({
          where: { mindMapId_id: { mindMapId: id, id: edge.id } },
          update: {
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
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
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
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

  // --- Real-time WebSocket support ---

  async updateNodePosition(mindMapId: number, nodeId: string, x: number, y: number) {
    return this.prisma.mindMapNode.update({
      where: { mindMapId_id: { mindMapId, id: nodeId } },
      data: { positionX: x, positionY: y },
    });
  }

  async updateNodeData(mindMapId: number, nodeId: string, data: any) {
    const node = await this.prisma.mindMapNode.findUnique({
      where: { mindMapId_id: { mindMapId, id: nodeId } },
    });
    if (!node) return;

    return this.prisma.mindMapNode.update({
      where: { mindMapId_id: { mindMapId, id: nodeId } },
      data: {
        data: {
          ...(node.data as any),
          ...data,
        },
      },
    });
  }

  async updateEdgeData(mindMapId: number, edgeId: string, data: any) {
    return this.prisma.mindMapEdge.update({
      where: { mindMapId_id: { mindMapId, id: edgeId } },
      data: { style: data },
    });
  }

  async createNode(mindMapId: number, node: any) {
    const data = {
      type: node.type,
      positionX: node.position.x,
      positionY: node.position.y,
      data: node.data,
      style: node.style,
    };

    return this.prisma.mindMapNode.upsert({
      where: { mindMapId_id: { mindMapId: mindMapId, id: node.id } },
      update: data,
      create: {
        id: node.id,
        mindMapId: mindMapId,
        ...data,
      },
    });
  }

  async createEdge(mindMapId: number, edge: any) {
    const data = {
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      type: edge.type,
      animated: edge.animated,
      style: edge.style,
    };

    return this.prisma.mindMapEdge.upsert({
      where: { mindMapId_id: { mindMapId: mindMapId, id: edge.id } },
      update: data,
      create: {
        id: edge.id,
        mindMapId: mindMapId,
        ...data,
      },
    });
  }
}
