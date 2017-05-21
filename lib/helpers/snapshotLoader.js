'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectLoader = exports.loadSnapshot = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function defaultLoader(snapshotPath) {
  if (_fs2.default.statSync(snapshotPath).isFile()) {
    delete require.cache[snapshotPath];
    return require(snapshotPath);
  }
  return null;
}

var loader = defaultLoader;

function loadSnapshot(snapshotPath) {
  var content = void 0;
  try {
    if (_fs2.default.statSync(snapshotPath).isFile()) {
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

exports.loadSnapshot = loadSnapshot;
exports.injectLoader = injectLoader;