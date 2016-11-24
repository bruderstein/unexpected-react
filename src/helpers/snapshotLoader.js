'use strict';

import fs from 'fs';

function defaultLoader(snapshotPath) {
  if (fs.statSync(snapshotPath).isFile()) {
    delete require.cache[snapshotPath];
    return require(snapshotPath);
  }
  return null;
}

let loader = defaultLoader;

function loadSnapshot(snapshotPath) {
  let content;
  try {
    if (fs.statSync(snapshotPath).isFile()) {
      content = loader(snapshotPath);
    }
  } catch (e) {
    content = null;
  }
  return content;
}

function injectLoader(newLoader) {
  loader = newLoader;
}

export { loadSnapshot, injectLoader };
