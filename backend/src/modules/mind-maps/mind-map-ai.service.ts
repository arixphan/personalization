import { Injectable } from '@nestjs/common';
import { OrchestratorService } from '../ai/services/orchestrator.service';
import { generateText } from 'ai';
import { AiSettingsService } from '../ai/services/ai-settings.service';
import { ModelFactoryService } from '../ai/services/model-factory.service';

@Injectable()
export class MindMapAiService {
  constructor(
    private readonly aiSettings: AiSettingsService,
    private readonly modelFactory: ModelFactoryService,
  ) {}

  async generateFromTopic(userId: number, topic: string) {
    const settings = await this.aiSettings.getSettings(userId, true);
    if (!settings || !settings.apiKey || !settings.provider) {
      throw new Error('AI is not configured');
    }

    const model = this.modelFactory.createModel(
      settings.provider,
      settings.apiKey,
      settings.model || undefined,
    );

    const prompt = `You are a mind map generator. Generate a mind map for the topic: "${topic}".
    Return the result ONLY as a JSON object with the following structure:
    {
      "nodes": [
        { "id": "1", "data": { "label": "Main Topic" }, "position": { "x": 0, "y": 0 }, "type": "input" },
        ...
      ],
      "edges": [
        { "id": "e1-2", "source": "1", "target": "2", "animated": true },
        ...
      ]
    }
    Rules:
    1. The main topic should be id "1".
    2. Suggest at least 5-8 related sub-topics.
    3. Use a logical hierarchical layout (position nodes around the center).
    4. Return ONLY valid JSON. No markdown formatting.`;

    const { text } = await generateText({
      model,
      prompt,
    });

    try {
      // Basic cleanup in case AI adds markdown blocks
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Failed to parse AI response:', text);
      throw new Error('Invalid JSON received from AI');
    }
  }

  async expandNode(userId: number, mindMapContext: any, nodeId: string) {
    const settings = await this.aiSettings.getSettings(userId, true);
    if (!settings || !settings.apiKey || !settings.provider) {
      throw new Error('AI is not configured');
    }

    const model = this.modelFactory.createModel(
      settings.provider,
      settings.apiKey,
      settings.model || undefined,
    );

    const selectedNode = mindMapContext.nodes.find(n => n.id === nodeId);
    const label = selectedNode?.data?.label || 'this idea';

    const prompt = `Given the current mind map context:
    Nodes: ${JSON.stringify(mindMapContext.nodes.map(n => ({ id: n.id, label: n.data.label })))}
    Edges: ${JSON.stringify(mindMapContext.edges)}
    
    Expand the specific node "${label}" (id: ${nodeId}) with 3-5 sub-topics.
    Return ONLY a JSON object with NEW nodes and edges to be added:
    {
      "newNodes": [
        { "id": "unique_id", "data": { "label": "Sub-topic" }, "position": { "x": ..., "y": ... } }
      ],
      "newEdges": [
        { "id": "e-source-target", "source": "${nodeId}", "target": "unique_id" }
      ]
    }
    Ensure the position of new nodes is relatively near the source node.
    Return ONLY valid JSON.`;

    const { text } = await generateText({
      model,
      prompt,
    });

    try {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Failed to parse AI response:', text);
      throw new Error('Invalid JSON received from AI');
    }
  }
}
