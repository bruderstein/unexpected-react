import UnexpectedHtmlLike from 'unexpected-htmllike';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';
import TestRendererAdapter from 'unexpected-htmllike-testrenderer-adapter';
import * as TestRendererTypeWrapper from './test-renderer-type-wrapper';
import React from 'react';

const PENDING_TEST_EVENT_TYPE = { dummy: 'Dummy object to identify a pending event on the test renderer' };

function getDefaultOptions(flags) {
  return {
    diffWrappers: flags.exactly || flags.withAllWrappers,
    diffExtraChildren: flags.exactly || flags.withAllChildren,
    diffExtraAttributes: flags.exactly,
    diffExactClasses: flags.exactly,
    diffExtraClasses: flags.exactly
  };
}

function installInto(expect) {
  
  expect.addAssertion(['<ReactTestRenderer> to have [exactly] rendered <ReactElement>',
    '<ReactTestRenderer> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, renderOutput) {
    var actual = TestRendererTypeWrapper.getTestRendererOutputWrapper(subject);
    return expect(actual, 'to have [exactly] rendered [with all children] [with all wrappers]', renderOutput);
  });
  
  expect.addAssertion([
    '<ReactTestRendererOutput> to have [exactly] rendered <ReactElement>',
    '<ReactTestRendererOutput> to have rendered [with all children] [with all wrappers] <ReactElement>'
    ], function (expect, subject, renderOutput) {
  
    const exactly = this.flags.exactly;
    const withAllChildren = this.flags['with all children'];
    const withAllWrappers = this.flags['with all wrappers'];
  
    const reactElementAdapter = new ReactElementAdapter();
    const testRendererAdapter = new TestRendererAdapter();
    const testHtmlLike = new UnexpectedHtmlLike(testRendererAdapter);
    if (!exactly) {
      testRendererAdapter.setOptions({ concatTextContent: true });
      reactElementAdapter.setOptions({ concatTextContent: true });
    }
  
    const options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren });
  
    const diffResult = testHtmlLike.diff(reactElementAdapter, TestRendererTypeWrapper.getRendererOutputJson(subject), renderOutput, expect, options);
  
    return testHtmlLike.withResult(diffResult, result => {
    
      if (result.weight !== 0) {
        return expect.fail({
          diff: function (output, diff, inspect) {
            return {
              diff: output.append(testHtmlLike.render(result, output.clone(), diff, inspect))
            };
          }
        });
      }
    });
  });

  expect.addAssertion(['<ReactTestRenderer> [not] to contain [exactly] <ReactElement|string>',
    '<ReactTestRenderer> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, renderOutput) {
    var actual = TestRendererTypeWrapper.getTestRendererOutputWrapper(subject);
    return expect(actual, '[not] to contain [exactly] [with all children] [with all wrappers]', renderOutput);
  });

  expect.addAssertion(['<ReactTestRendererOutput> [not] to contain [exactly] <ReactElement|string>',
    '<ReactTestRendererOutput> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, expected) {

    var not = this.flags.not;
    var exactly = this.flags.exactly;
    var withAllChildren = this.flags['with all children'];
    var withAllWrappers = this.flags['with all wrappers'];

    var testAdapter = new TestRendererAdapter();
    var jsxAdapter = new ReactElementAdapter();
    var testHtmlLike = new UnexpectedHtmlLike(testAdapter);
    if (!exactly) {
      testAdapter.setOptions({ concatTextContent: true });
      jsxAdapter.setOptions({ concatTextContent: true });
    }

    var options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren });

    const containsResult = testHtmlLike.contains(jsxAdapter, TestRendererTypeWrapper.getRendererOutputJson(subject), expected, expect, options);

    return testHtmlLike.withResult(containsResult, result => {

      if (not) {
        if (result.found) {
          expect.fail({
            diff: (output, diff, inspect) => {
              return {
                diff: output.error('but found the following match').nl().append(testHtmlLike.render(result.bestMatch, output.clone(), diff, inspect))
              };
            }
          });
        }
        return;
      }

      if (!result.found) {
        expect.fail({
          diff: function (output, diff, inspect) {
            return {
              diff: output.error('the best match was').nl().append(testHtmlLike.render(result.bestMatch, output.clone(), diff, inspect))
            };
          }
        });
      }
    });
  });
  
  
  expect.addAssertion(['<ReactTestRenderer> queried for [exactly] <ReactElement> <assertion?>',
    '<ReactTestRenderer> queried for [with all children] [with all wrapppers] <ReactElement> <assertion?>'
  ], function (expect, subject, query, assertion) {
    return expect.apply(expect,
      [
        TestRendererTypeWrapper.getTestRendererOutputWrapper(subject), 'queried for [exactly] [with all children] [with all wrappers]', query
      ].concat(Array.prototype.slice.call(arguments, 3)));
  });
  
  expect.addAssertion(['<ReactTestRendererOutput> queried for [exactly] <ReactElement> <assertion?>',
    '<ReactTestRendererOutput> queried for [with all children] [with all wrapppers] <ReactElement> <assertion?>'], function (expect, subject, query) {
    
    var exactly = this.flags.exactly;
    var withAllChildren = this.flags['with all children'];
    var withAllWrappers = this.flags['with all wrappers'];
  
    var testAdapter = new TestRendererAdapter();
    var jsxAdapter = new ReactElementAdapter();
    var testHtmlLike = new UnexpectedHtmlLike(testAdapter);
    if (!exactly) {
      testAdapter.setOptions({ concatTextContent: true });
      jsxAdapter.setOptions({ concatTextContent: true });
    }
    
    const options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren });
    options.findTargetAttrib = 'queryTarget';
    
    const containsResult = testHtmlLike.contains(jsxAdapter, TestRendererTypeWrapper.getRendererOutputJson(subject), query, expect, options);
    
    return testHtmlLike.withResult(containsResult, function (result) {
      
      if (!result.found) {
        expect.fail({
          diff: (output, diff, inspect) => {
            const resultOutput = {
              diff: output.error('`queried for` found no match.')
            };
            if (result.bestMatch) {
              resultOutput.diff.error('  The best match was')
                .nl()
                .append(testHtmlLike.render(result.bestMatch, output.clone(), diff, inspect));
            }
            return resultOutput;
          }
        });
      }
      
      return expect.shift(TestRendererTypeWrapper.rewrapResult(subject, result.bestMatch.target || result.bestMatchItem));
    });
  });

  expect.addType({
    name: 'ReactTestRendererPendingEvent',
    identify(value) {
      return value && typeof value === 'object' && value.$$typeof === PENDING_TEST_EVENT_TYPE;
    }
  });

  expect.addAssertion('<ReactTestRenderer> with event <string> <assertion?>', function (expect, subject, eventName) {
    if (arguments.length > 3) {
      return expect.shift({
        $$typeof: PENDING_TEST_EVENT_TYPE,
        renderer: subject,
        eventName: eventName
      });
    } else {
      triggerEvent(subject, null, eventName);
      return expect.shift(subject);
    }
  });

  expect.addAssertion('<ReactTestRenderer> with event <string> <object> <assertion?>', function (expect, subject, eventName, args) {
    if (arguments.length > 4) {
      return expect.shift({
        $$typeof: PENDING_TEST_EVENT_TYPE,
        renderer: subject,
        eventName: eventName,
        eventArgs: args
      });
    } else {
      triggerEvent(subject, null, eventName, args);
      return expect.shift(subject);
    }
  });
  
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
  
  
  expect.addAssertion('<ReactTestRendererPendingEvent> to have [exactly] rendered [with all children] [with all wrappers] <ReactElement>', function (expect, subject, expected) {
    
    triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
    return expect(subject.renderer, 'to have [exactly] rendered [with all children] [with all wrappers]', expected);
  });
  
  expect.addAssertion('<ReactTestRendererPendingEvent> [and] with event <string> <assertion?>', function (expect, subject, eventName) {
    
    triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
    if (arguments.length > 3) {
      return expect.shift({
        $$typeof: PENDING_TEST_EVENT_TYPE,
        renderer: subject.renderer,
        eventName: eventName
      });
    } else {
      triggerEvent(subject.renderer, null, eventName);
      return expect.shift(subject.renderer);
    }
  });
  
  expect.addAssertion(['<ReactTestRendererPendingEvent> [not] to contain [exactly] <ReactElement>',
    '<ReactTestRendererPendingEvent> [not] to contain [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, expected) {
    
    triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
    return expect(subject.renderer, '[not] to contain [exactly] [with all children] [with all wrappers]', expected);
  });
  
  
  expect.addAssertion('<ReactTestRendererPendingEvent> on [exactly] [with all children] [with all wrappers] <ReactElement> <assertion?>', function (expect, subject, target) {
    const testAdapter = new TestRendererAdapter({ convertToString: true, concatTextContent: true });
    const jsxAdapter = new ReactElementAdapter({ convertToString: true, concatTextContent: true });
    const testHtmlLike = new UnexpectedHtmlLike(testAdapter);
    
    const exactly = this.flags.exactly;
    const withAllChildren = this.flags['with all children'];
    const withAllWrappers = this.flags['with all wrappers'];
    
    const options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren });
    options.findTargetAttrib = 'eventTarget';
    
    const containsResult = testHtmlLike.contains(jsxAdapter, subject.renderer.toJSON(), target, expect, options);
    return testHtmlLike.withResult(containsResult, result => {
      if (!result.found) {
        return expect.fail({
          diff: function (output, diff, inspect) {
            output.error('Could not find the target for the event. ');
            if (result.bestMatch) {
              output.error('The best match was').nl().nl().append(testHtmlLike.render(result.bestMatch, output.clone(), diff, inspect));
            }
            return output;
          }
        });
      }
      
      const newSubject = Object.assign({}, subject, {
        target: result.bestMatch.target || result.bestMatchItem
      });
      
      if (arguments.length > 3) {
        return expect.shift(newSubject);
      } else {
        triggerEvent(newSubject.renderer, newSubject.target, newSubject.eventName, newSubject.eventArgs);
        return expect.shift(newSubject.renderer);
      }
    });
  });
  
  expect.addAssertion(['<ReactTestRendererPendingEvent> queried for [exactly] <ReactElement> <assertion?>',
    '<ReactTestRendererPendingEvent> queried for [with all children] [with all wrappers] <ReactElement> <assertion?>'], function (expect, subject, expected) {
    
    triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
    return expect.apply(expect,
      [subject.renderer, 'queried for [exactly] [with all children] [with all wrappers]', expected]
        .concat(Array.prototype.slice.call(arguments, 3)));
  });
  
}

export { installInto };
