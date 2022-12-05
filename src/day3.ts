import { resolve } from "path";
import { promises as fs } from "fs";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

function letterScore(letter: string) {
  const lowercaseScore = ALPHABET.indexOf(letter.toLowerCase()) + 1;
  if (ALPHABET.includes(letter)) {
    // Lowercase
    return lowercaseScore;
  } else {
    // Uppercase
    return lowercaseScore + 26;
  }
}

// Assume single letter intersects
function getCompartmentIntersection(rucksackItem: string): string {
  const left = rucksackItem.substring(0, rucksackItem.length / 2);
  const right = rucksackItem.substring(
    rucksackItem.length / 2,
    rucksackItem.length
  );

  const match = left.split("").find((leftLetter) => {
    return right.split("").includes(leftLetter);
  });

  if (!match) {
    throw new Error(
      `No match - left "${left}", right "${right}", rucksackItem "${rucksackItem}"`
    );
  }

  return match;
}

function getRuckItemDupesScore(rucksackItems: string[]): number {
  return rucksackItems.reduce((totalScore, rucksackItem) => {
    const intersectionLetter = getCompartmentIntersection(rucksackItem);

    totalScore = totalScore + letterScore(intersectionLetter);
    return totalScore;
  }, 0);
}

function getRucksackItems(rucksacks: string) {
  const splitByLines = rucksacks.split("\n");
  return splitByLines.slice(0, splitByLines.length - 1);
}

function groupRucksackItems(rucksackItems: string[]): string[][] {
  const allGroups: string[][] = [];
  let group: string[] = [];
  let groupIndex = 1;

  for (let i = 0; i < rucksackItems.length; i += 1) {
    if (groupIndex <= 3) {
      group.push(rucksackItems[i]);
    }

    groupIndex += 1;

    if (groupIndex > 3) {
      allGroups.push(group);
      group = [];
      groupIndex = 1;
    }
  }

  return allGroups;
}

function scoreGroup(groupRucksackItems: string[]): number {
  // find the char in all 3 items
  const first = groupRucksackItems[0];
  const second = groupRucksackItems[1];
  const third = groupRucksackItems[2];

  let match: string | undefined;
  first.split("").forEach((firstLetter) => {
    second.split("").forEach((secondLetter) => {
      // A letter that matches in the first two groups
      if (firstLetter === secondLetter) {
        third.split("").forEach((thirdLetter) => {
          if (secondLetter === thirdLetter || firstLetter === thirdLetter) {
            match = thirdLetter;
          }
        });
      }
    });
  });

  if (!match) {
    console.error(groupRucksackItems);
    throw new Error(`No match for the group`);
  }

  return letterScore(match);
}

function scoreAllGroups(rucksackItemsByGroup: string[][]): number {
  return rucksackItemsByGroup.reduce((totalScore, group) => {
    totalScore += scoreGroup(group);
    return totalScore;
  }, 0);
}

(async () => {
  const rucksacks = await fs.readFile(resolve(__dirname, "./rucksacks.txt"), {
    encoding: "utf-8",
  });
  const rucksackItems = getRucksackItems(rucksacks);

  const part1Answer = getRuckItemDupesScore(rucksackItems);
  console.log("Part 1 Answer:", part1Answer);

  const rucksackItemsByGroup = groupRucksackItems(rucksackItems);
  const part2Answer = scoreAllGroups(rucksackItemsByGroup);
  console.log("Part 2 Answer:", part2Answer);
})();
