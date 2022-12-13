import { parseRawData } from "../utils/parseRawData";

// If the left integer is lower than the right integer, the inputs are in the right order.
// If the left integer is higher than the right integer, the inputs are not in the right order.

// If the left list runs out of items first, the inputs are in the right order.
// If the right list runs out of items first, the inputs are not in the right order.

function packetPairIsInCorrectOrder(left: any[], right: any[]): boolean {
  // if (left.length && right.length === 0) {
  //   return false;
  // }

  // if (right.length < left.length) {
  //   console.log("THIS CASE.");
  //   return false;
  //   // return false;
  // }

  for (let i = 0; i < left.length; i += 1) {
    const leftItem = left[i];
    const rightItem = right[i];

    const leftIsArray = Array.isArray(leftItem);
    const rightIsArray = Array.isArray(rightItem);

    if (typeof rightItem === "undefined") {
      return false;
    }

    if (typeof leftItem === "number" && typeof rightItem === "number") {
      if (leftItem === rightItem) {
        continue;
      }

      if (leftItem > rightItem) {
        return false;
      }

      // Pretty certain this case is correct
      if (leftItem < rightItem) {
        console.log("calculated as correct order", leftItem, rightItem);
        return true;
      }
    }

    let leftItemToLoop = leftIsArray ? leftItem : [leftItem];
    let rightItemToLoop = rightIsArray ? rightItem : [rightItem];

    return packetPairIsInCorrectOrder(leftItemToLoop, rightItemToLoop);
  }

  console.log("defaulting to correct order", left, right);
  return true;
}

// Can't accurately type the pairs, since we eval them, and don't know how deep the arrays go.
function countCorrectOrder(processedPacketPairs: any[]): Map<number, boolean> {
  const results = new Map<number, boolean>();
  processedPacketPairs.forEach(([left, right], pairIndex) => {
    const pairNumber = pairIndex + 1;
    if (packetPairIsInCorrectOrder(left, right)) {
      results.set(pairNumber, true);
    }
  });

  return results;
}

function countHealthyPackets(rawData: string) {
  const packetPairs = rawData
    .split("\n\n")
    .map((rawPair: string) => rawPair.split("\n"));

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

  console.log(indices);

  return indices.reduce((total, index) => {
    total += index;
    return total;
  }, 0);
}

(async () => {
  const rawData = await parseRawData(__dirname, "input.txt");

  const part1Answer = countHealthyPackets(rawData);

  // Test answer: 13
  // Real answer: 5905
  console.log("Part 1 Answer:", part1Answer);

  // Test answer:
  // Real answer:
  // console.log("Part 2 Answer:", part2);
})();
