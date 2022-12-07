import { resolve } from "path";
import { chmod, promises as fs } from "fs";
import { dir } from "console";

// Build a simple tree structure of the file system
// Calculate the sizes of all directories, regardless of nesting
// Traversing depth-first or breadth-first shouldn't really matter, both will be fine
// Simple calculation to combine those

interface FsEntity {
  name: string;
  type: "file" | "dir";
}

interface File extends FsEntity {
  size: number;
}

interface Dir extends FsEntity {
  children: Record<string, Dir | File>;
}

type CdInstruction = {
  type: "cd";
  path: string;
};

type LsInstruction = {
  type: "ls";
  contents: Array<File | Dir>;
};

type Instructions = Array<CdInstruction | LsInstruction>;

function convertCommandsToInstructions(rawCommands: string): Instructions {
  const instructions: Instructions = [];
  let lsLines: string[] = [];

  const lines = rawCommands.split("\n");
  let capturing = false;

  lines.forEach((line) => {
    if (capturing && line.startsWith("$")) {
      const lsInstruction: LsInstruction = {
        type: "ls",
        contents: [],
      };
      lsLines.forEach((lsLine) => {
        if (lsLine.startsWith("dir")) {
          lsInstruction.contents.push({
            name: lsLine.replace("dir ", ""),
            type: "dir",
            children: {},
          });
        } else {
          const [fileSizeStr, fileName] = lsLine.split(" ");
          const fileSize = parseInt(fileSizeStr, 10);
          lsInstruction.contents.push({
            name: fileName,
            type: "file",
            size: fileSize,
          });
        }
      });
      instructions.push(lsInstruction);

      lsLines = [];
      capturing = false;
    }

    if (line.startsWith("$ cd")) {
      const cdInstruction: CdInstruction = {
        type: "cd",
        path: line.replace("$ cd ", ""),
      };
      instructions.push(cdInstruction);
    }

    if (line.startsWith("$ ls")) {
      capturing = true;
    }

    if (capturing && !line.startsWith("$")) {
      lsLines.push(line);
    }
  });

  return instructions;
}

function createDirDfs(
  currentDir: Dir,
  currentPath: string[],
  dirName: string
): void {
  if (currentDir.children[dirName]) {
    return;
  }

  if (currentPath.length === 0) {
    // When we've recursed down to the bottom path, create the directory
    currentDir.children[dirName] = {
      type: "dir",
      name: dirName,
      children: {},
    };

    return;
  }

  let target = currentDir;
  const nextChild = currentDir.children[currentPath[0]];
  if (nextChild && nextChild.type === "dir") {
    target = nextChild as Dir;
  }

  return createDirDfs(
    target,
    currentPath.slice(1, currentPath.length),
    dirName
  );
}

function addFilesToDir(
  currentDir: Dir,
  currentPath: string[],
  dirName: string,
  files: File[]
): void {
  const directory = getDirDfs(currentDir, currentPath, dirName);

  files.forEach((file) => {
    directory.children[file.name] = file;
  });

  return;
}

function getDirDfs(
  currentDir: Dir,
  currentPath: string[],
  dirName: string
): Dir {
  let target = currentDir;
  const nextChild = currentDir.children[currentPath[0]];
  if (nextChild && nextChild.type === "dir") {
    target = nextChild as Dir;
  }

  if (currentPath.length === 0 && target) {
    return target;
  }

  return getDirDfs(target, currentPath.slice(1, currentPath.length), dirName);
}

function getParentDirDfs(currentDir: Dir, currentPath: string[]): Dir {
  if (currentPath.length === 0) {
    throw new Error("how?");
  }

  // Since we want to recurse down the currentPath except 1, return at that point
  if (currentPath.length === 1) {
    return currentDir;
  }

  let target = currentDir;
  const nextChild = currentDir.children[currentPath[0]];
  if (nextChild && nextChild.type === "dir") {
    target = nextChild as Dir;
  }

  return getParentDirDfs(target, currentPath.slice(1, currentPath.length));
}

function parseRawCommands(rawCommands: string): Dir {
  const rootDir: Dir = {
    name: "/",
    type: "dir",
    children: {},
  };

  let currentPath: string[] = [];
  let currentDir = rootDir;
  const instructions = convertCommandsToInstructions(rawCommands);

  for (let i = 0; i < instructions.length; i += 1) {
    const instruction = instructions[i];
    // several types of cd: /, .., <dirname>
    if (instruction.type === "cd") {
      const { path } = instruction;
      if (path !== "/" && path !== "..") {
        currentPath.push(path);

        // Mutates rootDir to create all directories
        createDirDfs(rootDir, currentPath, path);
        currentDir = getDirDfs(currentDir, currentPath, path);
      }

      // Note: am assuming that the instructions are valid, i.e. they don't try to exit the root dir
      if (path === "..") {
        currentDir = getParentDirDfs(rootDir, currentPath);
        currentPath = currentPath.slice(0, currentPath.length - 1);
      }
    }

    // Note: we're ignoring any directories discovered by `ls`
    // We're only caring about files that `ls` discovers
    // We rely on the `cd` commands to build the structure

    if (instruction.type === "ls") {
      console.log("TODO apply ls output to", currentDir);
      const files = instruction.contents.filter(
        (c) => c.type === "file"
      ) as File[];
      addFilesToDir(rootDir, currentPath, currentDir.name, files);
    }
  }

  // console.log(JSON.stringify());

  // Follow cd commands around the structure (currentDir)
  // Add to the structure when we see `ls` commands

  return rootDir;
}

(async () => {
  const rawCommands = await fs.readFile(
    resolve(__dirname, "./computerCommands.txt"),
    {
      encoding: "utf-8",
    }
  );
  const directoryStructure = parseRawCommands(rawCommands);
  // console.log(directoryStructure);

  const part1Answer = "todo";
  console.log("Part 1 Answer:", part1Answer);

  const part2Answer = "todo";
  console.log("Part 2 Answer:", part2Answer);
})();
