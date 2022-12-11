import { parseRawData } from "../utils/parseRawData";

enum OppositionShapes {
  ROCK = "A",
  PAPER = "B",
  SCISSORS = "C",
}

enum PlayerShapes {
  ROCK = "X",
  PAPER = "Y",
  SCISSORS = "Z",
}

enum DecryptionOutcomes {
  LOSS = "X",
  DRAW = "Y",
  WIN = "Z",
}

enum RoundOutcomes {
  LOSS = "LOSS",
  DRAW = "DRAW",
  WIN = "WIN",
}

type Instruction = [OppositionShapes, PlayerShapes];

type EncryptedInstruction = [OppositionShapes, DecryptionOutcomes];

interface AllRoundOutcomes {
  [OppositionShapes.ROCK]: Record<PlayerShapes, RoundOutcomes>;
  [OppositionShapes.PAPER]: Record<PlayerShapes, RoundOutcomes>;
  [OppositionShapes.SCISSORS]: Record<PlayerShapes, RoundOutcomes>;
}

const ALL_ROUND_OUTCOMES: AllRoundOutcomes = {
  [OppositionShapes.ROCK]: {
    [PlayerShapes.ROCK]: RoundOutcomes.DRAW,
    [PlayerShapes.PAPER]: RoundOutcomes.WIN,
    [PlayerShapes.SCISSORS]: RoundOutcomes.LOSS,
  },
  [OppositionShapes.PAPER]: {
    [PlayerShapes.ROCK]: RoundOutcomes.LOSS,
    [PlayerShapes.PAPER]: RoundOutcomes.DRAW,
    [PlayerShapes.SCISSORS]: RoundOutcomes.WIN,
  },
  [OppositionShapes.SCISSORS]: {
    [PlayerShapes.ROCK]: RoundOutcomes.WIN,
    [PlayerShapes.PAPER]: RoundOutcomes.LOSS,
    [PlayerShapes.SCISSORS]: RoundOutcomes.DRAW,
  },
};

interface AllInstructionEncryptions {
  [OppositionShapes.ROCK]: Record<DecryptionOutcomes, PlayerShapes>;
  [OppositionShapes.PAPER]: Record<DecryptionOutcomes, PlayerShapes>;
  [OppositionShapes.SCISSORS]: Record<DecryptionOutcomes, PlayerShapes>;
}

const INSTRUCTION_ENCRYPTION: AllInstructionEncryptions = {
  [OppositionShapes.ROCK]: {
    [DecryptionOutcomes.DRAW]: PlayerShapes.ROCK,
    [DecryptionOutcomes.LOSS]: PlayerShapes.SCISSORS,
    [DecryptionOutcomes.WIN]: PlayerShapes.PAPER,
  },
  [OppositionShapes.PAPER]: {
    [DecryptionOutcomes.DRAW]: PlayerShapes.PAPER,
    [DecryptionOutcomes.LOSS]: PlayerShapes.ROCK,
    [DecryptionOutcomes.WIN]: PlayerShapes.SCISSORS,
  },
  [OppositionShapes.SCISSORS]: {
    [DecryptionOutcomes.DRAW]: PlayerShapes.SCISSORS,
    [DecryptionOutcomes.LOSS]: PlayerShapes.PAPER,
    [DecryptionOutcomes.WIN]: PlayerShapes.ROCK,
  },
};

const SCORING = {
  [PlayerShapes.ROCK]: 1,
  [PlayerShapes.PAPER]: 2,
  [PlayerShapes.SCISSORS]: 3,
  [RoundOutcomes.LOSS]: 0,
  [RoundOutcomes.DRAW]: 3,
  [RoundOutcomes.WIN]: 6,
};

function parseStrategyGuide<T extends [string, string]>(rawGuide: string): T[] {
  return rawGuide.split("\r\n").map((rawInstruction) => {
    return rawInstruction.split(" ") as T;
  });
}

function calculateRoundScore(instruction: Instruction): number {
  const [oppositionShape, playerShape] = instruction;
  const shapeScore = SCORING[playerShape];
  const roundOutcome = ALL_ROUND_OUTCOMES[oppositionShape][playerShape];
  const roundScore = SCORING[roundOutcome];

  return shapeScore + roundScore;
}

function calculateStrategyGuideScore(instructions: Instruction[]): number {
  return instructions.reduce((runningTotal, instruction) => {
    runningTotal += calculateRoundScore(instruction);
    return runningTotal;
  }, 0);
}

function decryptInstruction(instruction: EncryptedInstruction): Instruction {
  const [oppositionShape, desiredOutcome] = instruction;
  const playerShapeToShow =
    INSTRUCTION_ENCRYPTION[oppositionShape][desiredOutcome];

  return [oppositionShape, playerShapeToShow];
}

function calculateDecryptedStrategyGuideScore(
  instructions: EncryptedInstruction[]
): number {
  // Need to calculate our shape this time
  return instructions.reduce((runningTotal, encryptedInstruction) => {
    const instruction = decryptInstruction(encryptedInstruction);
    runningTotal += calculateRoundScore(instruction);
    return runningTotal;
  }, 0);
}

(async () => {
  const rawData = await parseRawData(__dirname, "input.txt");
  const instructions = parseStrategyGuide<Instruction>(rawData);

  const part1Answer = calculateStrategyGuideScore(instructions);
  console.log("Part 1 Answer:", part1Answer);

  const encryptedInstructions =
    parseStrategyGuide<EncryptedInstruction>(rawData);
  const part2Answer = calculateDecryptedStrategyGuideScore(
    encryptedInstructions
  );
  console.log("Part 2 Answer:", part2Answer);
})();
