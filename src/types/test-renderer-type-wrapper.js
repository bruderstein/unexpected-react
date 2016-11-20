const TEST_RENDER_OUTPUT = { renderOutput: 'Dummy object value to identify test renderer output JSON' };

function getTestRendererOutputWrapper(testRenderer) {
  return {
    _isTestRenderOutput: TEST_RENDER_OUTPUT,
    json: testRenderer.toJSON(),
    renderer: testRenderer          // We keep the renderer around, so we can reuse the renderer for further events
  };
}

function isTestRendererOutputWrapper(value) {
  return value && typeof value === 'object' && 
      value._isTestRenderOutput === TEST_RENDER_OUTPUT;
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

export { 
  getTestRendererOutputWrapper, 
  isTestRendererOutputWrapper, 
  getRendererOutputJson,
  rewrapResult
};
