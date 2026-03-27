import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MindMapService } from './mind-maps.service';
import { AppConfigService } from '../config/app-config.service';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      // For local development, allow any origin to match the credentials requirement
      // This is crucial because '*' is forbidden when credentials: true
      callback(null, true);
    },
    credentials: true,
  },
  namespace: 'mind-maps',
})
export class MindMapGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly mindMapService: MindMapService,
  ) { }

  async handleConnection(client: Socket) {
    try {
      // 1. Try auth object / headers
      let token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      // 2. Try cookies (Primary for browser-based Socket.io usage)
      if (!token && client.handshake.headers.cookie) {
        const cookies = client.handshake.headers.cookie.split(';').reduce((acc: any, c) => {
          const [key, val] = c.trim().split('=');
          acc[key] = val;
          return acc;
        }, {});
        
        // Use the exact cookie name from shared constants (access_token)
        token = cookies['access_token'] || cookies['accessToken'] || cookies['jwt'];
      }

      if (!token) {
        console.warn(`[MindMapGateway] Connection rejected: No token found for client ${client.id}`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.auth.jwtSecret,
      });

      client.data.user = payload;
      console.log(`[MindMapGateway] Connected: ${client.id}, User: ${payload.username}`);
    } catch (error) {
      console.error('[MindMapGateway] Connection error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[MindMapGateway] Disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { mindMapId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `mind-map-${String(data.mindMapId)}`;
    client.join(room);
    console.log(`[MindMapGateway] Client ${client.id} joined room ${room}`);
    return { status: 'joined', room };
  }

  @SubscribeMessage('node:move')
  handleNodeMove(
    @MessageBody() data: { mindMapId: number; nodeId: string; position: { x: number; y: number } },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `mind-map-${String(data.mindMapId)}`;
    // Instant broadcast for smooth real-time movement (excluding sender)
    client.to(room).emit('node:moved', { nodeId: data.nodeId, position: data.position });
  }

  @SubscribeMessage('node:save-position')
  async handleNodeSavePosition(
    @MessageBody() data: { mindMapId: number; nodeId: string; position: { x: number; y: number } },
  ) {
    try {
      const { nodeId, position, mindMapId } = data;
      if (!nodeId || !position) return;
      
      const room = `mind-map-${String(mindMapId)}`;
      // Final broadcast to ensures all tabs are perfectly aligned after persistence
      this.server.to(room).emit('node:moved', { nodeId, position });
      
      await this.mindMapService.updateNodePosition(nodeId, position.x, position.y);
    } catch (err) {
      console.error('[MindMapGateway] Failed to persist node position:', err);
    }
  }

  @SubscribeMessage('node:update')
  handleNodeUpdate(
    @MessageBody() data: { mindMapId: number; nodeId: string; data: any },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `mind-map-${String(data.mindMapId)}`;
    client.to(room).emit('node:updated', {
      nodeId: data.nodeId,
      data: data.data,
    });

    this.mindMapService.updateNodeData(data.nodeId, data.data).catch(err => {
      console.error('[MindMapGateway] Failed to save node data:', err);
    });
  }

  @SubscribeMessage('node:add')
  async handleNodeAdd(
    @MessageBody() data: { mindMapId: number; node: any },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `mind-map-${String(data.mindMapId)}`;
    client.to(room).emit('node:added', data.node);

    try {
      await this.mindMapService.createNode(data.mindMapId, data.node);
    } catch (err) {
      console.error('[MindMapGateway] Failed to persist new node:', err);
    }
  }

  @SubscribeMessage('edge:add')
  async handleEdgeAdd(
    @MessageBody() data: { mindMapId: number; edge: any },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `mind-map-${String(data.mindMapId)}`;
    client.to(room).emit('edge:added', data.edge);

    try {
      await this.mindMapService.createEdge(data.mindMapId, data.edge);
    } catch (err) {
      console.error('[MindMapGateway] Failed to persist new edge:', err);
    }
  }

  @SubscribeMessage('node:remove')
  async handleNodeRemove(
    @MessageBody() data: { mindMapId: number; nodeId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `mind-map-${String(data.mindMapId)}`;
    client.to(room).emit('node:removed', { nodeId: data.nodeId });
  }
}
