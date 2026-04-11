export interface GroupMeta {
  max: number;
  index: number;
  span: number;
}

export class Graph {
  #counter: number;
  groups: Map<number, number>;
  nodes: Map<string, number>;
  edges: Map<string, string[]>;
  meta: Map<string, GroupMeta>;

  static instance?: Graph;

  static getInstance() {
    if (this.instance) {
      this.instance.reset();
      return this.instance;
    }
    this.instance = new Graph();
    return this.instance;
  }

  constructor() {
    this.#counter = 0;
    this.groups = new Map();
    this.nodes = new Map();
    this.edges = new Map();
    this.meta = new Map();
  }

  reset() {
    this.#counter = 0;
    this.groups = new Map();
    this.nodes = new Map();
    this.edges = new Map();
    this.meta = new Map();
  }

  createGroup(el1: string, el2: string) {
    const id = ++this.#counter;
    this.groups.set(id, 2);
    this.nodes.set(el1, 1);
    this.nodes.set(el2, 2);
    this.edges.set(el1, [el2]);
    this.edges.set(el2, [el1]);
    return id;
  }

  setGroup(group: number, value: number) {
    this.groups.set(group, value);
  }

  addNode(group: number, el: string, index: number) {
    if (!this.groups.has(group)) {
      throw Error(`Group id ${group} is undefined`);
    }
    this.nodes.set(el, index);
  }

  addEdge(el1: string, el2: string) {
    if (!this.nodes.has(el1)) throw Error(`Node id ${el1} is undefined`);
    if (!this.nodes.has(el2)) throw Error(`Node id ${el2} is undefined`);

    const edges1 = this.edges.get(el1) ? [...this.edges.get(el1)!, el2] : [el2];
    const edges2 = this.edges.get(el2) ? [...this.edges.get(el2)!, el1] : [el1];

    this.edges.set(el1, edges1);
    this.edges.set(el2, edges2);
  }

  addEdges(el: string, els: string[]) {
    if (!this.nodes.has(el)) throw Error(`Node id ${el} is undefined`);
    if (!els.length) return;

    const nodeEdges = this.edges.get(el)
      ? [...this.edges.get(el)!, ...els]
      : els;

    this.edges.set(el, nodeEdges);

    els.forEach((targetEl) => {
      const targeEdges = this.edges.get(targetEl)
        ? [...this.edges.get(targetEl)!, el]
        : [el];
      this.edges.set(targetEl, targeEdges);
    });
  }

  getGroup(group: number): number {
    if (!this.groups.has(group)) throw Error(`Group id ${group} is undefined`);
    return this.groups.get(group)!;
  }

  getNode(node: string): number {
    if (!this.nodes.has(node)) throw Error(`Node id ${node} is undefined`);
    return this.nodes.get(node)!;
  }

  getEdges(node: string): string[] {
    if (!this.edges.has(node)) throw Error(`Edges of node id ${node} is undefined`);
    return this.edges.get(node)!;
  }

  getRelatedNodes(node: string): number[] {
    const edges = this.getEdges(node);
    return edges.map((edge) => this.getNode(edge));
  }

  getNodeMeta(el: string, group?: number): GroupMeta | undefined {
    if (!group) return undefined;

    if (this.meta.has(el)) return this.meta.get(el)!;

    const nodeIndex = this.getNode(el);
    if (!nodeIndex) throw Error(`Node ${el} is undefined`);

    const maxIndex = this.getGroup(group);
    if (!maxIndex) throw Error(`Group ${group} is undefined`);

    const edges = this.getEdges(el);
    if (!edges?.length) throw Error(`Edges of ${el} is undefined`);

    const occupiedIndex = edges.map((edge) => this.getNode(edge));
    let span = 1;
    for (let start = nodeIndex + 1; start <= maxIndex; start++) {
      if (!occupiedIndex.includes(start)) {
        span += 1;
        continue;
      }
      break;
    }

    if (nodeIndex + span - 1 > maxIndex) {
      throw Error("Node span is out of bounds");
    }

    const meta = { max: maxIndex, index: nodeIndex, span };
    this.meta.set(el, meta);
    return meta;
  }
}

export class GraphCreator {
  graph: Graph;
  currentGroup?: number;
  activeNodes: Set<string>;

  static instance: GraphCreator;

  constructor() {
    this.graph = Graph.getInstance();
    this.activeNodes = new Set();
  }

  static getInstance() {
    if (this.instance) {
      this.instance.reset();
      return this.instance;
    }
    this.instance = new GraphCreator();
    return this.instance;
  }

  reset() {
    this.graph = Graph.getInstance();
    this.activeNodes = new Set();
    this.currentGroup = undefined;
  }

  handleEl(el: string, type: "start" | "end"): number | undefined {
    if (type === "end") {
      const storedGroup = this.currentGroup;
      this.removeActiveNode(el);
      if (this.currentGroup && !this.activeNodes.size) {
        this.resetGroup();
      }
      return storedGroup;
    }

    if (this.currentGroup && !this.activeNodes.size) {
      this.resetGroup();
    } else if (this.currentGroup && this.activeNodes.size) {
      this.addActiveNode(el);
    } else if (!this.currentGroup && !this.activeNodes.size) {
      this.activeNodes.add(el);
    } else if (!this.currentGroup && this.activeNodes.size === 1) {
      this.createGroup(this.activeNodes.values().next().value!, el);
    } else {
      throw Error("There is something wrong");
    }

    return this.currentGroup;
  }

  createGroup(el1: string, el2: string) {
    this.activeNodes.add(el1);
    this.activeNodes.add(el2);
    this.currentGroup = this.graph.createGroup(el1, el2);
  }

  resetGroup() {
    this.currentGroup = undefined;
  }

  addActiveNode(el: string) {
    if (!this.currentGroup) throw Error("Current group is undefined");
    const spareIndex = this.getEmptyIndex();
    if (spareIndex > this.graph.getGroup(this.currentGroup)) {
      this.graph.setGroup(this.currentGroup, spareIndex);
    }
    this.graph.addNode(this.currentGroup, el, spareIndex);
    this.graph.addEdges(el, Array.from(this.activeNodes));
    this.activeNodes.add(el);
  }

  removeActiveNode(el: string) {
    this.activeNodes.delete(el);
  }

  getEmptyIndex(): number {
    const occupiedIndex: Set<number> = new Set();
    this.activeNodes.forEach((node) => {
      occupiedIndex.add(this.graph.getNode(node));
    });

    const maxIndex = this.graph.getGroup(this.currentGroup!);

    if (occupiedIndex.size + 1 > maxIndex) {
      return occupiedIndex.size + 1;
    }

    for (let startIndex = 1; startIndex <= maxIndex; startIndex++) {
      if (!occupiedIndex.has(startIndex)) {
        return startIndex;
      }
    }

    throw Error("There is no spare index");
  }

  completeGraph() {
    if (this.currentGroup || this.activeNodes.size) {
      throw Error("Cannot complete due to active groups or nodes");
    }
    return this.graph;
  }
}
