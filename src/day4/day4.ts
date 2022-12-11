import { parseRawData } from "../utils/parseRawData";

function getCleanupPairs(input: string): string[][] {
  const lines = input.split("\n").filter((line) => line !== "");
  return lines.map((l) => l.split(","));
}

// Most be a "complete" overlap
function pairFullyOverlaps(pair: string[]): boolean {
  // e.g.  '2-25', '24-38'
  const left = pair[0];
  const right = pair[1];

  const leftNums = left.split("-").map((numStr) => parseInt(numStr, 10));
  const rightNums = right.split("-").map((numStr) => parseInt(numStr, 10));

  // Memory-heavy approach, fill arrays will all items that each pair has
  // Check if either contains the other
  // A more lightweight approach involves checking the starts/ends, but that is tricky logic
  const leftFullNums = Array.from(
    { length: leftNums[1] - leftNums[0] + 1 },
    (_x, i) => i + leftNums[0]
  );
  const rightFullNums = Array.from(
    { length: rightNums[1] - rightNums[0] + 1 },
    (_x, i) => i + rightNums[0]
  );

  const leftContainsRight = leftFullNums.every((num) =>
    rightFullNums.includes(num)
  );
  const rightContainsLeft = rightFullNums.every((num) =>
    leftFullNums.includes(num)
  );

  return leftContainsRight || rightContainsLeft || false;
}

// If this was actual code, I'd avoid repeating all this duplicate work
function pairPartiallyOverlaps(pair: string[]): boolean {
  const left = pair[0];
  const right = pair[1];

  const leftNums = left.split("-").map((numStr) => parseInt(numStr, 10));
  const rightNums = right.split("-").map((numStr) => parseInt(numStr, 10));

  // Memory-heavy approach, fill arrays will all items that each pair has
  // Check if either contains the other
  // A more lightweight approach involves checking the starts/ends, but that is tricky logic
  const leftFullNums = Array.from(
    { length: leftNums[1] - leftNums[0] + 1 },
    (_x, i) => i + leftNums[0]
  );
  const rightFullNums = Array.from(
    { length: rightNums[1] - rightNums[0] + 1 },
    (_x, i) => i + rightNums[0]
  );

  const leftContainsRight = leftFullNums.some((num) =>
    rightFullNums.includes(num)
  );
  const rightContainsLeft = rightFullNums.some((num) =>
    leftFullNums.includes(num)
  );

  return leftContainsRight || rightContainsLeft || false;
}

function countFullyOverlappingPairs(pairs: string[][]): number {
  let total = 0;

  for (let i = 0; i < pairs.length; i += 1) {
    if (pairFullyOverlaps(pairs[i])) {
      total += 1;
    }
  }

  return total;
}

function countPartiallyOverlappingPairs(pairs: string[][]): number {
  let total = 0;

  for (let i = 0; i < pairs.length; i += 1) {
    if (pairPartiallyOverlaps(pairs[i])) {
      total += 1;
    }
  }

  return total;
}

(async () => {
  const rawData = await parseRawData(__dirname, "input.txt");
  const pairs = getCleanupPairs(rawData);

  const part1Answer = countFullyOverlappingPairs(pairs);
  console.log("Part 1 Answer:", part1Answer);

  const part2Answer = countPartiallyOverlappingPairs(pairs);
  console.log("Part 2 Answer:", part2Answer);
})();
