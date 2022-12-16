import { parseRawData } from "../utils/parseRawData";

type Coordinates = number[];

type CoordinatesSet = Coordinates[];

function positionIsOccupied(
  position: Coordinates,
  rocks: CoordinatesSet,
  settledSand: CoordinatesSet
): boolean {
  const positionStr = `${position[0]}-${position[1]}`;
  const rocksStr = rocks.map((r) => r.join("-"));
  if (rocksStr.includes(positionStr)) {
    return true;
  }

  const settledSandStr = settledSand.map((r) => r.join("-"));
  if (settledSandStr.includes(positionStr)) {
    return true;
  }

  return false;
}

function getPotentialPositions(position: Coordinates) {
  const [col, row] = position;
  return [
    [col, row + 1],
    [col - 1, row + 1],
    [col + 1, row + 1],
  ];
}

function sandCanMove(
  sandPosition: Coordinates,
  rocks: CoordinatesSet,
  settledSand: CoordinatesSet
) {
  const [down, downLeft, downRight] = getPotentialPositions(sandPosition);
  const downIsAvailable = !positionIsOccupied(down, rocks, settledSand);
  const downLeftIsAvailable = !positionIsOccupied(downLeft, rocks, settledSand);
  const downRightIsAvailable = !positionIsOccupied(
    downRight,
    rocks,
    settledSand
  );

  return {
    downIsAvailable,
    downLeftIsAvailable,
    downRightIsAvailable,
  };
}

function getBottomBoundaryOfRocks(rocks: CoordinatesSet) {
  let highestVerticalDigit = 0;

  rocks.forEach((rock) => {
    if (rock[1] > highestVerticalDigit) {
      highestVerticalDigit = rock[1];
    }
  });

  return highestVerticalDigit;
}

interface NextPositionStep {
  action: "settle" | "move" | "abyss";
  sandPosition: Coordinates;
}

function calculateNextSandPosition(
  rocks: CoordinatesSet,
  settledSand: CoordinatesSet
): NextPositionStep {
  // Starts at 500,0
  let sandPosition = [500, 0];
  let moving = true;
  const bottomBoundary = getBottomBoundaryOfRocks(rocks);

  // console.log(rocks, bottomBoundary);

  while (moving) {
    const [col, row] = sandPosition;
    const { downIsAvailable, downLeftIsAvailable, downRightIsAvailable } =
      sandCanMove(sandPosition, rocks, settledSand);
    console.log(
      `At position ${sandPosition}: ${downIsAvailable}, ${downLeftIsAvailable}, ${downRightIsAvailable}`
    );
    if (!downIsAvailable && !downLeftIsAvailable && !downRightIsAvailable) {
      moving = false;
      return {
        action: "settle",
        sandPosition,
      };
    }

    // Abyss
    if (row > bottomBoundary + 2) {
      moving = false;
      return {
        action: "abyss",
        sandPosition,
      };
    }

    if (downIsAvailable) {
      sandPosition = [col, row + 1];
      console.log("adjutsing pos down 1", sandPosition);
      // moving = false;
      continue;
    }

    if (!downIsAvailable && downLeftIsAvailable) {
      sandPosition = [col - 1, row + 1];
      // moving = false;
      continue;
    }

    if (!downIsAvailable && !downLeftIsAvailable && downRightIsAvailable) {
      sandPosition = [col + 1, row + 1];
      // moving = false;
      continue;
    }

    console.log("got here - y");
  }

  // return sandPosition;
  return {
    action: "move",
    sandPosition,
  };

  // return undefined if abyss
}

