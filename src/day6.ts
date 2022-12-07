import { resolve } from "path";
import { promises as fs } from "fs";

function findFirstPacket(
  commsSignal: string,
  uniqueCharsRequired: number
): number {
  let location = 0;
  let recentChars: string[] = [];
  const chars = commsSignal.split("").filter((c) => c !== "\n");
  for (let i = 0; i < chars.length; i += 1) {
    if (recentChars.length === uniqueCharsRequired) {
      // First packet found
      const uniqueLetters = Array.from(new Set(recentChars));
      if (uniqueLetters.length === uniqueCharsRequired) {
        location = i;
        break;
      }

      recentChars = [...recentChars.slice(1, uniqueCharsRequired), chars[i]];
      continue;
    }

    if (recentChars.length < uniqueCharsRequired) {
      recentChars.push(chars[i]);
      continue;
    }
  }

  return location;
}

(async () => {
  const rawCommsSignal = await fs.readFile(
    resolve(__dirname, "./communicationSignal.txt"),
    {
      encoding: "utf-8",
    }
  );

  const part1Answer = findFirstPacket(rawCommsSignal, 4);
  console.log("Part 1 Answer:", part1Answer);

  const part2Answer = findFirstPacket(rawCommsSignal, 14);
  console.log("Part 2 Answer:", part2Answer);
})();
