import RenderHook from 'react-render-hook';
import UnexpectedHtmlLike from 'unexpected-htmllike';
import RenderedReactElementAdapter from 'unexpected-htmllike-reactrendered-adapter';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';
import RawAdapter from 'unexpected-htmllike-raw-adapter';
import React from 'react';
import { findDOMNode } from 'react-dom';
import AssertionGenerator from './AssertionGenerator';
import { triggerEvent } from './deepAssertions';

function checkAttached(expect) {
  if (!RenderHook.isAttached) {
    expect.errorMode = 'bubble';
    expect.fail(output => {
      return output.error('The global rendering hook is not attached')
        .nl().text('This probably means React was required before unexpected-react. Check that unexpected-react is required first');
    });
  }
}


function getOptions(expect) {
  
  return {
    ActualAdapter: RenderedReactElementAdapter,
    QueryAdapter: ReactElementAdapter,
    ExpectedAdapter: RawAdapter,
    actualTypeName: 'RenderedReactElement',
    queryTypeName: 'ReactElement',
    expectedTypeName: 'ReactRawObjectElement',
    getRenderOutput: component => {
      if (component && component.element &&
        component.data &&
        component.data.type &&
        component.data.nodeType) {
        // The component is already the data node
        // This can happen when mixing events and queried for
        return component;
      }
      checkAttached(expect);
      return RenderHook.findComponent(component);
    },
    actualRenderOutputType: 'RenderedReactElementData',
    getDiffInputFromRenderOutput: renderOutput => renderOutput,
    rewrapResult: (renderer, target) => target,
    wrapResultForReturn: (component, target) => ((target && target.element.getPublicInstance()) || component),
    triggerEvent: triggerEvent.bind(null, expect),
    canTriggerEventsOnOutputType: true
  };
}

function installInto(expect) {
  const assertionGenerator = new AssertionGenerator(getOptions(expect));
  assertionGenerator.installInto(expect);
  
  expect.addAssertion('<ReactModule> to have been injected', function (expect) {
    checkAttached(expect);
  });
  
  return assertionGenerator;
}

function installAsAlternative(expect, mainAssertionGenerator) {
  const generatorOptions = getOptions(expect);
  const assertionGenerator = new AssertionGenerator({ mainAssertionGenerator, ...generatorOptions });
  assertionGenerator.installAlternativeExpected(expect);
}

export { installInto, installAsAlternative, triggerEvent };
