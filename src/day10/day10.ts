import { parseRawData } from "../utils/parseRawData";

const INTERESTING_CYCLES = [20, 60, 100, 140, 140, 180, 220];

function listenToSignalStrength(rawData: string) {
  const instructions = [...rawData.split("\n")];
  const signalStrenghs: number[] = [];
  let currentRegisterValue = 1;
  let cycles = 0;
  let nextValue: number | undefined = undefined;

  while (instructions.length) {
    cycles += 1;

    if (INTERESTING_CYCLES.includes(cycles)) {
      signalStrenghs.push(currentRegisterValue * cycles);
    }

    if (instructions[0] === "noop") {
      // console.log(
      //   "cycle",
      //   cycles,
      //   `(register value ${currentRegisterValue} unchanged - noop)`
      // );
      instructions.shift();
      continue;
    }

    if (nextValue) {
      // console.log(
      //   "cycle",
      //   cycles,
      //   `${currentRegisterValue} => ${currentRegisterValue + nextValue}`
      // );
      currentRegisterValue = currentRegisterValue + nextValue;
      nextValue = undefined;
      instructions.shift();
      continue;
    }

    if (instructions.length) {
      const newValue = parseInt(instructions[0].split(" ")[1], 10);
      nextValue = newValue;
      // console.log(
      //   "cycle",
      //   cycles,
      //   `(register value ${currentRegisterValue} unchanged, but nextValue has been set to ${nextValue})`
      // );
    }
  }

  console.log(cycles, "cycles,", "register value", currentRegisterValue);

  return signalStrenghs;
}

(async () => {
  const rawData = await parseRawData(__dirname, "input.txt");

  const signalStrenghs = listenToSignalStrength(rawData);

  // Test answer: 13140
  const part1Answer = signalStrenghs.reduce(
    (total, strength) => (total += strength),
    0
  );
  console.log("Part 1 Answer:", part1Answer);

  const part2Answer = "todo";
  console.log("Part 2 Answer:", part2Answer);
})();
