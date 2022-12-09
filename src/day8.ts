import { resolve } from "path";
import { promises as fs } from "fs";

function parseTrees(rawTrees: string): number[][] {
  const lines = rawTrees.split("\n");
  return lines.map((line) => line.split("").map((c) => parseInt(c, 10)));
}

function getColCounts(
  rowLength: number,
  colIndex: number,
  col: number[],
  invertIndex: boolean // Set to true for RTL (or bottom-to-top)
) {
  const matrix = new Set<string>();
  let colMax = col[0];

  for (let n = 0; n < col.length; n += 1) {
    if (
      n === 0 ||
      n === col.length - 1 ||
      colIndex === 0 ||
      colIndex === col.length - 1
    ) {
      continue;
    }

    if (col[n] <= colMax) {
      continue;
    }

    if (col[n] > colMax) {
      // To see a tree, it must be taller than any tree in front of it

      // Invert the index when doing RTL/bottom-top-top
      const rowIndex = invertIndex ? rowLength - n - 1 : n;

      // Left/right
      matrix.add([rowIndex, colIndex].join("-"));

      colMax = col[n];
    }
  }

  return Array.from(matrix.values());
}

function getRowCounts(
  colLength: number,
  rowIndex: number,
  row: number[],
  invertIndex: boolean // Set to true for RTL (or bottom-to-top)
): string[] {
  const matrix = new Set<string>();
  let rowMax = row[0];
  for (let n = 0; n < row.length; n += 1) {
    // Don't count the left edge
    if (n === 0 || n === row.length - 1) {
      continue;
    }

    if (row[n] <= rowMax) {
      continue;
    }

    // Increment the count until no more trees are visible
    if (row[n] > rowMax) {
      // To see a tree, it must be taller than any tree in front of it

      // Invert the index when doing RTL/bottom-top-top
      const colIndex = invertIndex ? colLength - n - 1 : n;
      // Left/right
      matrix.add([rowIndex, colIndex].join("-"));

      rowMax = row[n];
    }
  }

  return Array.from(matrix.values());
}

function scoreCell(cellValue: number, values: number[]) {
  let score = 0;
  let heightMatched = false;
  for (let i = 0; i < values.length; i += 1) {
    if (heightMatched) {
      continue;
    }

    // Only count trees of the same height once
    if (values[i] === cellValue) {
      score += 1;
      heightMatched = true;
    }

    if (values[i] < cellValue) {
      score += 1;
    }

    if (values[i] > cellValue) {
      score += 1;
      heightMatched = true;
    }
  }

  return score;
}

function getHighestScenicCount(rows: number[][]): number {
  const colLength = rows[0].length;
  const allCols: number[][] = [];
  for (let y = 0; y < colLength; y += 1) {
    const col = rows.map((row) => {
      return row[y];
    });
    allCols.push(col);
  }

  const allScenicScores: number[] = [];

  function safeIndex(index: number): number {
    if (index < 0) {
      return 0;
    }

    return index;
  }

  rows.forEach((row, rowIndex) => {
    row.forEach((colItem, colIndex) => {
      const cellValue = row[colIndex];
      const col = allCols[colIndex];

      // Number of visible trees to the left
      const leftValues = [...row.slice(0, safeIndex(colIndex))].reverse();
      const leftScore = scoreCell(cellValue, leftValues);

      // Number of visible trees to the right
      const rightValues = [...row.slice(colIndex + 1, row.length)];
      const rightScore = scoreCell(cellValue, rightValues);

      // Number of visible trees to the top
      const topValues = [...col.slice(0, safeIndex(rowIndex))].reverse();
      const topScore = scoreCell(cellValue, topValues);

      // Number of visible trees to the bottom
      const bottomValues = [...col.slice(rowIndex + 1, col.length)];
      const bottomScore = scoreCell(cellValue, bottomValues);

      const totalScore = leftScore * rightScore * topScore * bottomScore;
      allScenicScores.push(totalScore);
    });
  });

  return allScenicScores.reduce((highest, score) => {
    if (score > highest) {
      return score;
    }
    return highest;
  }, 0);
}

function countTrees(parsed: number[][]): {
  part1: number;
  part2: number;
} {
  const colLength = parsed[0].length;
  const rowLength = parsed.length;

  // i (row), n (col)
  const matrix = new Set<string>();

  // Rows
  for (let i = 0; i < parsed.length; i += 1) {
    if (i === 0 || i === parsed.length - 1) {
      continue;
    }
    const ltrMatrix = getRowCounts(colLength, i, parsed[i], false);
    const rtlMatrix = getRowCounts(
      colLength,
      i,
      [...parsed[i]].reverse(),
      true
    );

    Array.from(ltrMatrix.values()).forEach((val) => {
      matrix.add(val);
    });
    Array.from(rtlMatrix.values()).forEach((val) => {
      matrix.add(val);
    });
  }

  // Cols
  for (let y = 0; y < colLength; y += 1) {
    const col = parsed.map((row) => {
      return row[y];
    });

    const ltrMatrix = getColCounts(rowLength, y, col, false);
    const rtlMatrix = getColCounts(rowLength, y, [...col].reverse(), true);

    Array.from(ltrMatrix.values()).forEach((val) => {
      matrix.add(val);
    });
    Array.from(rtlMatrix.values()).forEach((val) => {
      matrix.add(val);
    });
  }

  // Count all trees on the edges
  const outerTrees = colLength * 2 + (rowLength - 2) * 2;

  return {
    part1: outerTrees + matrix.size,
    part2: getHighestScenicCount(parsed),
  };
}

(async () => {
  const rawTrees = await fs.readFile(resolve(__dirname, "./trees.txt"), {
    encoding: "utf-8",
  });

  const parsed = parseTrees(rawTrees);
  const { part1, part2 } = countTrees(parsed);

  // Part 1 test answer: 21
  // Part 1 real answer: 1782
  const part1Answer = part1;
  console.log("Part 1 Answer:", part1Answer);

  // Part 2 test answer: 8
  // Part 2 real answer: 474606
  const part2Answer = part2;
  console.log("Part 2 Answer:", part2Answer);
})();
