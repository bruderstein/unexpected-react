'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFunctionArgs = exports.writerOptions = exports.FUNCTION_ID = exports.injectStateHooks = exports.compareSnapshot = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _jestMatchers = require('jest-matchers');

var _jestMatchers2 = _interopRequireDefault(_jestMatchers);

var _jestSnapshot = require('jest-snapshot');

var _jestSnapshot2 = _interopRequireDefault(_jestSnapshot);

var _jsWriter = require('js-writer');

var _jsWriter2 = _interopRequireDefault(_jsWriter);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _unexpectedHtmllikeRawAdapter = require('unexpected-htmllike-raw-adapter');

var _unexpectedHtmllikeRawAdapter2 = _interopRequireDefault(_unexpectedHtmllikeRawAdapter);

var _snapshotLoader = require('./snapshotLoader');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Serializable "unique" ID
var FUNCTION_ID = "$FUNC$bc*(!CDKRRz195123$";
var FUNC_ARGS_REGEX = /function [^(]*\(([^)]*)\)/;

function getFunctionArgs(func) {
  var match = FUNC_ARGS_REGEX.exec(func.toString());
  if (match) {
    return match[1].split(',').map(function (arg) {
      return arg.trim();
    }).join(', ');
  }
  return '';
}

var writerOptions = {
  handlers: {
    'function': function _function(func) {
      var functionDefinition = {
        $functype: FUNCTION_ID,
        name: func.name || '',
        args: getFunctionArgs(func)
      };
      return JSON.stringify(functionDefinition);
    }
  }
};

var UnexpectedSnapshotState = function () {
  function UnexpectedSnapshotState(snapshotState) {
    _classCallCheck(this, UnexpectedSnapshotState);

    var files = {};
    this._files = files;
  }

  _createClass(UnexpectedSnapshotState, [{
    key: 'getSnapshot',
    value: function getSnapshot(testPath, testName, expect) {
      var _this = this;

      var snapshot = this._files[testPath];
      if (!snapshot) {
        (function () {
          var snapshotPath = getSnapshotPath(testPath);
          var content = (0, _snapshotLoader.loadSnapshot)(snapshotPath);
          var contentOutput = {};
          if (content) {
            Object.keys(content).reduce(function (agg, testKey) {
              agg[testKey] = expect.output.clone().annotationBlock(function () {
                this.append(expect.inspect(rawAdapter.deserialize(content[testKey])));
              }).toString();
              return agg;
            }, contentOutput);
          }

          snapshot = _this._files[testPath] = {
            testCounter: {},
            uncheckedKeys: content && new Set(Object.keys(content)) || new Set(),
            allTests: content || {},
            contentOutput: contentOutput,
            failedTests: new Set()
          };
        })();
      }
      var count = (snapshot.testCounter[testName] || 0) + 1;
      snapshot.testCounter[testName] = count;

      var keyName = testName + ' ' + count;
      snapshot.uncheckedKeys.delete(keyName);
      return snapshot.allTests[keyName] || null;
    }
  }, {
    key: 'saveSnapshot',
    value: function saveSnapshot(testPath, testName, tree, expect) {

      var snapshotPath = getSnapshotPath(testPath);
      var snapshot = this._files[testPath];

      // If we've been passed a new tree, update the current snapshot
      // Otherwise, we're just saving the file
      if (tree) {
        var count = snapshot.testCounter[testName] || 1;

        snapshot.allTests[testName + ' ' + count] = tree;
        snapshot.contentOutput[testName + ' ' + count] = expect.output.clone().annotationBlock(function () {
          this.append(expect.inspect(tree));
        }).toString();
      }
      var dir = _path2.default.dirname(snapshotPath);
      var exists = void 0;
      try {
        exists = _fs2.default.statSync(dir).isDirectory();
      } catch (e) {
        exists = false;
      }
      if (!exists) {
        _mkdirp2.default.sync(dir);
      }
      var fileContent = Object.keys(snapshot.allTests).map(function (test) {
        var display = snapshot.contentOutput[test] || '// Display unavailable (this is probably a bug in unexpected-react, please report it!)';
        return '/////////////////// ' + test + ' ///////////////////\n\n' + display + '\n\nexports[`' + test + '`] = ' + (0, _jsWriter2.default)(snapshot.allTests[test], writerOptions) + ';\n// ===========================================================================\n';
      }).join('\n\n');
      _fs2.default.writeFileSync(snapshotPath, fileContent);
    }
  }, {
    key: 'markTestAsFailed',
    value: function markTestAsFailed(testPath, testName) {
      var snapshot = this._files[testPath];
      snapshot.failedTests.add(testName);
    }
  }]);

  return UnexpectedSnapshotState;
}();

