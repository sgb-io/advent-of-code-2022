import { parseRawData } from "../utils/parseRawData";

(async () => {
  const rawData = await parseRawData(__dirname, "test.txt");
  console.log(rawData);

  const part1Answer = "todo";
  console.log("Part 1 Answer:", part1Answer);

  const part2Answer = "todo";
  console.log("Part 2 Answer:", part2Answer);
})();
