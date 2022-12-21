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

function calculateBeaconPositions(lines: string[]): {
  beaconPositions: number[][];
  sensorPositions: number[][];
} {
  const sensorPositions: number[][] = [];
  const beaconPositions: number[][] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const [left, right] = lines[i].split(": ");
    const [atX, atY] = parseCoordinates(left);
    sensorPositions.push([atX, atY]);
    const [beaconX, beaconY] = parseCoordinates(right);
    beaconPositions.push([beaconX, beaconY]);
  }

  return { sensorPositions, beaconPositions };
}

function getWidth(knownBeacons: number[][]) {
  let minX = 0;
  let maxX = 0;
  for (let i = 0; i < knownBeacons.length; i += 1) {
    const [x] = knownBeacons[i];
    if (x < minX) {
      minX = x;
    }
    if (x > maxX) {
      maxX = x;
    }
  }

  return { minX, maxX };
}

function isBeacon(beaconPositions: number[][], x: number, y: number): boolean {
  for (let i = 0; i < beaconPositions.length; i += 1) {
    if (beaconPositions[i][0] === x && beaconPositions[i][1] === y) {
      return true;
    }
  }

  return false;
}

function isSensor(sensorPositions: number[][], x: number, y: number): boolean {
  for (let i = 0; i < sensorPositions.length; i += 1) {
    if (sensorPositions[i][0] === x && sensorPositions[i][1] === y) {
      return true;
    }
  }

  return false;
}

function getScannedCoords(rowNum: number, posX: number): number[] {
  // 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, reverse
  if (rowNum === 0) {
    return [posX, posX];
  }

  if (rowNum <= 9) {
    return [posX - rowNum, posX + rowNum];
  }

  if (rowNum > 9) {
    const adjusted = 10 - rowNum;
    return [posX - adjusted, posX + adjusted];
  }

  throw new Error("Unexpected case");
}

function isEmpty(sensorPositions: number[][], x: number, y: number) {
  const relevantSensorPositions = sensorPositions.filter((position) => {
    const [, posY] = position;
    if (posY < y) {
      return posY >= y - 25;
    }

    if (posY > y) {
      return posY <= y + 25;
    }

    return true;
  });

  const allScannedPositions: number[][] = [];

  for (let i = 0; i < relevantSensorPositions.length; i += 1) {
    // 19 wide, 20 high
    // 1 on row 0, 19 on row 9, 1 on row 20
    const [posX, posY] = relevantSensorPositions[i];

    const startY = posY - 10;
    const endY = posY + 10;
    const startX = posX - 10;
    const endX = posX + 10;

    let rowNum = 0;

    // For every sensor, we need to loop 20 rows and 19 cols...
    for (let scannedY = startY; scannedY < endY; scannedY += 1) {
      // allScannedPositions.push([scannedX, scannedY]);
      const [rowStart, rowEnd] = getScannedCoords(rowNum, posX);
      for (let j = rowStart; j < rowEnd; j += 1) {
        allScannedPositions.push([j, scannedY]);
      }
      rowNum += 1;
    }
  }

  for (let y = 0; y < allScannedPositions.length; y += 1) {
    const [posX, posY] = allScannedPositions[y];
    if (posX === x && posY === y) {
      return true;
    }
  }

  return false;
}

function drawBeacons(
  knownBeacons: number[][],
  sensorPositions: number[][],
  interestingRow: number
) {
  const startY = interestingRow - 25;
  const endY = interestingRow + 25;
  const { minX, maxX } = getWidth([...sensorPositions, ...knownBeacons]);

  console.log("knownBecons", knownBeacons);
  console.log("minX", minX, "maxX", maxX);

  let col1 = "    ";
  let col2 = "    ";

  for (let n = minX; n <= maxX + 1; n += 1) {
    if (n % 5 !== 0) {
      col1 += " ";
      col2 += " ";
      continue;
    }
    const isNegative = n < 0;
    const lineStr = n.toString();
    if (!isNegative && lineStr.length > 1) {
      col1 += lineStr[0];
      col2 += lineStr[1];
      continue;
    }

    col1 += " ";
    col2 += lineStr.replace("-", ""); // Don't show signed int's in the col header
  }

  console.log(col1);
  console.log(col2);

  for (let i = startY; i <= endY; i += 1) {
    let prefix = "";
    const lineNumberLength = i.toString().length;
    if (lineNumberLength === 2) {
      prefix = " ";
    }
    if (lineNumberLength === 1) {
      prefix = "  ";
    }
    let line = `${prefix}${i} `;
    for (let n = minX; n <= maxX; n += 1) {
      if (isBeacon(knownBeacons, n, i)) {
        line += "B";
        continue;
      }

      if (isSensor(sensorPositions, n, i)) {
        line += "S";
        continue;
      }

      // As it stands, the isEmpty check is wrong
      // if (isEmpty(sensorPositions, n, i)) {
      //   line += "#";
      //   continue;
      // }

      line += ".";
    }
    console.log(line);
  }
}

(async () => {
  const isTest = true;

  const inputFile = isTest ? "test.txt" : "input.txt";
  const rawData = await parseRawData(__dirname, inputFile);

  const lines = rawData.split("\n");

  const { beaconPositions, sensorPositions } = calculateBeaconPositions(lines);
  const interestingRow = isTest ? 10 : 2_000_000;

  console.log(beaconPositions);

  drawBeacons(beaconPositions, sensorPositions, interestingRow);

  // calculate X/Y of all known beacons
  // for row 2mil, get all becons within 10up/10down on the Y axis
  // draw 50 rows with row 2 mil in the middle

  // Test answer: 26
  // Real answer:
  const part1Answer = "TODO";
  console.log("Part 1 Answer:", part1Answer.length);

  // Test answer:
  console.log("Part 2 Answer:", "TODO");
})();
