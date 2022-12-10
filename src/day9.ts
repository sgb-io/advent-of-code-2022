import { resolve } from "path";
import { promises as fs } from "fs";

// Assume that T, H and s are all the same at the start

type Direction = "U" | "D" | "L" | "R";
type Move = [Direction, number];

function applySingleMove(
  existingPosition: number[],
  direction: Direction
): number[] {
  switch (direction) {
    case "L":
      return [existingPosition[0] - 1, existingPosition[1]];
    case "R":
      return [existingPosition[0] + 1, existingPosition[1]];
    case "U":
      return [existingPosition[0], existingPosition[1] - 1];
    case "D":
      return [existingPosition[0], existingPosition[1] + 1];
    default:
      throw new Error(`Unrecognised direction "${direction}"`);
  }
}

interface MoveSteps {
  headSteps: number[][];
  tailSteps: number[][];
}

function applyHeadMove(
  headPosition: number[],
  tailPosition: number[],
  direction: Direction,
  num: number
): MoveSteps {
  const headSteps: number[][] = [];
  const tailSteps: number[][] = [];

  let updatedHeadPosition = headPosition;
  let updatedTailPosition = tailPosition;

  for (let i = 0; i < num; i += 1) {
    // move head, repeat for tail, but check if tail needs to move in two axis for 0
    const updatedHeadPos = applySingleMove(updatedHeadPosition, direction);
    headSteps.push(updatedHeadPos);
    updatedHeadPosition = [...updatedHeadPos];

    const horizontalGap = Math.abs(updatedHeadPos[0] - updatedTailPosition[0]);
    const verticalGap = Math.abs(updatedHeadPos[1] - updatedTailPosition[1]);

    // Diaganol A - need to shift up or down 1 before moving in the move's direction
    if (
      (direction === "R" || direction === "L") &&
      horizontalGap > 1 &&
      verticalGap > 0
    ) {
      const firstMoveDirection: Direction =
        updatedHeadPos[1] < updatedTailPosition[1] ? "U" : "D";
      // the first diaganol A shift should be U
      console.log(
        "DIAGANOL A SHIFT DIRECTION",
        firstMoveDirection,
        "based on",
        updatedHeadPos[1],
        updatedTailPosition[1]
      );
      const firstStep = applySingleMove(
        updatedTailPosition,
        firstMoveDirection
      );
      const secondStep = applySingleMove(firstStep, direction);
      tailSteps.push(secondStep);
      updatedTailPosition = [...secondStep];

      console.log("*****************************");
      console.log(
        "(diaganol A) for move",
        direction,
        num,
        "headSteps were",
        headSteps
      );
      console.log(
        "(diaganol A) for move",
        direction,
        num,
        "tailSteps were",
        tailSteps
      );
      console.log("*****************************");

      continue;
    }

    // Diaganol B
    if (
      (direction === "U" || direction === "D") &&
      horizontalGap > 0 &&
      verticalGap > 1
    ) {
      const firstMoveDirection: Direction =
        updatedHeadPos[0] > updatedTailPosition[0] ? "R" : "L";
      const firstStep = applySingleMove(
        updatedTailPosition,
        firstMoveDirection
      );
      const secondStep = applySingleMove(firstStep, direction);
      tailSteps.push(secondStep);
      updatedTailPosition = [...secondStep];

      console.log("*****************************");
      console.log(
        "(diaganol B) for move",
        direction,
        num,
        "headSteps were",
        headSteps
      );
      console.log(
        "(diaganol B) for move",
        direction,
        num,
        "tailSteps were",
        tailSteps
      );
      console.log("*****************************");

      continue;
    }

    if (verticalGap === 0 && horizontalGap === 1) {
      continue;
    }

    if (verticalGap === 1 && horizontalGap === 0) {
      continue;
    }

    if (verticalGap === 1 && horizontalGap === 1) {
      continue;
    }

    // Simple horizontal or vertical tail moves
    const updatedTailPos = applySingleMove(updatedTailPosition, direction);
    tailSteps.push(updatedTailPos);
    updatedTailPosition = tailSteps.length
      ? [...updatedTailPos]
      : updatedTailPosition;
  }

  console.log("updatedTailPosition", updatedTailPosition);
  console.log("*****************************");
  console.log("for move", direction, num, "headSteps were", headSteps);
  console.log("for move", direction, num, "tailSteps were", tailSteps);
  console.log("*****************************");

  return {
    headSteps,
    tailSteps,
  };
}

function simulateMotion(rawRopes: string) {
  const moves: Move[] = rawRopes.split("\n").map((line: string) => {
    const [direction, num] = line.split(" ");
    return [direction as Direction, parseInt(num, 10)];
  });

  // TODO maybe the total is always at least 1 to account for start position

  // X (Horizontal pos), Y (Vertical pos)
  const allTailPositions: number[][] = [[0, 0]];
  let headPosition = [0, 0];
  let tailPosition = [0, 0];

  moves.forEach(([direction, num]) => {
    // Update tail position, according to current position plus the move

    // Calcualte the new head position
    const { headSteps, tailSteps } = applyHeadMove(
      headPosition,
      tailPosition,
      direction,
      num
    );

    // Update the current positions
    headPosition = headSteps.length
      ? [...headSteps[headSteps.length - 1]]
      : headPosition;
    tailPosition = tailSteps.length
      ? [...tailSteps[tailSteps.length - 1]]
      : tailPosition;

    // Track the tail position
    tailSteps.forEach((mv) => {
      allTailPositions.push([...mv]);
    });
  });

  const uniquePositions = new Set();
  allTailPositions.forEach((pos) => uniquePositions.add(`${pos[0]},${pos[1]}`));

  return uniquePositions.size;
}

(async () => {
  const rawRopes = await fs.readFile(resolve(__dirname, "./day9test.txt"), {
    encoding: "utf-8",
  });

  const positionsVisited = simulateMotion(rawRopes);

  // Part 1 test answer: 13
  // 6502 is too high
  // Part 1 real answer:
  const part1Answer = positionsVisited;
  console.log("Part 1 Answer:", part1Answer);

  if (part1Answer !== 13) {
    throw new Error(
      `Part 1 answer against test data should equal 13, got ${part1Answer}`
    );
  }

  // Part 2 test answer:
  // Part 2 real answer:
  const part2Answer = "todo";
  console.log("Part 2 Answer:", part2Answer);
})();
