import { parseRawData } from "../utils/parseRawData";

const INTERESTING_CYCLES = [20, 60, 100, 140, 140, 180, 220];

function listenToSignalStrength(rawData: string) {
  const instructions = [...rawData.split("\n")];
  const signalStrenghs: number[] = [];
  const screenPixels: string[][] = [[], [], [], [], [], []]; // 40x6 pixels

  let screenRow = 0;
  let currentRegisterValue = 1;
  let cycles = 0;
  let nextValue: number | undefined = undefined;

  while (instructions.length) {
    cycles += 1;

    if (INTERESTING_CYCLES.includes(cycles)) {
      signalStrenghs.push(currentRegisterValue * cycles);
    }

    // Taking the current register value and cycle, return a . or #
    if (screenPixels[screenRow].length === 40) {
      screenRow += 1;
    }
    const hitZones = [
      currentRegisterValue - 1,
      currentRegisterValue,
      currentRegisterValue + 1,
    ];
    const rowCycle = cycles - screenRow * 40;
    const pixelLit = hitZones.includes(rowCycle - 1);
    screenPixels[screenRow].push(pixelLit ? "#" : ".");

    if (instructions[0] === "noop") {
      instructions.shift();
      continue;
    }

    if (nextValue) {
      currentRegisterValue = currentRegisterValue + nextValue;
      nextValue = undefined;
      instructions.shift();
      continue;
    }

    if (instructions.length) {
      const newValue = parseInt(instructions[0].split(" ")[1], 10);
      nextValue = newValue;
    }
  }

  return {
    signalStrenghs,
    screenPixels,
  };
}

(async () => {
  const rawData = await parseRawData(__dirname, "input.txt");

  const { signalStrenghs, screenPixels } = listenToSignalStrength(rawData);

  // Test answer: 13140
  // Real answer: 12460
  const part1Answer = signalStrenghs.reduce(
    (total, strength) => (total += strength),
    0
  );
  console.log("Part 1 Answer:", part1Answer);

  screenPixels.forEach((line) => {
    console.log(line.join(""));
  }); // Reads as "EZFPRAKL" - pasting into google docs and reducing line height spacing to 0.5 helps!
  const part2Answer = "EZFPRAKL";
  console.log("Part 2 Answer:", part2Answer);
})();
