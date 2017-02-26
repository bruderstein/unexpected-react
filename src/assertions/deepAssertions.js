import RenderHook from 'react-render-hook';
import UnexpectedHtmlLike from 'unexpected-htmllike';
import RenderedReactElementAdapter from 'unexpected-htmllike-reactrendered-adapter';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
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
  if (component && component.element &&
    component.data &&
    component.data.type &&
    component.data.nodeType) {
    componentData = component;
  } else {
    componentData = RenderHook.findComponent(component);
  }
  let targetDOM = findDOMNode(componentData.element.getPublicInstance());
  if (target) {
    targetDOM = findDOMNode(target.element.getPublicInstance());
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
  });
  assertionGenerator.installInto(expect);
  
  expect.addAssertion('<ReactModule> to have been injected', function (expect) {
    checkAttached(expect);
  });

  class StatelessWrapper extends React.Component {
      render() {
          return this.props.children;
      }
  }

  expect.addAssertion('<ReactElement> when deeply rendered <assertion?>', function (expect, subject) {
      let component;
      if (subject.prototype && typeof subject.prototype.render === 'function') {
          component = TestUtils.renderIntoDocument(subject);
      } else {
          // Stateless component
          component = TestUtils.renderIntoDocument(<StatelessWrapper>{subject}</StatelessWrapper>);
          component = RenderHook.findComponent(component);
          if (component) {
              component = component && component.data.children[0] && component.data.children[0]._instance;
          } else {
              expect.errorMode = 'nested';
              expect.fail({
                  message(output) {
                      return output.error('Cannot find rendered stateless component. Are you sure you passed a real component to `when deeply rendered`');
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
