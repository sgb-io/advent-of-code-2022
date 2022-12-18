import { memoize } from "lodash";
import { parseRawData } from "../utils/parseRawData";

type Coordinates = number[];

type CoordinatesSet = Coordinates[];

// Other perf ideas: rocks are passed around, but they are very static

// This is currently taking about 0.7ms per calculation - way too slow
// function positionIsOccupied(
//   position: Coordinates,
//   rocks: CoordinatesSet,
//   settledSand: CoordinatesSet
// ): boolean {
//   const positionStr = `${position[0]}-${position[1]}`;
//   const rocksStr = rocks.map((r) => r.join("-"));
//   if (rocksStr.includes(positionStr)) {
//     return true;
//   }

//   const settledSandStr = settledSand.map((r) => r.join("-"));
//   if (settledSandStr.includes(positionStr)) {
//     return true;
//   }

//   return false;
// }
function positionIsOccupied(
  position: Coordinates,
  rocks: CoordinatesSet,
  settledSand: CoordinatesSet
): boolean {
  const positionStr = `${position[0]}-${position[1]}`;

  for (let i = 0; i < rocks.length; i += 1) {
    if (rocks[i][0] === position[0] && rocks[i][1] === position[1]) {
      return true;
    }
  }

  for (let n = 0; n < settledSand.length; n += 1) {
    if (
      settledSand[n][0] === position[0] &&
      settledSand[n][1] === position[1]
    ) {
      return true;
    }
  }

  return false;
}

const positionIsOccupiedMemo = memoize(positionIsOccupied);

function getPotentialPositions(position: Coordinates) {
  const [col, row] = position;
  return [
    [col, row + 1],
    [col - 1, row + 1],
    [col + 1, row + 1],
  ];
}

const getPotentialPositionsMemo = memoize(getPotentialPositions);

function sandCanMove(
  sandPosition: Coordinates,
  rocks: CoordinatesSet,
  settledSand: CoordinatesSet
) {
  // console.time("getPotentialPositionsMemo");
  const [down, downLeft, downRight] = getPotentialPositionsMemo(sandPosition);
  // console.timeEnd("getPotentialPositionsMemo");
  // console.time("downIsAvailable");
  const downIsAvailable = !positionIsOccupiedMemo(down, rocks, settledSand);
  // console.timeEnd("downIsAvailable");
  // console.time("downLeftIsAvailable");
  const downLeftIsAvailable = !positionIsOccupiedMemo(
    downLeft,
    rocks,
    settledSand
  );
  // console.timeEnd("downLeftIsAvailable");
  // console.time("downRightIsAvailable");
  const downRightIsAvailable = !positionIsOccupiedMemo(
    downRight,
    rocks,
    settledSand
  );
  // console.timeEnd("downRightIsAvailable");

  return {
    downIsAvailable,
    downLeftIsAvailable,
    downRightIsAvailable,
  };
}

const sandCanMoveMemo = memoize(sandCanMove);

function getBottomBoundaryOfRocks(rocks: CoordinatesSet) {
  let highestVerticalDigit = 0;

  rocks.forEach((rock) => {
    if (rock[1] > highestVerticalDigit) {
      highestVerticalDigit = rock[1];
    }
  });

  return highestVerticalDigit;
}

const getBottomBoundaryOfRocksMemo = memoize(getBottomBoundaryOfRocks);

interface NextPositionStep {
  action: "settle" | "move" | "abyss" | "blocked";
  sandPosition: Coordinates;
}

// Everything within calculateNextSandPosition() is slow
// It is also increasing over time as settled sand grows
function calculateNextSandPosition(
  rocks: CoordinatesSet,
  settledSand: CoordinatesSet
): NextPositionStep {
  let sandPosition = [500, 0];
  let moving = true;
  const bottomBoundary = getBottomBoundaryOfRocksMemo(rocks);

  while (moving) {
    const [col, row] = sandPosition;
    const { downIsAvailable, downLeftIsAvailable, downRightIsAvailable } =
      sandCanMoveMemo(sandPosition, rocks, settledSand);

    if (
      col === 500 &&
      row === 0 &&
      !downIsAvailable &&
      !downRightIsAvailable &&
      !downLeftIsAvailable
    ) {
      return {
        action: "blocked",
        sandPosition,
      };
    }

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
      continue;
    }

    if (!downIsAvailable && downLeftIsAvailable) {
      sandPosition = [col - 1, row + 1];
      continue;
    }

    if (!downIsAvailable && !downLeftIsAvailable && downRightIsAvailable) {
      sandPosition = [col + 1, row + 1];
      continue;
    }
  }

  return {
    action: "move",
    sandPosition,
  };
}

