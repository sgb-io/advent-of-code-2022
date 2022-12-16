import { parseRawData } from "../utils/parseRawData";

type PacketValue = number | Packet;

type Packet = Array<PacketValue>;

function itemsAreBothNumbers(left: any, right: any): boolean {
  return typeof left === "number" && typeof right === "number";
}

const convertToPacket = (value: PacketValue) =>
  typeof value === "number" ? [value] : value;

function packetPairIsInCorrectOrder(
  left: any[],
  right: any[]
): boolean | undefined {
  for (const [index, leftValue] of left.entries()) {
    const rightValue = right[index];
    if (rightValue === undefined) return false;

    if (itemsAreBothNumbers(leftValue, rightValue)) {
      if (leftValue === rightValue) continue;
      return leftValue < rightValue;
    }

    const isCorrectOrder = packetPairIsInCorrectOrder(
      convertToPacket(leftValue),
      convertToPacket(rightValue)
    );

    if (isCorrectOrder !== undefined) {
      return isCorrectOrder;
    }
  }

  // If the left packet ran out of values, return true, otherwise no order was found
  return left.length < right.length ? true : undefined;
}

// Can't accurately type the pairs, since we eval them, and don't know how deep the arrays go.
function countCorrectOrder(processedPacketPairs: any[]): Map<number, boolean> {
  const results = new Map<number, boolean>();
  processedPacketPairs.forEach(([left, right], pairIndex) => {
    const pairNumber = pairIndex + 1;
    // console.log(`== Pair ${pairNumber} ==`);
    const inOrder = packetPairIsInCorrectOrder(left, right);
    if (inOrder !== false) {
      // console.log(`Pair ${pairNumber} was in order`);
      results.set(pairNumber, true);
    } else {
      // console.log(`Pair ${pairNumber} was NOT IN order`);
    }
    // console.log("\n\n");
  });

  return results;
}

function countHealthyPackets(packetPairs: string[][]) {
  const processedPacketPairs: number[][][] = [];
  packetPairs.forEach((pair) => {
    const convertedPackets: number[][] = [];
    pair.forEach((packet) => {
      convertedPackets.push(eval(packet));
    });
    processedPacketPairs.push(convertedPackets);
  });

  const result = countCorrectOrder(processedPacketPairs);
  const indices = Array.from(result.keys());

  return indices.reduce((total, index) => {
    total += index;
    return total;
  }, 0);
}

function reorderPackets(packetPairs: string[][]) {
  const flatPairs: any[] = packetPairs.reduce((flat, [left, right]) => {
    flat.push(eval(left));
    flat.push(eval(right));
    return flat;
  }, []);

  flatPairs.push([[2]]);
  flatPairs.push([[6]]);

  const sorted = flatPairs.sort((a, b) => {
    if (packetPairIsInCorrectOrder(a, b)) {
      return -1;
    }

    return 1;
  });

  const relevantIndeces = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const pairIndex = i + 1;
    if (Array.isArray(sorted[i]) && Array.isArray(sorted[i][0])) {
      if (
        (sorted[i][0].length === 1 && sorted[i][0][0] === 2) ||
        (sorted[i][0].length === 1 && sorted[i][0][0] === 6)
      ) {
        relevantIndeces.push(pairIndex);
      }
    }
  }

  return relevantIndeces.reduce((total, index) => {
    total = total * index;
    return total;
  }, 1);
}

(async () => {
  const rawData = await parseRawData(__dirname, "input.txt");

  const packetPairs = rawData
    .split("\n\n")
    .map((rawPair: string) => rawPair.split("\n"));
  const part1Answer = countHealthyPackets(packetPairs);

  // Test answer: 13
  // Real answer: 5905
  console.log("Part 1 Answer:", part1Answer);

  // Test answer: 140
  // Real answer: 21691
  const part2Answer = reorderPackets(packetPairs);
  console.log("Part 2 Answer:", part2Answer);
})();
