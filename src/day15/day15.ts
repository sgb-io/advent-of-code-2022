import { parseRawData } from "../utils/parseRawData";

function parseCoordinates(section: string) {
  try {
    const x = parseInt(section.match(/x=-?\d+/)![0].replace("x=", ""), 10);
    const y = parseInt(section.match(/y=-?\d+/)![0].replace("y=", ""), 10);
    return [x, y];
  } catch (e) {
    console.error('Cant parse this section "%s"', section);
    throw e;
  }
}

function calculatePositions(lines: string[]): number[][] {
  const positions: number[][] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const [left, right] = lines[i].split(": ");
    const [atX, atY] = parseCoordinates(left);
    const [beaconX, beaconY] = parseCoordinates(right);

    const distance = Math.abs(atX - beaconX) + Math.abs(atY - beaconY);
    positions.push([atX, atY, beaconX, beaconY, distance]);
  }

  return positions;
}

function countUnavailableSpaces(
  sensorPositions: number[][],
  interestingRow: number
) {
  let spaces = 0;

  const xCoords = new Set();

  for (let i = 0; i < sensorPositions.length; i += 1) {
    const [sensorX, sensorY, beaconX, beaconY, distance] = sensorPositions[i];
    if (sensorY === interestingRow) {
      xCoords.add(sensorX);
    }

    if (beaconY === interestingRow) {
      xCoords.add(beaconX);
    }

    for (let x = sensorX - distance; x <= sensorX + distance; x++) {
      if (
        !xCoords.has(x) &&
        Math.abs(sensorX - x) + Math.abs(sensorY - interestingRow) <= distance
      ) {
        xCoords.add(x);
        spaces++;
      }
    }
  }

  return spaces;
}

(async () => {
  const isTest = false;

  const inputFile = isTest ? "test.txt" : "input.txt";
  const rawData = await parseRawData(__dirname, inputFile);

  const lines = rawData.split("\n");

  const positions = calculatePositions(lines);
  const interestingRow = isTest ? 10 : 2_000_000;

  // Test answer: 26
  // Real answer: 4919281
  const part1Answer = countUnavailableSpaces(positions, interestingRow);
  console.log("Part 1 Answer:", part1Answer);

  // Test answer: 56000011
  // Real answer:
  console.log("Part 2 Answer:", "TODO");
})();
