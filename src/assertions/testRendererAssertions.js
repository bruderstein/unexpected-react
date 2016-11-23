import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';
import TestRendererAdapter from 'unexpected-htmllike-testrenderer-adapter';
import * as TestRendererTypeWrapper from '../types/test-renderer-type-wrapper';
import AssertionGenerator from './AssertionGenerator';


function installInto(expect) {
  
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
  
  const assertionGenerator = new AssertionGenerator({
    ActualAdapter: TestRendererAdapter,
    QueryAdapter: ReactElementAdapter,
    ExpectedAdapter: ReactElementAdapter,
    actualTypeName: 'ReactTestRenderer',
    queryTypeName: 'ReactElement',
    expectedTypeName: 'ReactElement',
    getRenderOutput: renderer => TestRendererTypeWrapper.getTestRendererOutputWrapper(renderer),
    actualRenderOutputType: 'ReactTestRendererOutput',
    getDiffInputFromRenderOutput: renderOutput => TestRendererTypeWrapper.getRendererOutputJson(renderOutput),
    rewrapResult: (renderer, target) => TestRendererTypeWrapper.rewrapResult(renderer, target),
    triggerEvent: triggerEvent
  });
  assertionGenerator.installInto(expect);
  
  return assertionGenerator;
}

export { installInto };
