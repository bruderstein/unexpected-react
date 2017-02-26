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

function getMessageOnly(options) {
    if (this.getErrorMode() === 'bubble' && this.parent) {
        return getMessageOnly.call(this.parent, options);
    }
    var output = this.outputFromOptions(options);
    if (this.expect.testDescription) {
        output.append(this.expect.standardErrorMessage(output.clone(), options));
    } else if (typeof this.output === 'function') {
        this.output.call(output, output);
    }
    return output;
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


    // Add 'when rendered' to render with the shallow renderer
    expect.addAssertion('<ReactElement> when rendered <assertion?>', function (expect, subject) {
       const renderer = TestUtils.createRenderer();
       renderer.render(subject);
        return expect.withError(function () {
            expect.errorMode = 'bubble';
            return expect.shift(renderer);
        }, function (e) {
            expect.fail({
                message(output) {
                    return output.error('expected ').appendInspected(subject).error(' when rendered')
                        .nl().i()
                        .append(getMessageOnly.call(e, output));
                },
                diff(output) {
                    return e.getDiffMessage(output);
                }
            });
        });
    });

    expect.addAssertion('<ReactElement> to [exactly] render [with all children] [with all wrappers] [with all classes] [with all attributes] as <ReactElement>', function (expect, subject, expected) {

        if (this.flags.exactly) {
            return expect(subject, 'when rendered', 'to have exactly rendered', expected);
        }
        return expect(subject, 'when rendered to have rendered [with all children] [with all wrappers] [with all classes] [with all attributes]', expected);
    });
    
    return assertionGenerator;
} 

export { installInto, triggerEvent };
