import { parseRawData } from "../utils/parseRawData";

const PAD_PRINTING = 5;

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

  // Add some on to account for displaying scans
  minX = minX - PAD_PRINTING;
  maxX = maxX + PAD_PRINTING;

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

function getScannedLinePositions(rowNum: number, posX: number): number[] {
  // 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, reverse
  if (rowNum === 0) {
    return [posX, posX];
  }

  if (rowNum <= 9) {
    return [posX - rowNum, posX + rowNum];
  }

  if (rowNum > 9) {
    const adjusted = 18 - rowNum;
    return [posX - adjusted, posX + adjusted];
  }

  throw new Error("Unexpected case");
}

function getScannedPositions(
  useNearbySensorsOnly: boolean,
  sensorPositions: number[][],
  interestingRow: number
) {
  const relevantSensorPositions = useNearbySensorsOnly
    ? sensorPositions.filter((position) => {
        const [, posY] = position;
        if (posY < interestingRow) {
          return posY >= interestingRow - 25;
        }

        if (posY > interestingRow) {
          return posY <= interestingRow + 25;
        }

        return true;
      })
    : sensorPositions;

  const allScannedPositions: number[][] = [];

  for (let i = 0; i < relevantSensorPositions.length; i += 1) {
    // 19 wide, 20 high
    // 1 on row 0, 19 on row 9, 1 on row 20
    const [posX, posY] = relevantSensorPositions[i];

    const startY = posY - 9;
    const endY = posY + 9;
    // const startX = posX - 10;
    // const endX = posX + 10;

    let rowNum = 0;

    // console.log(`Sensor ${i} has posX ${posX} and posY ${posY}`);

    // For every sensor, we need to loop 20 rows and 19 cols...
    for (let scannedY = startY; scannedY <= endY; scannedY += 1) {
      // allScannedPositions.push([scannedX, scannedY]);
      const [rowStart, rowEnd] = getScannedLinePositions(rowNum, posX);
      if (scannedY === 10) {
        console.log(
          `For rowNum ${rowNum}, at Y pos ${scannedY}, we're doing ${rowStart} to ${rowEnd}`
        );
      }
      for (let j = rowStart; j <= rowEnd; j += 1) {
        // console.log(`Adding X ${j}, Y ${scannedY}`);
        allScannedPositions.push([j, scannedY]);
      }
      rowNum += 1;
    }
  }

  return allScannedPositions;
}

function positionIsScanned(
  allScannedPositions: number[][],
  x: number,
  y: number
) {
  for (let i = 0; i < allScannedPositions.length; i += 1) {
    const [posX, posY] = allScannedPositions[i];
    if (posX === x && posY === y) {
      return true;
    }
  }

  return false;
}

function getFullMinimumY(allPositions: number[][]) {
  let minY = 0;
  for (let i = 0; i < allPositions.length; i += 1) {
    const [_x, y] = allPositions[i];
    if (y < minY) {
      minY = y;
    }
  }

  // Add some on to account for displaying scans
  minY = minY - PAD_PRINTING;

  return minY;
}

function getFullMaximumY(allPositions: number[][]) {
  let maxY = 0;
  for (let i = 0; i < allPositions.length; i += 1) {
    const [_x, y] = allPositions[i];
    if (y > maxY) {
      maxY = y;
    }
  }

  // Add some on to account for displaying scans
  maxY = maxY + PAD_PRINTING;

  return maxY;
}

function drawBeacons(
  isTest: boolean,
  knownBeacons: number[][],
  sensorPositions: number[][],
  interestingRow: number
): [string[], number] {
  const drawLines: string[] = [];
  const allPositions = [...sensorPositions, ...knownBeacons];
  const startY = isTest ? getFullMinimumY(allPositions) : interestingRow - 25;
  const endY = isTest ? getFullMaximumY(allPositions) : interestingRow + 25;
  const { minX, maxX } = getWidth([...sensorPositions, ...knownBeacons]);

  let col1 = "    ";
  let col2 = "    ";

  console.log(sensorPositions, knownBeacons);

  const scannedPositions = getScannedPositions(
    false,
    sensorPositions,
    interestingRow
  );

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

  drawLines.push(col1);
  drawLines.push(col2);

  let answer = 0;

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

      if (positionIsScanned(scannedPositions, n, i)) {
        line += "#";
        continue;
      }

      if (interestingRow) {
        answer += 1;
      }

      line += ".";
    }

    drawLines.push(line);
  }

  return [drawLines, answer];
}

(async () => {
  const isTest = true;

  const inputFile = isTest ? "test.txt" : "input.txt";
  const rawData = await parseRawData(__dirname, inputFile);

  const lines = rawData.split("\n");

  const { beaconPositions, sensorPositions } = calculateBeaconPositions(lines);
  const interestingRow = isTest ? 10 : 2_000_000;

  const [drawLines, answer] = drawBeacons(
    isTest,
    beaconPositions,
    sensorPositions,
    interestingRow
  );

  if (isTest) {
    drawLines.forEach((l) => console.log(l));
  }

  // Test answer: 26
  // Real answer:
  const part1Answer = answer;
  console.log("Part 1 Answer:", part1Answer);

  // Test answer:
  console.log("Part 2 Answer:", "TODO");
})();