function getSnapshotPath(testPath) {
  var testPathParsed = _path2.default.parse(testPath);
  testPathParsed.dir = _path2.default.join(testPathParsed.dir, '__snapshots__');
  testPathParsed.base = testPathParsed.name + '.unexpected-snap';

  return _path2.default.format(testPathParsed);
}

var rawAdapter = new _unexpectedHtmllikeRawAdapter2.default({ convertToString: true, concatTextContent: true });

function compareSnapshot(expect, flags, subjectAdapter, subjectRenderer, subjectOutput) {

  var state = _jestMatchers2.default.getState();

  if (!state.unexpectedSnapshot) {
    state.unexpectedSnapshot = new UnexpectedSnapshotState(state.snapshotState);
  }

  var snapshot = state.unexpectedSnapshot.getSnapshot(state.testPath, state.currentTestName, expect);
  if (snapshot === null) {
    // Write and save
    state.unexpectedSnapshot.saveSnapshot(state.testPath, state.currentTestName, rawAdapter.serialize(subjectAdapter, subjectOutput), expect);
    state.snapshotState.added++;
  } else {
    expect.withError(function () {
      if (flags.satisfy) {
        expect(subjectRenderer, 'to have rendered', rawAdapter.deserialize(snapshot));
      } else {
        expect(subjectRenderer, 'to have rendered with all children with all wrappers with all classes with all attributes', rawAdapter.deserialize(snapshot));
      }
      state.snapshotState.matched = (state.snapshotState.matched || 0) + 1;
    }, function (err) {
      state.unexpectedSnapshot.markTestAsFailed(state.testPath, state.currentTestName);
      if (state.snapshotState.update === true) {
        state.snapshotState.updated++;
        state.unexpectedSnapshot.saveSnapshot(state.testPath, state.currentTestName, rawAdapter.serialize(subjectAdapter, subjectOutput), expect);
      } else {
        (function () {
          state.snapshotState.unmatched++;
          var createDiff = err.getDiffMethod();
          expect.errorMode = 'bubble';
          expect.fail({
            message: function message(output) {
              return output.error('expected ').prismSymbol('<').prismTag(subjectAdapter.getName(subjectOutput)).prismSymbol(' .../> ').error('to match snapshot');
            },
            diff: function diff(output, _diff, inspect, equal) {
              return createDiff(output, _diff, inspect, equal);
            }
          });
        })();
      }
    });
  }
}

function injectStateHooks() {
  var state = _jestMatchers2.default.getState();
  var snapshotState = state && state.snapshotState;
  if (snapshotState) {
    (function () {
      var originalRemoveUncheckedKeys = snapshotState.removeUncheckedKeys;

      snapshotState.removeUncheckedKeys = function () {
        var state = _jestMatchers2.default.getState();
        var isDirty = false;
        var snapshot = state.unexpectedSnapshot && state.unexpectedSnapshot._files[state.testPath];
        if (snapshot && snapshot.uncheckedKeys.size) {
          snapshot.uncheckedKeys.forEach(function (key) {
            var testName = /(.*)\s[0-9]+$/.exec(key)[1];

            if (!snapshot.failedTests.has(testName)) {
              isDirty = true;
              delete snapshot.allTests[key];
            }
          });
        }

        if (!snapshot || Object.keys(snapshot.allTests).length === 0) {
          var snapshotPath = getSnapshotPath(state.testPath);
          try {
            if (_fs2.default.statSync(snapshotPath).isFile()) {
              _fs2.default.unlinkSync(getSnapshotPath(state.testPath));
            }
          } catch (e) {
            // We're ignoring file-not-found exceptions, and errors deleting
          }

          if (state.unexpectedSnapshot) {
            delete state.unexpectedSnapshot._files[state.testPath];
          }
        } else if (isDirty) {
          state.unexpectedSnapshot.saveSnapshot(state.testPath, state.currentTestName);
        }
        originalRemoveUncheckedKeys.call(snapshotState);
      };
    })();
  }
}

// When this module is required, Jest is already started, and the hooks can be added
injectStateHooks();

exports.compareSnapshot = compareSnapshot;
exports.injectStateHooks = injectStateHooks;
exports.FUNCTION_ID = FUNCTION_ID;
exports.writerOptions = writerOptions;
exports.getFunctionArgs = getFunctionArgs;