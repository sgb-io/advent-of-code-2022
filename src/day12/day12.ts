import { parseRawData } from "../utils/parseRawData";
import { dijkstra } from "./djikstra";

import type { BaseNode, DjikstraGraph, Node, NodeType } from "./types";

// convert grid to a graph of numbers (number representing letters)
// use djikstra to find the shortest path, return the number of steps
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

function neighbourIsAccessible(
  currentElavation: number,
  neighbourElavation: number
) {
  return neighbourElavation <= currentElavation + 1;
}

function getNode(graph: BaseNode[], positionKey: String) {
  const node = graph.find((n) => n.positionKey === positionKey);

  if (!node) {
    throw new Error(`Cant find node with key ${positionKey}`);
  }

  return node;
}

function calculateShortestPath(rawData: string) {
  const lines = rawData.split("\n");
  const undecoratedGraph: BaseNode[] = [];
  const decoratedGraph: Node[] = [];
  const rowLength = lines.length;
  const lineLength = lines[0].length;

  for (let i = 0; i < lines.length; i += 1) {
    const lineLetters = lines[i].split("");

    for (let n = 0; n < lineLetters.length; n += 1) {
      const positionKey = `${i}-${n}`;
      let type: NodeType = "node";
      let value = ALPHABET.indexOf(lineLetters[n].toLowerCase());
      if (lineLetters[n] === "S") {
        type = "start";
        value = ALPHABET.indexOf("a");
      }
      if (lineLetters[n] === "E") {
        type = "end";
        value = ALPHABET.indexOf("z");
      }

      undecoratedGraph.push({
        positionKey,
        positionArr: [i, n],
        type,
        value,
      });
    }
  }

  // Decorate items in the graph with the neighbours
  // Note: only T/B/L/R positions are added whe the elavation is acceptable
  for (let i = 0; i < undecoratedGraph.length; i += 1) {
    const [y, x] = undecoratedGraph[i].positionArr;
    const leftPosition = x === 0 ? undefined : `${y}-${x - 1}`;
    const rightPosition = x === lineLength - 1 ? undefined : `${y}-${x + 1}`;
    const topPosition = y === 0 ? undefined : `${y - 1}-${x}`;
    const bottomPosition = y === lines.length - 1 ? undefined : `${y + 1}-${x}`;

    let leftPositionToUse: undefined | string;
    let rightPositionToUse: undefined | string;
    let topPositionToUse: undefined | string;
    let bottomPositionToUse: undefined | string;

    if (leftPosition) {
      const neighbour = getNode(undecoratedGraph, leftPosition);
      if (neighbourIsAccessible(undecoratedGraph[i].value, neighbour.value)) {
        leftPositionToUse = neighbour.positionKey;
      }
    }

    if (rightPosition) {
      const neighbour = getNode(undecoratedGraph, rightPosition);
      if (neighbourIsAccessible(undecoratedGraph[i].value, neighbour.value)) {
        rightPositionToUse = neighbour.positionKey;
      }
    }

    if (topPosition) {
      const neighbour = getNode(undecoratedGraph, topPosition);
      if (neighbourIsAccessible(undecoratedGraph[i].value, neighbour.value)) {
        topPositionToUse = neighbour.positionKey;
      }
    }

    if (bottomPosition) {
      const neighbour = getNode(undecoratedGraph, bottomPosition);
      if (neighbourIsAccessible(undecoratedGraph[i].value, neighbour.value)) {
        bottomPositionToUse = neighbour.positionKey;
      }
    }

    decoratedGraph.push({
      ...undecoratedGraph[i],
      leftPosition: leftPositionToUse,
      rightPosition: rightPositionToUse,
      topPosition: topPositionToUse,
      bottomPosition: bottomPositionToUse,
    });
  }

  // Convert into a simpler data structure for djikstra

  const startNodeIndex = decoratedGraph.findIndex((n) => n.type === "start");
  const startNode = decoratedGraph[startNodeIndex];
  const endNodeIndex = decoratedGraph.findIndex((n) => n.type === "end");
  const endNode = decoratedGraph[endNodeIndex];

  // LEFT (X) = row
  // RIGHT (Y) = col
  const traversibleGraph: DjikstraGraph = decoratedGraph.reduce(
    (graph: DjikstraGraph, item) => {
      const destinations: Record<string, number> = {};
      if (item.leftPosition) {
        destinations[item.leftPosition] = 1;
      }
      if (item.rightPosition) {
        destinations[item.rightPosition] = 1;
      }
      if (item.topPosition) {
        destinations[item.topPosition] = 1;
      }
      if (item.bottomPosition) {
        destinations[item.bottomPosition] = 1;
      }
      graph[item.positionKey] = destinations;
      return graph;
    },
    {}
  );

  // console.log(traversibleGraph);

  const shortestPath = dijkstra.find_path(
    traversibleGraph,
    startNode.positionKey,
    endNode.positionKey
  );

  // console.log(shortestPath, shortestPath.length);

  // Draw the grid
  for (let i = 0; i < rowLength; i += 1) {
    let lineChars = [];
    for (let n = 0; n < lineLength; n += 1) {
      if (shortestPath.includes(`${i}-${n}`)) {
        lineChars.push("#");
      } else {
        lineChars.push(".");
      }
    }
    console.log(lineChars.join(""));
  }

  // Note: it seems there are 2 similar valid routes for the test data

  return shortestPath.length - 1;
}

(async () => {
  const rawData = await parseRawData(__dirname, "input.txt");

  // Test answer: 31
  // Real answer: 383
  const part1Answer = calculateShortestPath(rawData);
  console.log("Part 1 Answer:", part1Answer);

  // Test answer:
  // Real answer:

  const part2Answer = "todo";
  console.log("Part 2 Answer:", part2Answer);
})();
