import UnexpectedHtmlLike from 'unexpected-htmllike';
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

/**
 *
 * @param options {object}
 * @param options.ActualAdapter {function} constructor function the HtmlLike adapter for the `actual` value (usually the renderer)
 * @param options.ExpectedAdapter {function} constructor function the HtmlLike adapter for the `expected` value
 * @param options.actualTypeName {string} name of the unexpected type for the `actual` value
 * @param options.expectedTypeName {string} name of the unexpected type for the `expected` value
 * @param options.actualRenderOutputType {string} the unexpected type for the actual output value
 * @param options.getRenderOutput {function} called with the actual value, and returns the `actualRenderOutputType` type
 * @param options.getDiffInputFromRenderOutput {function} called with the value from `getRenderOutput`, result passed to HtmlLike diff
 * @param options.rewrapResult {function} called with the `actual` value (usually the renderer), and the found result 
 * from HtmlLike `contains()` call (usually the same type returned from `getDiffInputFromRenderOutput`. Used to create a
 * value that contains both the original renderer and the target or partial result. Used by `queried for`
 * @param options.triggerEvent {function} called the `actual` value (renderer), the optional target (or null) as the result
 * from the HtmlLike `contains()` call target, the eventName, and optional eventArgs when provided (undefined otherwise)
 * @constructor
 */
function AssertionGenerator(options) {
  this._options = Object.assign({}, options);
}


