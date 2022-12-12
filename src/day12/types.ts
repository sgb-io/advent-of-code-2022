export type NodeType = "start" | "node" | "end";

export interface BaseNode {
  value: number;
  positionKey: string;
  positionArr: number[];
  type: NodeType;
}

export interface Node extends BaseNode {
  topPosition: string | undefined;
  bottomPosition: string | undefined;
  leftPosition: string | undefined;
  rightPosition: string | undefined;
}

type DjikstraGraphItem = Record<string, number>;
export type DjikstraGraph = Record<string, DjikstraGraphItem>;
