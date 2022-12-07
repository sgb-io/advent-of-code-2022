import { resolve } from "path";
import { promises as fs } from "fs";

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

type Path = {
  currentPath: string[];
  dirName: string;
};

const allRelevantPaths: Path[] = [];

function convertCommandsToInstructions(rawCommands: string): Instructions {
  const instructions: Instructions = [];
  let lsLines: string[] = [];

  const lines = rawCommands.split("\n");
  let capturing = false;

  lines.forEach((line, lineIndex) => {
    if (capturing && !line.startsWith("$")) {
      lsLines.push(line);
    }

    const shouldStopCapturing =
      line.startsWith("$") || lineIndex + 1 === lines.length;
    if (capturing && shouldStopCapturing) {
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
        createDirDfs(rootDir, [...currentPath], path);
        currentDir = getDirDfs(currentDir, [...currentPath], path);

        // TODO should end up with 3: a, d, e (ingoring the root)
        allRelevantPaths.push({
          currentPath: [...currentPath],
          dirName: currentDir.name,
        });
      }

      // Note: am assuming that the instructions are valid, i.e. they don't try to exit the root dir
      if (path === "..") {
        currentDir = getParentDirDfs(rootDir, [...currentPath]);
        currentPath = [...currentPath.slice(0, currentPath.length - 1)];
      }
    }

    // Note: we're ignoring any directories discovered by `ls`
    // We're only caring about files that `ls` discovers
    // We rely on the `cd` commands to build the structure

    if (instruction.type === "ls") {
      const files = instruction.contents.filter(
        (c) => c.type === "file"
      ) as File[];
      addFilesToDir(rootDir, [...currentPath], currentDir.name, files);
    }
  }

  return rootDir;
}

function getFullDirectorySize(directory: Dir, startingSize: number): number {
  let totalSize = startingSize;
  const childrenKeys = Object.keys(directory.children);
  const childFiles = childrenKeys
    .filter((k) => directory.children[k].type === "file")
    .map((k) => directory.children[k]) as File[];
  const childDirKeys = childrenKeys.filter(
    (k) => directory.children[k].type === "dir"
  );

  // No child dirs - base case
  if (childDirKeys.length === 0) {
    // return just the size of the files
    const sizes = childFiles.map((f) => f.size);

    return (
      startingSize +
      sizes.reduce((total, fileSize) => {
        return total + fileSize;
      }, 0)
    );
  }

  // Has child dirs, but also local files
  if (childFiles.length) {
    const sizes = childFiles.map((f) => f.size);
    totalSize += sizes.reduce((total, fileSize) => {
      return total + fileSize;
    }, 0);
  }

  childDirKeys.forEach((k) => {
    const childDirSize = getFullDirectorySize(directory.children[k] as Dir, 0);
    totalSize += childDirSize;
  });

  return totalSize;
}

function calculateDirectorySizes(rootDir: Dir, allRelevantPaths: Path[]) {
  const sizes: number[] = [];

  allRelevantPaths.forEach((path) => {
    const { dirName, currentPath } = path;
    const directory = getDirDfs(rootDir, currentPath, dirName);
    if (dirName !== "/") {
      const size = getFullDirectorySize(directory, 0);
      sizes.push(size);
    }
  });

  // check that all path + name combinations are unique
  // stringify and add to a set, check length
  const pathStrings = new Set();
  allRelevantPaths.forEach((p) => {
    const asString = p.currentPath.join("-");
    console.log(asString);
    pathStrings.add(asString);
  });

  return sizes.filter((n) => n <= 100_000);
}

(async () => {
  const rawCommands = await fs.readFile(
    resolve(__dirname, "./computerCommands.txt"),
    {
      encoding: "utf-8",
    }
  );
  const directoryStructure = parseRawCommands(rawCommands);

  const directorySizes = calculateDirectorySizes(
    directoryStructure,
    allRelevantPaths
  );

  const total = directorySizes.reduce((total, size) => {
    return total + size;
  }, 0);

  // Should be 95437 using the test
  // 1034488 is incorrect for the real data
  // Real answer should be 1427048
  const part1Answer = total;
  console.log("Part 1 Answer:", part1Answer);

  // Real answer should be 2940614
  const part2Answer = "todo";
  console.log("Part 2 Answer:", part2Answer);
})();
