import RenderHook from 'react-render-hook';
import UnexpectedHtmlLike from 'unexpected-htmllike';
import RenderedReactElementAdapter from 'unexpected-htmllike-reactrendered-adapter';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import { findDOMNode } from 'react-dom';
import AssertionGenerator from './AssertionGenerator';

function checkAttached(expect) {
    if (!RenderHook.isAttached) {
        expect.errorMode = 'bubble';
        expect.fail(output => {
            return output.error('The global rendering hook is not attached')
                .nl().text('This probably means React was required before unexpected-react. Check that unexpected-react is required first');
        });
    }
}

function triggerEvent(expect, component, target, eventName, eventArgs) {
  let componentData;
  if (component &&
    component.data &&
    component.data.type &&
    component.data.nodeType) {
    componentData = component;
  } else {
    componentData = RenderHook.findComponent(component);
  }
  let targetDOM = findDOMNode(componentData.internalInstance.stateNode);
  if (target) {
    targetDOM = findDOMNode(target.internalInstance.stateNode);
  }
  if (typeof TestUtils.Simulate[eventName] !== 'function') {
    
    return expect.fail({
      diff: function (output) {
        return output.error('Event ').text("'" + eventName + "'").error(' is not supported by TestUtils.Simulate');
      }
    });
  }
  TestUtils.Simulate[eventName](targetDOM, eventArgs);
}

function installInto(expect) {
  
  const assertionGenerator = new AssertionGenerator({
    ActualAdapter: RenderedReactElementAdapter,
    QueryAdapter: ReactElementAdapter,
    ExpectedAdapter: ReactElementAdapter,
    actualTypeName: 'RenderedReactElement',
    queryTypeName: 'ReactElement',
    expectedTypeName: 'ReactElement',
    getRenderOutput: component => {
      if (component &&
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
    wrapResultForReturn: (component, target) => ((target && target.internalInstance.stateNode) || component),
    triggerEvent: triggerEvent.bind(null, expect),
    canTriggerEventsOnOutputType: true
  });
  assertionGenerator.installInto(expect);
  
  expect.addAssertion('<ReactModule> to have been injected', function (expect) {
    checkAttached(expect);
  });

  class FunctionWrapper extends React.Component {
      render() {
          return this.props.children;
      }
  }

  expect.addAssertion('<ReactElement> when deeply rendered <assertion?>', function (expect, subject) {
      let component;
      if (subject.type && subject.type.prototype && typeof subject.type.prototype.render === 'function') {
          component = TestUtils.renderIntoDocument(subject);
      } else {
          // Function component
          component = TestUtils.renderIntoDocument(<FunctionWrapper>{subject}</FunctionWrapper>);
          component = RenderHook.findComponent(component);
          if (component) {
              component = component && component.data.children[0] && RenderHook.findInternalComponent(component.data.children[0]);
          } else {
              expect.errorMode = 'nested';
              expect.fail({
                  message(output) {
                      return output.error('Cannot find rendered function component. Are you sure you passed a real component to `when deeply rendered`');
                  }
              });
          }
      }
      return expect.shift(component);
  });

  expect.addAssertion('<ReactElement> to [exactly] deeply render [with all children] [with all wrappers] [with all classes] [with all attributes] as <ReactElement>', function (expect, subject, expected) {
      if (this.flags.exactly) {
          return expect(subject, 'when deeply rendered', 'to have exactly rendered', expected);
      }
      return expect(subject, 'when deeply rendered to have rendered [with all children] [with all wrappers] [with all classes] [with all attributes]', expected);
  });
}

export { installInto, triggerEvent };