function simulateSand(rocks: CoordinatesSet): CoordinatesSet {
  // Rocks are the boundaries
  // Sand falls from 500,0
  const settledSand: CoordinatesSet = [];

  let pathwaysFilled = false;

  while (pathwaysFilled === false) {
    // if the next sand co-ordinate is vertically below the lowest rocks, assume abyss reached
    const { action, sandPosition } = calculateNextSandPosition(
      rocks,
      settledSand
    );

    if (action === "abyss") {
      console.log("Abyss detected - exiting movement loop");
      pathwaysFilled = true;
      continue;
    }

    if (action === "blocked") {
      console.log("Blockage detected - exiting movement loop");
      settledSand.push([500, 0]);
      pathwaysFilled = true;
      continue;
    }

    if (action === "settle") {
      // console.log("A piece of sand settled..", sandPosition);
      settledSand.push(sandPosition);
    }
  }

  console.timeEnd("simulateSand");

  return settledSand;
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

function addFloor(
  rockCoordinates: CoordinatesSet,
  start: number,
  end: number
): CoordinatesSet {
  const mutatedCoords = [...rockCoordinates];
  let highestRowNumber = 0;

  for (let i = 0; i < mutatedCoords.length; i += 1) {
    const [_col, row] = mutatedCoords[i];
    if (row > highestRowNumber) {
      highestRowNumber = row;
    }
  }

  highestRowNumber = highestRowNumber + 2;

  // Adding a static amount to the right-most rock doesn't seem to work
  // The number of rows below that could be huge and it could diaganolly down the whole way
  const startToUse = start - 500;
  const endToUse = end + 500;

  for (let n = startToUse; n < endToUse; n += 1) {
    mutatedCoords.push([n, highestRowNumber]);
  }

  return mutatedCoords;
}

function drawRocks(
  rockCoordinates: CoordinatesSet,
  sandCoordinates?: CoordinatesSet
) {
  let minCol = 500;
  let maxCol = 500;
  let minRow = 0;
  let maxRow = 9;

  const rockHits = new Set<string>();
  const sandHits = new Set<string>();

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

  if (sandCoordinates) {
    for (let i = 0; i < sandCoordinates.length; i += 1) {
      const [col, row] = sandCoordinates[i];
      sandHits.add(`${col}-${row}`);
    }
  }

  console.log("  4     5  5");
  console.log("  9     0  0");
  console.log("  4     0  3");

  for (let i = minRow; i <= maxRow; i += 1) {
    const rowNum = i < 10 ? `0${i}` : i;
    let line = `${rowNum} `;
    for (let n = minCol; n <= maxCol; n += 1) {
      if (rockHits.has(`${n}-${i}`)) {
        line += "#";
        continue;
      }
      if (sandHits.has(`${n}-${i}`)) {
        line += "o";
        continue;
      }
      line += ".";
    }
    console.log(line);
  }
}

function calculateHorizontalLimits(rockCoordinates: CoordinatesSet) {
  let minLeft = 500;
  let maxRight = 500;
  for (let i = 0; i < rockCoordinates.length; i += 1) {
    const [col, row] = rockCoordinates[i];
    if (col < minLeft) {
      minLeft = col;
    }
    if (col > maxRight) {
      maxRight = col;
    }
  }

  return [minLeft, maxRight];
}

(async () => {
  const rawData = await parseRawData(__dirname, "input.txt");

  const lines = rawData
    .split("\n")
    .map((rawPair: string) => rawPair.split(" -> "));
  const rockCoordinates = calculateRockCoordinates(lines);

  // The floor should be theoretically infinity, but 85*2 is wide enough for the data
  const [minLeft, maxRight] = calculateHorizontalLimits(rockCoordinates);
  const rockCoordsWithFloor = addFloor(rockCoordinates, minLeft, maxRight);

  // Draw the rocks
  drawRocks(rockCoordsWithFloor);

  // Test answer: 24
  // Real answer: 961
  const part1Answer = simulateSand(rockCoordinates);
  console.log("Part 1 Answer:", part1Answer.length);

  // Test answer: 93
  // 3549 is incorrect
  // Real answer:
  const simulated = simulateSand(rockCoordsWithFloor);
  drawRocks(rockCoordsWithFloor, simulated);
  const part2Answer = simulated.length;
  console.log("Part 2 Answer:", part2Answer);
})();
