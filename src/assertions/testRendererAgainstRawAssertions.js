import RawAdapter from 'unexpected-htmllike-raw-adapter';
import TestRendererAdapter from 'unexpected-htmllike-testrenderer-adapter';
import * as TestRendererTypeWrapper from '../types/test-renderer-type-wrapper';
import AssertionGenerator from './AssertionGenerator';

function triggerEvent(renderer, target, eventName, eventArgs) {
  
  if (!target) {
    target = renderer.toJSON();
  }
  
  const handlerPropName = 'on' + eventName[0].toUpperCase() + eventName.substr(1);
  const handler = target.props[handlerPropName];
  if (typeof handler !== 'function') {
    return expect.fail({
      diff: function (output) {
        return output.error('No handler function prop ').text("'" + handlerPropName + "'").error(' on the target element');
      }
    });
  }
  handler(eventArgs);
  return renderer;
}

const assertionGeneratorOptions = {
  ActualAdapter: TestRendererAdapter,
  ExpectedAdapter: RawAdapter,
  actualTypeName: 'ReactTestRenderer',
  expectedTypeName: 'ReactRawObjectElement',
  getRenderOutput: renderer => TestRendererTypeWrapper.getTestRendererOutputWrapper(renderer),
  actualRenderOutputType: 'ReactTestRendererOutput',
  getDiffInputFromRenderOutput: renderOutput => TestRendererTypeWrapper.getRendererOutputJson(renderOutput),
  rewrapResult: (renderer, target) => TestRendererTypeWrapper.rewrapResult(renderer, target),
  triggerEvent: triggerEvent
};

function installInto(expect) {
  const assertionGenerator = new AssertionGenerator(assertionGeneratorOptions);
  assertionGenerator.installInto(expect);
}

function installAsAlternative(expect, mainAssertionGenerator) {
  const assertionGenerator = new AssertionGenerator({ mainAssertionGenerator, ...assertionGeneratorOptions });
  assertionGenerator.installAlternativeExpected(expect);
}

export { installInto, installAsAlternative, triggerEvent };
