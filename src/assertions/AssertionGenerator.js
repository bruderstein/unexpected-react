import UnexpectedHtmlLike from 'unexpected-htmllike';
import React from 'react';

const PENDING_TEST_EVENT_TYPE = { dummy: 'Dummy object to identify a pending event on the test renderer' };

function getDefaultOptions(flags) {
  return {
    diffWrappers: flags.exactly || flags.withAllWrappers,
    diffExtraChildren: flags.exactly || flags.withAllChildren,
    diffExtraAttributes: flags.exactly || flags.withAllAttributes,
    diffExactClasses: flags.exactly,
    diffExtraClasses: flags.exactly || flags.withAllClasses
  };
}

/**
 *
 * @param options {object}
 * @param options.ActualAdapter {function} constructor function for the HtmlLike adapter for the `actual` value (usually the renderer)
 * @param options.ExpectedAdapter {function} constructor function for the HtmlLike adapter for the `expected` value
 * @param options.QueryAdapter {function} constructor function for the HtmlLike adapter for the query value (`queried for` and `on`)
 * @param options.actualTypeName {string} name of the unexpected type for the `actual` value
 * @param options.expectedTypeName {string} name of the unexpected type for the `expected` value
 * @param options.queryTypeName {string} name of the unexpected type for the query value (used in `queried for` and `on`)
 * @param options.actualRenderOutputType {string} the unexpected type for the actual output value
 * @param options.getRenderOutput {function} called with the actual value, and returns the `actualRenderOutputType` type
 * @param options.getDiffInputFromRenderOutput {function} called with the value from `getRenderOutput`, result passed to HtmlLike diff
 * @param options.rewrapResult {function} called with the `actual` value (usually the renderer), and the found result
 * @param options.wrapResultForReturn {function} called with the `actual` value (usually the renderer), and the found result
 * from HtmlLike `contains()` call (usually the same type returned from `getDiffInputFromRenderOutput`. Used to create a
 * value that can be passed back to the user as the result of the promise. Used by `queried for` when no further assertion is
 * provided, therefore the return value is provided as the result of the promise. If this is not present, `rewrapResult` is used.
 * @param options.triggerEvent {function} called the `actual` value (renderer), the optional target (or null) as the result
 * from the HtmlLike `contains()` call target, the eventName, and optional eventArgs when provided (undefined otherwise)
 * @constructor
 */
function AssertionGenerator(options) {
  this._options = Object.assign({}, options);
  this._PENDING_EVENT_IDENTIFIER = (options.mainAssertionGenerator && options.mainAssertionGenerator.getEventIdentifier()) ||
    { dummy: options.actualTypeName + 'PendingEventIdentifier' };
  this._actualPendingEventTypeName = options.actualTypeName + 'PendingEvent';
}

AssertionGenerator.prototype.getEventIdentifier = function () {
  return this._PENDING_EVENT_IDENTIFIER;
};

AssertionGenerator.prototype.installInto = function installInto(expect) {
  this._installEqualityAssertions(expect);
  this._installQueriedFor(expect);
  this._installPendingEventType(expect);
  this._installWithEvent(expect);
  this._installWithEventOn(expect);
  this._installEventHandlerAssertions(expect);
};

AssertionGenerator.prototype.installAlternativeExpected = function (expect) {
  this._installEqualityAssertions(expect);
  this._installEventHandlerAssertions(expect);
}

