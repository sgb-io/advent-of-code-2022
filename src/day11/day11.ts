import { parseRawData } from "../utils/parseRawData";

type Operand = "old" | number;
interface Monkey {
  startingItems: number[];
  operation: {
    type: "multiply" | "add";
    operand: Operand;
  };
  testDivisibleBy: number;
  testPassTarget: number;
  testFailTarget: number;
  inspectionCount: number;
}

function parseMonkeys(rawData: string): Monkey[] {
  const monkeys: Monkey[] = [];

  const monkeyBlocks = rawData
    .split(/Monkey \d:/)
    .filter((c) => c !== "")
    .map((c) => c.split("\n"))
    .map((block) => {
      return block.map((c) => c.trim()).filter((c) => c !== "");
    });

  monkeyBlocks.forEach((rawMonkey) => {
    const startingItems = rawMonkey[0]
      .replace("Starting items: ", "")
      .split(", ")
      .map((c) => parseInt(c, 10));
    const operationRaw = rawMonkey[1]
      .replace("Operation: new = old ", "")
      .split(" ");
    const operationType = operationRaw[0] === "*" ? "multiply" : "add";
    const operationOperand =
      operationRaw[1] === "old" ? "old" : parseInt(operationRaw[1], 10);
    const testDivisibleBy = parseInt(
      rawMonkey[2].replace("Test: divisible by ", ""),
      10
    );
    const testPassTarget = parseInt(
      rawMonkey[3].replace("If true: throw to monkey ", ""),
      10
    );
    const testFailTarget = parseInt(
      rawMonkey[4].replace("If false: throw to monkey ", ""),
      10
    );

    monkeys.push({
      startingItems,
      operation: {
        type: operationType,
        operand: operationOperand,
      },
      testDivisibleBy,
      testPassTarget,
      testFailTarget,
      inspectionCount: 0,
    });
  });

  return monkeys;
}

function calculateRound(
  monkeys: Monkey[],
  reduceWorryLevels: boolean
): Monkey[] {
  const roundMonkeys = [...monkeys]; // Mutable version of the monkeys

  for (let i = 0; i < roundMonkeys.length; i += 1) {
    const currentMonkey = roundMonkeys[i];

    // console.log(`Monkey ${i}`);

    for (let n = 0; n < currentMonkey.startingItems.length; n += 1) {
      const currentItem = currentMonkey.startingItems[n];
      const monkeyOperand =
        currentMonkey.operation.operand === "old"
          ? currentItem
          : currentMonkey.operation.operand;
      const itemWorry =
        currentMonkey.operation.type === "multiply"
          ? currentItem * monkeyOperand
          : currentItem + monkeyOperand;
      const reducedItemWorry = reduceWorryLevels
        ? Math.floor(itemWorry / 3)
        : itemWorry;

      // TODO the problem is that we're reaching Infinity
      if (reducedItemWorry > 1_000_000) {
        console.log(reducedItemWorry);
      }
      const passesTest = reducedItemWorry % currentMonkey.testDivisibleBy === 0;
      const throwTarget = passesTest
        ? currentMonkey.testPassTarget
        : currentMonkey.testFailTarget;

      // Increment inspection count
      currentMonkey.inspectionCount += 1;

      // const isDivisible = passesTest ? "is" : "is NOT";
      // console.log(`
      //   Monkey inspects an item with a worry level of ${currentItem}.
      //   Worry level has "${currentMonkey.operation.type}" "${monkeyOperand}" applied, to ${itemWorry}.
      //   Monkey gets bored with item. Worry level is divided by 3 to ${reducedItemWorry}.
      //   Current worry level ${isDivisible} divisible by ${currentMonkey.testDivisibleBy}.
      //   Item with worry level ${reducedItemWorry} is thrown to monkey ${throwTarget}.
      // `);

      roundMonkeys[throwTarget].startingItems.push(reducedItemWorry);
    }

    // Remove the starting items that just got thrown
    roundMonkeys[i].startingItems = [
      ...roundMonkeys[i].startingItems.slice(
        currentMonkey.startingItems.length,
        roundMonkeys[i].startingItems.length - 1
      ),
    ];
  }

  return roundMonkeys;
}

const ROUNDS_TO_PRINT = [
  0, 19, 999, 1999, 2999, 3999, 4999, 5999, 6999, 7999, 8999, 9999,
];

function calculateMonkeyBusiness(
  numRounds: number,
  monkeys: Monkey[],
  reduceWorryLevels: boolean
): number {
  // Increment how many items each monkey inspected over 20 rounds
  let roundMonkeys = monkeys;
  for (let i = 0; i < numRounds; i += 1) {
    const roundOutcome = calculateRound(roundMonkeys, reduceWorryLevels);
    if (ROUNDS_TO_PRINT.includes(i)) {
      console.log(`
    == After round ${i + 1} ==
    Monkey 0 inspected items ${roundOutcome[0].inspectionCount} times.
    Monkey 1 inspected items ${roundOutcome[1].inspectionCount} times.
    Monkey 2 inspected items ${roundOutcome[2].inspectionCount} times.
    Monkey 3 inspected items ${roundOutcome[3].inspectionCount} times.
    `);
    }
    roundMonkeys = roundOutcome;
  }

  // Monkey business = two monkeys that inspected the most items, multiplied
  const greediestMonkeys = roundMonkeys
    .sort((a, b) => {
      if (a.inspectionCount < b.inspectionCount) {
        return 1;
      }
      if (a.inspectionCount > b.inspectionCount) {
        return -1;
      }
      return 0;
    })
    .slice(0, 2);
  const monkeyBusiness = greediestMonkeys.reduce((total, monkey) => {
    total = total * monkey.inspectionCount;
    return total;
  }, 1);

  return monkeyBusiness;
}

(async () => {
  const rawData = await parseRawData(__dirname, "test.txt");

  // Test answer: 10605
  // Real answer: 113232
  // const monkeys = parseMonkeys(rawData);
  // const part1Answer = calculateMonkeyBusiness(20, monkeys, false);
  // console.log("Part 1 Answer:", part1Answer);

  // Test answer: 2713310158
  // Real answer:
  const monkeys = parseMonkeys(rawData);
  const part2Answer = calculateMonkeyBusiness(10_000, monkeys, false);
  console.log("Part 2 Answer:", part2Answer);
})();
