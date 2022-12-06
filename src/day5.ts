import { resolve } from "path";
import { promises as fs } from "fs";

type RowValue = string | undefined;
type ColValue = string | undefined;
type Row = RowValue[];
type StackRowGroups = Array<Row>;

function parseStartingStacks(rawStacks: string): StackRowGroups {
  const rawStartingStack = rawStacks.split("\r\n\r\n")[0];
  const stackRowsRaw = rawStartingStack.split("\r\n");
  const stackRows = stackRowsRaw.slice(0, stackRowsRaw.length - 1);

  const stackRowGroups: StackRowGroups = [];

  // To account for columns, we will rely on whitespace in the input
  // Every row is 35 chars long - I am relying on this consistent use of whitespace
  for (let i = 0; i < stackRows.length; i += 1) {
    // Split into chars, remove the standard 8x spaces that every row has
    // i.e. remove every 4th char from every row
    // Also, replace square brackets with white space
    const rowChars = stackRows[i]
      .split("")
      .filter((_c, i) => (i + 1) % 4)
      .map((c) => {
        if (c === "[" || c === "]") {
          return " ";
        }
        return c;
      });

    // We now have 27 items, each 3 representing a column
    // Reduce this into actual column values
    const rowGroups: Row = rowChars.reduce((group: Row, c, index) => {
      if ((index + 2) % 3 === 0) {
        // Replace whitespace strings with `undefined`
        // This will make things easier later, as empty columns will be falsy,
        // and empty strings are removed from the picture
        if (c === " ") {
          group.push(undefined);
        } else {
          group.push(c);
        }
      }

      return group;
    }, []);

    stackRowGroups.push(rowGroups);
  }

  return stackRowGroups;
}

function parseInstructions(rawStacks: string) {
  const stackLines = rawStacks.split("\r\n");

  return stackLines.slice(10, stackLines.length);
}

function rearrangeStacks(
  startingStacks: StackRowGroups,
  instructions: string[],
  retainOrderOfCrates: boolean
): string {
  // maintain a list of columns based on the starting stacks
  // mutate it using the instructions
  const cols = new Map<number, ColValue[]>();
  startingStacks.forEach((row) => {
    row.forEach((colValue, colIndex) => {
      const colNum = colIndex + 1;
      if (cols.has(colNum)) {
        const updatedValue = [...cols.get(colNum)!, colValue];
        cols.set(colNum, updatedValue);
      } else {
        cols.set(colNum, [colValue]);
      }
    });
  });

  const rearrangeSteps = instructions.map((rawInstruction) => {
    const digits = rawInstruction
      .replace(/move|from|to/g, "")
      .trim()
      .replace(/  /g, ",");
    return digits.split(",").map((c) => parseInt(c, 10));
  });

  rearrangeSteps.forEach((steps) => {
    const [numToMove, startCol, endCol] = steps;
    const startColItems = cols.get(startCol);
    const endColItems = cols.get(endCol);
    if (!startColItems) {
      console.error(startColItems);
      throw new Error(
        "Start col was missing those items, does this step make sense?"
      );
    }
    if (!endColItems) {
      console.error(endCol, endColItems);
      throw new Error(
        "End col was missing those items, does this step make sense?"
      );
    }
    const movingItemsUnordered = startColItems
      .filter((c) => typeof c !== "undefined")
      .slice(0, numToMove);
    const movingItems = retainOrderOfCrates
      ? movingItemsUnordered
      : movingItemsUnordered.reverse();
    const remainingStartCol = startColItems.slice(
      numToMove,
      startColItems.length
    );
    // Update startCol
    cols.set(startCol, remainingStartCol);
    // Update endCol
    const updatedEndCol = [
      ...movingItems,
      ...endColItems.filter((c) => typeof c !== "undefined"),
    ];
    cols.set(endCol, updatedEndCol);
  });

  // 9 cols, 8 rows
  const answer = Array.from(cols.values()).reduce((answer, col) => {
    let colAnswer = "";
    if (col.length) {
      colAnswer = col.filter((v) => typeof v !== "undefined")[0]!;
    }
    return answer + colAnswer;
  }, "");

  return answer;
}

(async () => {
  const rawStacks = await fs.readFile(resolve(__dirname, "./stacks.txt"), {
    encoding: "utf-8",
  });
  const startingStacks = parseStartingStacks(rawStacks);
  const instructions = parseInstructions(rawStacks);

  const part1Answer = rearrangeStacks(startingStacks, instructions, false);
  console.log("Part 1 Answer:", part1Answer);

  const part2Answer = rearrangeStacks(startingStacks, instructions, true);
  console.log("Part 2 Answer:", part2Answer);
})();
