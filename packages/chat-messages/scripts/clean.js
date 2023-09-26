#!/usr/bin/env node

const fs = require('fs/promises');

const main = async (foldersToDelete) => {
  let numDeleted = 0;
  for (const folder of foldersToDelete) {
    try {
      await fs.rm(folder, { recursive: true });
      numDeleted++;
    } catch {
      // ignore any errors
    }
  }

  console.log(`(${numDeleted}) folders deleted.`);
};

main(process.argv.slice(2));
