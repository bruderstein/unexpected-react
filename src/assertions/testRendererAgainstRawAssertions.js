import RawAdapter from 'unexpected-htmllike-raw-adapter';
import TestRendererAdapter from 'unexpected-htmllike-testrenderer-adapter';
import * as TestRendererTypeWrapper from '../types/test-renderer-type-wrapper';
import AssertionGenerator from './AssertionGenerator';

function triggerEvent(expect, renderer, target, eventName, eventArgs) {
  
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

function getOptions(expect) {
  return {
    ActualAdapter: TestRendererAdapter,
    ExpectedAdapter: RawAdapter,
    actualTypeName: 'ReactTestRenderer',
    expectedTypeName: 'ReactRawObjectElement',
    getRenderOutput: renderer => TestRendererTypeWrapper.getTestRendererOutputWrapper(renderer),
    actualRenderOutputType: 'ReactTestRendererOutput',
    getDiffInputFromRenderOutput: renderOutput => TestRendererTypeWrapper.getRendererOutputJson(renderOutput),
    rewrapResult: (renderer, target) => TestRendererTypeWrapper.rewrapResult(renderer, target),
    triggerEvent: triggerEvent.bind(expect)
  };
}

function installInto(expect) {
  const assertionGenerator = new AssertionGenerator(getOptions(expect));
  assertionGenerator.installInto(expect);
}

function installAsAlternative(expect, mainAssertionGenerator) {
  const generatorOptions = getOptions(expect);
  const assertionGenerator = new AssertionGenerator({ mainAssertionGenerator, ...generatorOptions });
  assertionGenerator.installAlternativeExpected(expect);
}

export { installInto, installAsAlternative, triggerEvent };