function simulateSand(rocks: CoordinatesSet): number {
  // Rocks are the boundaries
  // Sand falls from 500,0
  const settledSand: CoordinatesSet = [];

  let pathwaysFilled = false;

  const a = calculateNextSandPosition(rocks, settledSand);
  const b = calculateNextSandPosition(rocks, settledSand);
  console.log("TODO do stuff with settled sand", a, b);

  // while (pathwaysFilled === false) {
  //   // if the next sand co-ordinate is vertically below the lowest rocks, assume abyss reached
  //   const { action, sandPosition } = calculateNextSandPosition(
  //     rocks,
  //     settledSand
  //   );

  //   if (action === "abyss") {
  //     console.log("Abyss detected - existing movement  loop");
  //     pathwaysFilled = true;
  //     continue;
  //   }

  //   if (action === "settle") {
  //     settledSand.push(sandPosition);
  //   }
  // }

  return settledSand.length;
}

function calculateRockCoordinates(lines: string[][]): CoordinatesSet {
  const coords: CoordinatesSet = [];

  for (let i = 0; i < lines.length; i += 1) {
    for (let n = 0; n < lines[i].length; n += 1) {
      const rock = lines[i][n];
      // If there's a previous rock, draw a line
      if (rock && lines[i][n - 1]) {
        const previousRock = lines[i][n - 1];
        const [prevRockCol, prevRockRow] = previousRock
          .split(",")
          .map((c) => parseInt(c, 10));
        const [currRockCol, currRockRow] = rock
          .split(",")
          .map((c) => parseInt(c, 10));

        if (prevRockCol === currRockCol) {
          // Vertical line
          const items = Array.from({
            length: Math.abs(currRockRow - prevRockRow) + 1,
          });
          const increment = currRockRow > prevRockRow;
          items.forEach((_item, index) => {
            const rowNum = increment
              ? prevRockRow + index
              : prevRockRow - index;
            coords.push([currRockCol, rowNum]);
          });
        } else {
          // Horizontal line
          const items = Array.from({
            length: Math.abs(currRockCol - prevRockCol) + 1,
          });
          const increment = currRockCol > prevRockCol;
          items.forEach((_item, index) => {
            const colNum = increment
              ? prevRockCol + index
              : prevRockCol - index;
            coords.push([colNum, currRockRow]);
          });
        }
      }
    }
  }

  return coords;
}

function drawRocks(rockCoordinates: CoordinatesSet) {
  let minCol = 500;
  let maxCol = 500;
  let minRow = 0;
  let maxRow = 9;

  const rockHits = new Set<string>();

  for (let i = 0; i < rockCoordinates.length; i += 1) {
    const [col, row] = rockCoordinates[i];
    if (col < minCol) {
      minCol = col;
    }

    if (col > maxCol) {
      maxCol = col;
    }

    if (row < minRow) {
      minRow = col;
    }

    if (row > maxRow) {
      maxRow = row;
    }
    rockHits.add(`${col}-${row}`);
  }

  const numCols = Math.abs(maxCol - minCol - 500);
  const numRows = Math.abs(maxRow - minRow);

  console.log("  4     5  5");
  console.log("  9     0  0");
  console.log("  4     0  3");

  for (let i = minRow; i <= maxRow; i += 1) {
    let line = `${i} `;
    for (let n = minCol; n <= maxCol; n += 1) {
      if (rockHits.has(`${n}-${i}`)) {
        line += "#";
      } else {
        line += ".";
      }
    }
    console.log(line);
  }
}

(async () => {
  const rawData = await parseRawData(__dirname, "test.txt");

  const lines = rawData
    .split("\n")
    .map((rawPair: string) => rawPair.split(" -> "));
  const rockCoordinates = calculateRockCoordinates(lines);
  console.log("rockCoordinates", rockCoordinates);

  // Draw the rocks
  drawRocks(rockCoordinates);

  // const part1Answer = simulateSand(rockCoordinates);
  const part1Answer = "todo";

  // Test answer: 13
  // Real answer: 5905
  console.log("Part 1 Answer:", part1Answer);

  // Test answer:
  // Real answer:
  const part2Answer = "todo";
  console.log("Part 2 Answer:", part2Answer);
})();
