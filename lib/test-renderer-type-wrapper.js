'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var TEST_RENDER_OUTPUT = { renderOutput: 'Dummy object value to identify test renderer output JSON' };

function getTestRendererOutputWrapper(testRenderer) {
  return {
    _isTestRenderOutput: TEST_RENDER_OUTPUT,
    json: testRenderer.toJSON(),
    renderer: testRenderer // We keep the renderer around, so we can reuse the renderer for further events
  };
}

function isTestRendererOutputWrapper(value) {
  return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value._isTestRenderOutput === TEST_RENDER_OUTPUT;
}

function getRendererOutputJson(value) {
  return value.json;
}

function rewrapResult(wrapper, newJson) {
  return {
    _isTestRenderOutput: TEST_RENDER_OUTPUT,
    json: newJson,
    renderer: wrapper.renderer
  };
}

exports.getTestRendererOutputWrapper = getTestRendererOutputWrapper;
exports.isTestRendererOutputWrapper = isTestRendererOutputWrapper;
exports.getRendererOutputJson = getRendererOutputJson;
exports.rewrapResult = rewrapResult;