AssertionGenerator.prototype.installInto = function installInto(expect) {
  
  const { 
    actualTypeName, expectedTypeName, getRenderOutput, actualRenderOutputType,
    getDiffInputFromRenderOutput, rewrapResult, triggerEvent,
    ActualAdapter, ExpectedAdapter 
  } = this._options;

  const actualPendingEventTypeName = actualTypeName + 'PendingEvent';

  const PENDING_EVENT_IDENTIFIER = { dummy: actualTypeName + 'PendingEventIdentifier' };
  
  expect.addAssertion([`<${actualTypeName}> to have [exactly] rendered <${expectedTypeName}>`,
    `<${actualTypeName}> to have rendered [with all children] [with all wrappers] <${expectedTypeName}>`], 
    function (expect, subject, renderOutput) {
      var actual = getRenderOutput(subject);
      return expect(actual, 'to have [exactly] rendered [with all children] [with all wrappers]', renderOutput);
  });
  
  expect.addAssertion([
    `<${actualRenderOutputType}> to have [exactly] rendered <${expectedTypeName}>`,
    `<${actualRenderOutputType}> to have rendered [with all children] [with all wrappers] <${expectedTypeName}>`
  ], function (expect, subject, renderOutput) {
    
    const exactly = this.flags.exactly;
    const withAllChildren = this.flags['with all children'];
    const withAllWrappers = this.flags['with all wrappers'];
    
    const actualAdapter = new ActualAdapter();
    const expectedAdapter = new ExpectedAdapter();
    const testHtmlLike = new UnexpectedHtmlLike(actualAdapter);
    if (!exactly) {
      expectedAdapter.setOptions({ concatTextContent: true });
      actualAdapter.setOptions({ concatTextContent: true });
    }
    
    const options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren });
    
    const diffResult = testHtmlLike.diff(expectedAdapter, getDiffInputFromRenderOutput(subject), renderOutput, expect, options);
    
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
  
  expect.addAssertion([`<${actualTypeName}> [not] to contain [exactly] <${expectedTypeName}|string>`,
    `<${actualTypeName}> [not] to contain [with all children] [with all wrappers] <${expectedTypeName}|string>`], function (expect, subject, renderOutput) {
    var actual = getRenderOutput(subject);
    return expect(actual, '[not] to contain [exactly] [with all children] [with all wrappers]', renderOutput);
  });
  
  expect.addAssertion([`<${actualRenderOutputType}> [not] to contain [exactly] <${expectedTypeName}|string>`,
    `<${actualRenderOutputType}> [not] to contain [with all children] [with all wrappers] <${expectedTypeName}|string>`], function (expect, subject, expected) {
    
    var not = this.flags.not;
    var exactly = this.flags.exactly;
    var withAllChildren = this.flags['with all children'];
    var withAllWrappers = this.flags['with all wrappers'];
    
    var actualAdapter = new ActualAdapter();
    var expectedAdapter = new ExpectedAdapter();
    var testHtmlLike = new UnexpectedHtmlLike(actualAdapter);
    if (!exactly) {
      actualAdapter.setOptions({ concatTextContent: true });
      expectedAdapter.setOptions({ concatTextContent: true });
    }
    
    var options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren });
    
    const containsResult = testHtmlLike.contains(expectedAdapter, getDiffInputFromRenderOutput(subject), expected, expect, options);
    
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
  
  expect.addAssertion([`<${actualTypeName}> queried for [exactly] <${expectedTypeName}> <assertion?>`,
    `<${actualTypeName}> queried for [with all children] [with all wrapppers] <${expectedTypeName}> <assertion?>`
  ], function (expect, subject, query, assertion) {
    return expect.apply(expect,
      [
        getRenderOutput(subject), 'queried for [exactly] [with all children] [with all wrappers]', query
      ].concat(Array.prototype.slice.call(arguments, 3)));
  });
  
  expect.addAssertion([`<${actualRenderOutputType}> queried for [exactly] <${expectedTypeName}> <assertion?>`,
    `<${actualRenderOutputType}> queried for [with all children] [with all wrapppers] <${expectedTypeName}> <assertion?>`], function (expect, subject, query) {
    
    var exactly = this.flags.exactly;
    var withAllChildren = this.flags['with all children'];
    var withAllWrappers = this.flags['with all wrappers'];
    
    var actualAdapter = new ActualAdapter();
    var expectedAdapter = new ExpectedAdapter();
    var testHtmlLike = new UnexpectedHtmlLike(actualAdapter);
    if (!exactly) {
      actualAdapter.setOptions({ concatTextContent: true });
      expectedAdapter.setOptions({ concatTextContent: true });
    }
    
    const options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren });
    options.findTargetAttrib = 'queryTarget';
    
    const containsResult = testHtmlLike.contains(expectedAdapter, getDiffInputFromRenderOutput(subject), query, expect, options);
    
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
      
      return expect.shift(rewrapResult(subject, result.bestMatch.target || result.bestMatchItem));
    });
  });

  expect.addType({
    name: actualPendingEventTypeName,
    identify(value) {
      return value && typeof value === 'object' && value.$$typeof === PENDING_EVENT_IDENTIFIER;
    }
  });

  expect.addAssertion(`<${actualTypeName}> with event <string> <assertion?>`, function (expect, subject, eventName) {
    if (arguments.length > 3) {
      return expect.shift({
        $$typeof: PENDING_EVENT_IDENTIFIER,
        renderer: subject,
        eventName: eventName
      });
    } else {
      triggerEvent(subject, null, eventName);
      return expect.shift(subject);
    }
  });

  expect.addAssertion(`<${actualPendingEventTypeName}> to have [exactly] rendered [with all children] [with all wrappers] <${expectedTypeName}>`,
    function (expect, subject, expected) {
      triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      return expect(subject.renderer, 'to have [exactly] rendered [with all children] [with all wrappers]', expected);
  });

  expect.addAssertion(`<${actualTypeName}> with event <string> <object> <assertion?>`, function (expect, subject, eventName, args) {
    if (arguments.length > 4) {
      return expect.shift({
        $$typeof: PENDING_EVENT_IDENTIFIER,
        renderer: subject,
        eventName: eventName,
        eventArgs: args
      });
    } else {
      triggerEvent(subject, null, eventName, args);
      return expect.shift(subject);
    }
  });

  expect.addAssertion(`<${actualPendingEventTypeName}> [and] with event <string> <assertion?>`,
    function (expect, subject, eventName) {

      triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      if (arguments.length > 3) {
        return expect.shift({
          $$typeof: PENDING_EVENT_IDENTIFIER,
          renderer: subject.renderer,
          eventName: eventName
        });
      } else {
        triggerEvent(subject.renderer, null, eventName);
        return expect.shift(subject.renderer);
      }
  });
  
  expect.addAssertion(`<${actualPendingEventTypeName}> [and] with event <string> <object> <assertion?>`,
    function (expect, subject, eventName, eventArgs) {
      
      triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      if (arguments.length > 4) {
        return expect.shift({
          $$typeof: PENDING_EVENT_IDENTIFIER,
          renderer: subject.renderer,
          eventName: eventName,
          eventArgs: eventArgs
        });
      } else {
        triggerEvent(subject.renderer, null, eventName, eventArgs);
        return expect.shift(subject.renderer);
      }
    });

  expect.addAssertion([`<${actualPendingEventTypeName}> [not] to contain [exactly] <${expectedTypeName}>`,
    `<${actualPendingEventTypeName}> [not] to contain [with all children] [with all wrappers] <${expectedTypeName}>`],
    function (expect, subject, expected) {
      triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      return expect(subject.renderer, '[not] to contain [exactly] [with all children] [with all wrappers]', expected);
  });

  expect.addAssertion(`<${actualPendingEventTypeName}> on [exactly] [with all children] [with all wrappers] <${expectedTypeName}> <assertion?>`,
  function (expect, subject, target) {
    const actualAdapter = new ActualAdapter({ convertToString: true, concatTextContent: true });
    const expectedAdapter = new ExpectedAdapter({ convertToString: true, concatTextContent: true });
    const testHtmlLike = new UnexpectedHtmlLike(actualAdapter);

    const exactly = this.flags.exactly;
    const withAllChildren = this.flags['with all children'];
    const withAllWrappers = this.flags['with all wrappers'];

    const options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren });
    options.findTargetAttrib = 'eventTarget';

    const containsResult = testHtmlLike.contains(expectedAdapter, getDiffInputFromRenderOutput(getRenderOutput(subject.renderer)), target, expect, options);
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

  expect.addAssertion([`<${actualPendingEventTypeName}> queried for [exactly] <${expectedTypeName}> <assertion?>`,
    `<${actualPendingEventTypeName}> queried for [with all children] [with all wrappers] <${expectedTypeName}> <assertion?>`],
    function (expect, subject, expected) {
    
      triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      return expect.apply(expect,
        [subject.renderer, 'queried for [exactly] [with all children] [with all wrappers]', expected]
          .concat(Array.prototype.slice.call(arguments, 3)));
    }
  );
  
  // More generic assertions
  expect.addAssertion(`<${actualTypeName}> to equal <${expectedTypeName}>`, function (expect, subject, expected) {
    expect(getRenderOutput(subject), 'to equal', expected);
  });
  expect.addAssertion(`<${actualRenderOutputType}> to equal <${expectedTypeName}>`, function (expect, subject, expected) {
    expect(subject, 'to have exactly rendered', expected);
  });
  
  expect.addAssertion(`<${actualTypeName}> to satisfy <${expectedTypeName}>`, function (expect, subject, expected) {
    expect(getRenderOutput(subject), 'to satisfy', expected);
  });
  
  expect.addAssertion(`<${actualRenderOutputType}> to satisfy <${expectedTypeName}>`, function (expect, subject, expected) {
    expect(subject, 'to have rendered', expected);
  });
  
};


export default AssertionGenerator;
