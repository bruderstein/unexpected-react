'use strict';

import fs from 'fs';

function defaultLoader(snapshotPath) {
  let content;
  try {
    if (fs.statSync(snapshotPath).isFile()) {
      content = require(snapshotPath);
    }
  } catch (e) {
    content = null;
  }
  return content;
}

let loader = defaultLoader;

function loadSnapshot(snapshotPath) {
  return loader(snapshotPath);
}

function injectLoader(newLoader) {
  loader = newLoader;
}

export { loadSnapshot, injectLoader };
