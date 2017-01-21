import RenderHook from 'react-render-hook';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import AssertionGenerator from './AssertionGenerator';

function triggerEvent(expect, renderer, target, eventName, eventArgs) {
  
  if (!target) {
    target = renderer.getRenderOutput();
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


function installInto(expect) {
    
    const assertionGenerator = new AssertionGenerator({
        ActualAdapter: ReactElementAdapter,
        QueryAdapter: ReactElementAdapter,
        ExpectedAdapter: ReactElementAdapter,
        actualTypeName: 'ReactShallowRenderer',
        queryTypeName: 'ReactElement',
        expectedTypeName: 'ReactElement',
        getRenderOutput: renderer => renderer.getRenderOutput(),
        actualRenderOutputType: 'ReactElement',
        getDiffInputFromRenderOutput: renderOutput => renderOutput,
        rewrapResult: (renderer, target) => target,
        triggerEvent: triggerEvent.bind(null, expect)
    });
    assertionGenerator.installInto(expect);
    
    // We can convert ReactElements to a renderer by rendering them - but we only do it for `with event`
    expect.addAssertion('<ReactElement> with event <string> <assertion?>', function (expect, subject, eventName) {
        const renderer = TestUtils.createRenderer();
        renderer.render(subject);
        return expect.apply(expect, [renderer, 'with event' ].concat(Array.prototype.slice.call(arguments, 2)));
    });
    
    expect.addAssertion('<ReactElement> with event <string> <object> <assertion?>', function (expect, subject, eventName, eventArgs) {
        const renderer = TestUtils.createRenderer();
        renderer.render(subject);
        return expect.apply(expect, [ renderer, 'with event' ].concat(Array.prototype.slice.call(arguments, 2)));
    });
    
    return assertionGenerator;
} 

export { installInto, triggerEvent };
