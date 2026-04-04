import { Injectable } from '@nestjs/common';
import { generateText } from 'ai';
import { AiSettingsService } from '../ai/services/ai-settings.service';
import { ModelFactoryService } from '../ai/services/model-factory.service';

@Injectable()
export class MindMapAiService {
  constructor(
    private readonly aiSettings: AiSettingsService,
    private readonly modelFactory: ModelFactoryService,
  ) {}

  private async getModel(userId: number) {
    const settings = await this.aiSettings.getSettings(userId, true);
    if (!settings?.apiKey || !settings?.provider) {
      throw new Error('AI is not configured');
    }
    return this.modelFactory.createModel(settings.provider, settings.apiKey, settings.model || undefined);
  }

  async generateFromTopic(userId: number, topic: string) {
    const model = await this.getModel(userId);

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

    const { text } = await generateText({ model, prompt });
    try {
      return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch {
      throw new Error('Invalid JSON received from AI');
    }
  }

  /**
   * Expands a node, returning a NESTED tree with children[] and content descriptions.
   */
  async expandNode(userId: number, mindMapContext: any, nodeId: string, userContext?: string) {
    const model = await this.getModel(userId);

    const selectedNode = mindMapContext.nodes?.find((n: any) => n.id === nodeId);
    const label = selectedNode?.data?.label || 'this idea';
    const contextLine = userContext?.trim()
      ? `\nUser's additional context: "${userContext.trim()}"`
      : '';

    const prompt = `You are a mind map generator. Expand the node "${label}" into a rich nested sub-tree.
Current map context:
Nodes: ${JSON.stringify(mindMapContext.nodes?.map((n: any) => ({ id: n.id, label: n.data?.label })))}
${contextLine}

Return ONLY a JSON object in this exact shape:
{
  "newNodes": [
    {
      "id": "unique-id-1",
      "data": { "label": "Sub-topic", "content": "1-2 sentence description of this sub-topic." },
      "children": [
        {
          "id": "unique-id-2",
          "data": { "label": "Nested topic", "content": "Short description." },
          "children": []
        }
      ]
    }
  ]
}
Rules:
- Generate 3-5 top-level children, each with 0-3 nested children (max 2 levels deep).
- Every node must have a meaningful "content" description (1-2 sentences).
- IDs must be unique short strings (e.g. "n1", "n2", "n1a", "n1b").
- Return ONLY valid JSON. No markdown. No extra keys.`;

    const { text } = await generateText({ model, prompt });
    try {
      return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch {
      throw new Error('Invalid JSON received from AI');
    }
  }

  /**
   * Refines an existing preview tree based on a user chat message.
   * Returns the updated tree + a short assistant reply to show in chat.
   */
  async refinePreview(
    userId: number,
    currentTree: any[],
    chatHistory: Array<{ role: string; content: string }>,
    userMessage: string,
    parentNodeLabel: string,
  ): Promise<{ updatedTree: any[]; assistantReply: string }> {
    const model = await this.getModel(userId);

    const historyStr = chatHistory
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `You are a collaborative mind map assistant.
The user is refining a mind map expansion of the node: "${parentNodeLabel}".

Current tree (JSON):
${JSON.stringify(currentTree, null, 2)}

Conversation so far:
${historyStr || '(none)'}

User's latest request: "${userMessage}"

Apply the user's changes to the tree. Rules:
- Keep existing node IDs where possible; assign new short IDs for added nodes.
- Every node must have "id", "data" (with "label" and "content"), and "children" fields.
- Descriptions ("content") should be 1-2 sentences.
- "assistantReply" should be a concise friendly message (1-2 sentences) explaining what changed.

Return ONLY valid JSON:
{
  "updatedTree": [ ...same nested format as current tree... ],
  "assistantReply": "Brief explanation of changes."
}`;

    const { text } = await generateText({ model, prompt });
    try {
      return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch {
      throw new Error('Invalid JSON received from AI');
    }
  }
}
