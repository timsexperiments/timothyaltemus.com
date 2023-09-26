#!/usr/bin/env node

const fs = require('fs/promises');

const main = async (foldersToCreate) => {
  let numCreated = 0;
  for (const folder of foldersToCreate) {
    try {
      await fs.mkdir(folder, { recursive: true });
      numCreated++;
    } catch {
      // ignore any errors
    }
  }

  console.log(`(${numCreated}) folders created.`);
};

main(process.argv.slice(2));