AssertionGenerator.prototype._installEqualityAssertions = function (expect) {
  const {
    actualTypeName, expectedTypeName,
    getRenderOutput, actualRenderOutputType,
    getDiffInputFromRenderOutput,
    ActualAdapter, ExpectedAdapter
  } = this._options;
  
  
  expect.addAssertion([`<${actualTypeName}> to have [exactly] rendered <${expectedTypeName}>`,
      `<${actualTypeName}> to have rendered [with all children] [with all wrappers] [with all classes] [with all attributes] <${expectedTypeName}>`],
    function (expect, subject, renderOutput) {
      var actual = getRenderOutput(subject);
      return expect(actual, 'to have [exactly] rendered [with all children] [with all wrappers] [with all classes] [with all attributes]', renderOutput);
    });
  
  expect.addAssertion([
    `<${actualRenderOutputType}> to have [exactly] rendered <${expectedTypeName}>`,
    `<${actualRenderOutputType}> to have rendered [with all children] [with all wrappers] [with all classes] [with all attributes] <${expectedTypeName}>`
  ], function (expect, subject, renderOutput) {
    
    const exactly = this.flags.exactly;
    const withAllChildren = this.flags['with all children'];
    const withAllWrappers = this.flags['with all wrappers'];
    const withAllClasses = this.flags['with all classes'];
    const withAllAttributes = this.flags['with all attributes'];
    
    const actualAdapter = new ActualAdapter();
    const expectedAdapter = new ExpectedAdapter();
    const testHtmlLike = new UnexpectedHtmlLike(actualAdapter);
    if (!exactly) {
      expectedAdapter.setOptions({concatTextContent: true});
      actualAdapter.setOptions({concatTextContent: true});
    }
    
    const options = getDefaultOptions({exactly, withAllWrappers, withAllChildren, withAllClasses, withAllAttributes});
    
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
    `<${actualTypeName}> [not] to contain [with all children] [with all wrappers] [with all classes] [with all attributes] <${expectedTypeName}|string>`], function (expect, subject, renderOutput) {
    var actual = getRenderOutput(subject);
    return expect(actual, '[not] to contain [exactly] [with all children] [with all wrappers] [with all classes] [with all attributes]', renderOutput);
  });
  
  expect.addAssertion([`<${actualRenderOutputType}> [not] to contain [exactly] <${expectedTypeName}|string>`,
    `<${actualRenderOutputType}> [not] to contain [with all children] [with all wrappers] [with all classes] [with all attributes] <${expectedTypeName}|string>`], function (expect, subject, expected) {
    
    var not = this.flags.not;
    var exactly = this.flags.exactly;
    var withAllChildren = this.flags['with all children'];
    var withAllWrappers = this.flags['with all wrappers'];
    var withAllClasses = this.flags['with all classes'];
    var withAllAttributes = this.flags['with all attributes'];
    
    var actualAdapter = new ActualAdapter();
    var expectedAdapter = new ExpectedAdapter();
    var testHtmlLike = new UnexpectedHtmlLike(actualAdapter);
    if (!exactly) {
      actualAdapter.setOptions({concatTextContent: true});
      expectedAdapter.setOptions({concatTextContent: true});
    }
    
    var options = getDefaultOptions({exactly, withAllWrappers, withAllChildren, withAllClasses, withAllAttributes});
    
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

AssertionGenerator.prototype._installQueriedFor = function (expect) {
  
  const {
    actualTypeName, queryTypeName,
    getRenderOutput, actualRenderOutputType,
    getDiffInputFromRenderOutput, rewrapResult, wrapResultForReturn,
    ActualAdapter, QueryAdapter
  } = this._options;
  
  expect.addAssertion([`<${actualTypeName}> queried for [exactly] <${queryTypeName}> <assertion?>`,
    `<${actualTypeName}> queried for [with all children] [with all wrapppers] [with all classes] [with all attributes] <${queryTypeName}> <assertion?>`
  ], function (expect, subject, query, assertion) {
      return expect.apply(expect,
        [
          getRenderOutput(subject), 'queried for [exactly] [with all children] [with all wrappers] [with all classes] [with all attributes]', query
        ].concat(Array.prototype.slice.call(arguments, 3)));
  });
  
  expect.addAssertion([`<${actualRenderOutputType}> queried for [exactly] <${queryTypeName}> <assertion?>`,
    `<${actualRenderOutputType}> queried for [with all children] [with all wrapppers] [with all classes] [with all attributes] <${queryTypeName}> <assertion?>`], function (expect, subject, query) {
    
    var exactly = this.flags.exactly;
    var withAllChildren = this.flags['with all children'];
    var withAllWrappers = this.flags['with all wrappers'];
    var withAllClasses = this.flags['with all classes'];
    var withAllAttributes = this.flags['with all attributes'];
    
    var actualAdapter = new ActualAdapter();
    var queryAdapter = new QueryAdapter();
    var testHtmlLike = new UnexpectedHtmlLike(actualAdapter);
    if (!exactly) {
      actualAdapter.setOptions({concatTextContent: true});
      queryAdapter.setOptions({concatTextContent: true});
    }
    
    const options = getDefaultOptions({exactly, withAllWrappers, withAllChildren, withAllClasses, withAllAttributes});
    options.findTargetAttrib = 'queryTarget';
    
    const containsResult = testHtmlLike.contains(queryAdapter, getDiffInputFromRenderOutput(subject), query, expect, options);
    
    const args = arguments;
    
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
      
      if (args.length > 3) {
        // There is an assertion continuation...
        expect.errorMode = 'nested'
        const s = rewrapResult(subject, result.bestMatch.target || result.bestMatchItem);
        return expect.apply(null,
          [
            rewrapResult(subject, result.bestMatch.target || result.bestMatchItem)
          ].concat(Array.prototype.slice.call(args, 3)))
        return expect.shift(rewrapResult(subject, result.bestMatch.target || result.bestMatchItem));
      }
      // There is no assertion continuation, so we need to wrap the result for public consumption
      // i.e. create a value that we can give back from the `expect` promise
      return expect.shift((wrapResultForReturn || rewrapResult)(subject, result.bestMatch.target || result.bestMatchItem));
    });
  });
  
};

AssertionGenerator.prototype._installPendingEventType = function (expect) {
  
  const actualPendingEventTypeName = this._actualPendingEventTypeName;
  
  const PENDING_EVENT_IDENTIFIER = this._PENDING_EVENT_IDENTIFIER;
  
  expect.addType({
    name: actualPendingEventTypeName,
    base: 'object',
    identify(value) {
      return value && typeof value === 'object' && value.$$typeof === PENDING_EVENT_IDENTIFIER;
    },
    inspect(value, depth, output, inspect) {
      return output.append(inspect(value.renderer)).red(' with pending event \'').cyan(value.eventName).red('\'');
    }
  });
};

AssertionGenerator.prototype._installWithEvent = function (expect) {
  
  const { actualTypeName, actualRenderOutputType, triggerEvent, canTriggerEventsOnOutputType } = this._options;
  let { wrapResultForReturn = (value) => value } = this._options;
  
  const actualPendingEventTypeName = this._actualPendingEventTypeName;
  
  const PENDING_EVENT_IDENTIFIER = this._PENDING_EVENT_IDENTIFIER;
  
  expect.addAssertion(`<${actualTypeName}> with event <string> <assertion?>`, function (expect, subject, eventName, ...assertion) {
    if (arguments.length > 3) {
      return expect.apply(null, [{
        $$typeof: PENDING_EVENT_IDENTIFIER,
        renderer: subject,
        eventName: eventName
      }].concat(assertion));
    } else {
      triggerEvent(subject, null, eventName);
      return expect.shift(wrapResultForReturn(subject));
    }
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
  
  if (canTriggerEventsOnOutputType) {
    
    expect.addAssertion(`<${actualRenderOutputType}> with event <string> <assertion?>`, function (expect, subject, eventName, ...assertion) {
      if (arguments.length > 3) {
        return expect.apply(null, [{
          $$typeof: PENDING_EVENT_IDENTIFIER,
          renderer: subject,
          eventName: eventName,
          isOutputType: true
        }].concat(assertion));
      } else {
        triggerEvent(subject, null, eventName);
        return expect.shift(wrapResultForReturn(subject));
      }
    });
    
    expect.addAssertion(`<${actualRenderOutputType}> with event <string> <object> <assertion?>`, function (expect, subject, eventName, args) {
      if (arguments.length > 4) {
        return expect.shift({
          $$typeof: PENDING_EVENT_IDENTIFIER,
          renderer: subject,
          eventName: eventName,
          eventArgs: args,
          isOutputType: true
        });
      } else {
        triggerEvent(subject, null, eventName, args);
        return expect.shift(subject);
      }
    });
    
  }
  
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
  
};

AssertionGenerator.prototype._installWithEventOn = function (expect) {
  
  const {
    actualTypeName, queryTypeName, expectedTypeName,
    getRenderOutput,
    getDiffInputFromRenderOutput, triggerEvent,
    ActualAdapter, QueryAdapter
  } = this._options;
  
  const actualPendingEventTypeName = this._actualPendingEventTypeName;
  
  expect.addAssertion(`<${actualPendingEventTypeName}> on [exactly] [with all children] [with all wrappers] [with all classes] [with all attributes]<${queryTypeName}> <assertion?>`,
    function (expect, subject, target) {
      const actualAdapter = new ActualAdapter({ convertToString: true, concatTextContent: true });
      const queryAdapter = new QueryAdapter({ convertToString: true, concatTextContent: true });
      const testHtmlLike = new UnexpectedHtmlLike(actualAdapter);
      
      const exactly = this.flags.exactly;
      const withAllChildren = this.flags['with all children'];
      const withAllWrappers = this.flags['with all wrappers'];
      const withAllClasses = this.flags['with all classes'];
      const withAllAttributes = this.flags['with all attributes'];
      
      const options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren, withAllClasses, withAllAttributes});
      options.findTargetAttrib = 'eventTarget';
      
      const containsResult = testHtmlLike.contains(queryAdapter, getDiffInputFromRenderOutput(getRenderOutput(subject.renderer)), target, expect, options);
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
  
  expect.addAssertion([`<${actualPendingEventTypeName}> queried for [exactly] <${queryTypeName}> <assertion?>`,
      `<${actualPendingEventTypeName}> queried for [with all children] [with all wrappers] [with all classes] [with all attributes] <${queryTypeName}> <assertion?>`],
    function (expect, subject, expected) {
      
      triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      return expect.apply(expect,
        [subject.renderer, 'queried for [exactly] [with all children] [with all wrappers] [with all classes] [with all attributes]', expected]
          .concat(Array.prototype.slice.call(arguments, 3)));
    }
  );
};

AssertionGenerator.prototype._installEventHandlerAssertions = function (expect) {
  const { actualTypeName, expectedTypeName, triggerEvent } = this._options;
  
  const actualPendingEventTypeName = this._actualPendingEventTypeName;

  expect.addAssertion([`<${actualPendingEventTypeName}> [not] to contain [exactly] <${expectedTypeName}>`,
    `<${actualPendingEventTypeName}> [not] to contain [with all children] [with all wrappers] [with all classes] [with all attributes] <${expectedTypeName}>`],
    function (expect, subject, expected) {
      triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      return expect(subject.renderer, '[not] to contain [exactly] [with all children] [with all wrappers] [with all classes] [with all attributes]', expected);
  });
  
  expect.addAssertion(`<${actualPendingEventTypeName}> to have [exactly] rendered [with all children] [with all wrappers] [with all classes] [with all attributes] <${expectedTypeName}>`,
    function (expect, subject, expected) {
      triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      return expect(subject.renderer, 'to have [exactly] rendered [with all children] [with all wrappers] [with all classes] [with all attributes]', expected);
    });
};


export default AssertionGenerator;
