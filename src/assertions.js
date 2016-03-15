import RenderHook from 'react-render-hook';
import UnexpectedHtmlLike from 'unexpected-htmllike';
import RenderedReactElementAdapter from 'unexpected-htmllike-reactrendered-adapter';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';


function checkAttached(expect) {
    if (!RenderHook.isAttached) {
        expect.errorMode = 'bubble';
        expect.fail(output => {
            return output.error('The global rendering hook is not attached')
                .nl().text('This probably means React was required before unexpected-react. Check that unexpected-react is required first');
        });
    }
}

function installInto(expect) {

    const renderedReactElementAdapter = new RenderedReactElementAdapter({ convertToString: true });
    const htmlLikeRenderedReactElement = UnexpectedHtmlLike(renderedReactElementAdapter);

    expect.addAssertion(['<RenderedReactElement> to have [exactly] rendered <ReactElement>',
        '<RenderedReactElement> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, element) {

            checkAttached(expect);
            var exactly = this.flags.exactly;
            const renderedReactElementAdapter = new RenderedReactElementAdapter({ convertToString: true, concatTextContent: !exactly });

            const htmlLikeRenderedReactElement = UnexpectedHtmlLike(renderedReactElementAdapter);
            var withAllChildren = this.flags['with all children'];
            var withAllWrappers = this.flags['with all wrappers'];

            var jsxAdapter = new ReactElementAdapter({ convertToString: true });
            if (!exactly) {
                jsxAdapter.setOptions({ concatTextContent: true });
            }

            var options = {
                diffWrappers: exactly || withAllWrappers,
                diffExtraChildren: exactly || withAllChildren,
                diffExtraAttributes: exactly,
                diffExactClasses: false, // TODO: This should be exactly - need to check the tests around this
                diffExtraClasses: exactly
            };
            const data = RenderHook.findComponent(subject);
            const diffResult = htmlLikeRenderedReactElement.diff(jsxAdapter, data, element, expect, options);

            return htmlLikeRenderedReactElement.withResult(diffResult, result => {

                return expect.withError(() => expect(result.weight, 'to equal', 0), () => {
                    expect.fail({
                        diff: function (output) {
                            return {
                                diff: htmlLikeRenderedReactElement.render(result, output, expect)
                            };
                        }
                    });
                });
            });

        });

    expect.addAssertion(['<RenderedReactElement> [not] to contain [exactly] <ReactElement|string>',

        '<RenderedReactElement> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, element) {

        checkAttached(expect);

        var not = this.flags.not;
        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        var jsxAdapter = new ReactElementAdapter();
        if (!exactly) {
            jsxAdapter.setOptions({ concatTextContent: true });
        }

        var options = {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly,
            diffExactClasses: false,
            diffExtraClasses: exactly
        };

        const data = RenderHook.findComponent(subject);
        const containsResult = htmlLikeRenderedReactElement.contains(jsxAdapter, data, element, expect, options);

        return htmlLikeRenderedReactElement.withResult(containsResult, result => {
            if (not) {
                if (result.found) {
                    expect.fail({
                        diff: output => {
                            return {
                                diff: output.error('but found the following match').nl().append(htmlLikeRenderedReactElement.render(result.bestMatch, output.clone(), expect))
                            };
                        }
                    });
                }
                return;
            }

            if (!result.found) {
                expect.fail({
                    diff: function (output) {
                        return {
                            diff: output.error('the best match was').nl().append(htmlLikeRenderedReactElement.render(result.bestMatch, output.clone(), expect))
                        };
                    }
                });
            }

        });

    });

    expect.addAssertion(['<ReactElement> to have [exactly] rendered <ReactElement>',
        '<ReactElement> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, expected) {

        const exactly = this.flags.exactly;
        const withAllChildren = this.flags['with all children'];
        const withAllWrappers = this.flags['with all wrappers'];

        const adapter = new ReactElementAdapter();
        const jsxHtmlLike = new UnexpectedHtmlLike(adapter);
        if (!exactly) {
            adapter.setOptions({ concatTextContent: true });
        }

        const options = {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly,
            diffExactClasses: false,
            diffExtraClasses: exactly
        };

        const diffResult = jsxHtmlLike.diff(adapter, subject, expected, expect, options);

        return jsxHtmlLike.withResult(diffResult, result => {

            if (result.weight !== 0) {
                return expect.fail({
                    diff: function (output) {
                        return {
                            diff: jsxHtmlLike.render(result, output, expect)
                        };
                    }
                });
            }
        });

    });

    expect.addAssertion(['<ReactElement> queried for [exactly] <ReactElement> <assertion>',
        '<ReactElement> queried for [with all children] [with all wrapppers] <ReactElement> <assertion>'], function (expect, subject, query) {

        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        var adapter = new ReactElementAdapter();
        var jsxHtmlLike = new UnexpectedHtmlLike(adapter);
        if (!exactly) {
            adapter.setOptions({ concatTextContent: true });
        }

        var options = {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly
        };

        const containsResult = jsxHtmlLike.contains(adapter, subject, query, expect, options);

        return jsxHtmlLike.withResult(containsResult, function (result) {
            if (!result.found) {
                expect.fail({
                    diff: output => {
                        return {
                            diff: output.error('`queried for` found no match. The best match was')
                                .nl()
                                .append(jsxHtmlLike.render(result.bestMatch, output.clone(), expect))
                        };
                    }
                });
            }

            expect.shift(result.bestMatchItem);
        });
    });

    expect.addAssertion(['<ReactShallowRenderer> queried for [exactly] <ReactElement> <assertion>',
       '<ReactShallowRenderer> queried for [with all children] [with all wrapppers] <ReactElement> <assertion>'
    ], function (expect, subject, query, assertion) {
        return expect.apply(expect,
            [
                subject.getRenderOutput(), 'queried for [exactly] [with all children] [with all wrappers]', query
            ].concat(Array.prototype.slice.call(arguments, 3)));
    });

    expect.addAssertion(['<ReactElement> [not] to contain [exactly] <ReactElement|string>',
        '<ReactElement> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, expected) {

        var not = this.flags.not;
        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        var adapter = new ReactElementAdapter();
        var jsxHtmlLike = new UnexpectedHtmlLike(adapter);
        if (!exactly) {
            adapter.setOptions({ concatTextContent: true });
        }

        var options = {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly
        };

        const containsResult = jsxHtmlLike.contains(adapter, subject, expected, expect, options);

        return jsxHtmlLike.withResult(containsResult, result => {

            if (not) {
                if (result.found) {
                    expect.fail({
                        diff: output => {
                            return {
                                diff: output.error('but found the following match').nl().append(jsxHtmlLike.render(result.bestMatch, output.clone(), expect))
                            };
                        }
                    });
                }
                return;
            }

            if (!result.found) {
                expect.fail({
                    diff: function (output) {
                        return {
                            diff: output.error('the best match was').nl().append(jsxHtmlLike.render(result.bestMatch, output.clone(), expect))
                        };
                    }
                });
            }
        });
    });

    expect.addAssertion('<ReactElement> to equal <ReactElement>', function (expect, subject, value) {
        return expect(subject, 'to have exactly rendered', value);
    });

    expect.addAssertion('<ReactShallowRenderer> to equal <ReactElement>', function (expect, subject, value) {
        return expect(subject.getRenderOutput(), 'to have exactly rendered', value);
    });

    expect.addAssertion('<ReactElement> to satisfy <ReactElement>', function (expect, subject, renderOutput) {
        return expect(subject, 'to have rendered', renderOutput);
    });

    expect.addAssertion(['<ReactShallowRenderer> to have [exactly] rendered <ReactElement>',
        '<ReactShallowRenderer> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, renderOutput) {
        var actual = subject.getRenderOutput();
        return expect(actual, 'to have [exactly] rendered [with all children] [with all wrappers]', renderOutput);
    });

    expect.addAssertion(['<ReactShallowRenderer> [not] to contain [exactly] <ReactElement|string>',
        '<ReactShallowRenderer> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, renderOutput) {
        var actual = subject.getRenderOutput();
        return expect(actual, '[not] to contain [exactly] [with all children] [with all wrappers]', renderOutput);
    });

    expect.addAssertion('<ReactModule> to have been injected', function (expect) {
        checkAttached(expect);
    });
}

export default { installInto };