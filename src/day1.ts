import { resolve } from "path";
import { promises as fs } from "fs";

const getElfCalorieParts = (inventory: string): number[][] => {
  // Split into elves (double linebreak)
  // Then convert every calorie number string into a number
  return inventory.split("\r\n\r\n").map((elf) => {
    const split = elf.split("\r\n");
    return split.map((caloriesAsStr) => parseInt(caloriesAsStr, 10));
  });
};

// Part 1 - Calculate the biggest total calories carried by 1 elf
const maxCalories = (elfCalorieParts: number[][]): number => {
  let maxCaloriesSeen = 0;
  elfCalorieParts.forEach((calorieCounts) => {
    const elfTotalCalories = calorieCounts.reduce(
      (total, curr) => (total = total + curr),
      0
    );
    if (elfTotalCalories > maxCaloriesSeen) {
      maxCaloriesSeen = elfTotalCalories;
    }
  });

  return maxCaloriesSeen;
};

// Return the total calories that the top 3 elves are carrying
// This is overly complex, can be much simpler, mainly how the top 3 are stored
const topThreeCalories = (elfCalorieParts: number[][]): number => {
  let highestCaloriesSeen: number[] = [];
  elfCalorieParts.forEach((calorieCounts) => {
    const elfTotalCalories = calorieCounts.reduce(
      (total, curr) => (total = total + curr),
      0
    );
    const isTopThree = highestCaloriesSeen.length
      ? highestCaloriesSeen.some((amount) => {
          return elfTotalCalories > amount;
        })
      : true;

    if (isTopThree) {
      if (highestCaloriesSeen.length < 3) {
        highestCaloriesSeen.push(elfTotalCalories);
      } else {
        highestCaloriesSeen.splice(0, 1, elfTotalCalories);
        highestCaloriesSeen = highestCaloriesSeen.sort((a, b) => a - b);
      }
    }
  });

  return highestCaloriesSeen.reduce(
    (total, amount) => (total = total + amount),
    0
  );
};

(async () => {
  const inventory = await fs.readFile(resolve(__dirname, "./inventory.txt"), {
    encoding: "utf-8",
  });
  const elfCalorieParts = getElfCalorieParts(inventory);

  const part1Answer = maxCalories(elfCalorieParts);
  console.log("Part 1 Answer:", part1Answer);

  const part2Answer = topThreeCalories(elfCalorieParts);
  console.log("Part 2 Answer:", part2Answer);
})();
