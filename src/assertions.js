import RenderHook from 'react-render-hook';
import UnexpectedHtmlLike from 'unexpected-htmllike';
import RenderedReactElementAdapter from 'unexpected-htmllike-reactrendered-adapter';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';


function checkAttached(expect) {
    if (!RenderHook.isAttached) {
        expect.errorMode = 'bubble';
        expect.fail(output => {
            return output.error('The global rendering hook is not attached')
                .nl().text('This probably means React was required before unexpected-react. Check that unexpected-react is required first')
        });
    }
}

function installInto(expect) {

    const renderedReactElementAdapter = new RenderedReactElementAdapter({ convertToString: true });
    const htmlLikeRenderedReactElement = UnexpectedHtmlLike(renderedReactElementAdapter);
    const reactElementAdapter = new ReactElementAdapter({ convertToString: true });


    expect.addAssertion(['<RenderedReactElement> to have [exactly] rendered <ReactElement>',
        '<RenderedReactElement> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, element) {

            checkAttached(expect);

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
                diffExtraAttributes: exactly
            };
            const data = RenderHook.findComponent(subject);
            return htmlLikeRenderedReactElement.diff(jsxAdapter, data, element, expect.output.clone(), expect, options).then(result => {

                return expect.withError(() => expect(result.weight, 'to equal', 0), () => {
                    expect.fail({
                        diff: function (output, diff, inspect, equal) {
                            return {
                                diff: result.output
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
            diffExtraAttributes: exactly
        };

        const data = RenderHook.findComponent(subject);
        return htmlLikeRenderedReactElement.contains(jsxAdapter, data, element, expect.output.clone(), expect, options)
            .then(containsResult => {
                if (not) {
                    if (containsResult.found) {
                        expect.fail({
                            diff: output => {
                                return {
                                    diff: output.error('but found the following match').nl().append(containsResult.bestMatch.output)
                                };
                            }
                        });
                    }
                    return;
                }

                if (!containsResult.found) {
                    expect.fail({
                        diff: function (output) {
                            return {
                                diff: output.error('the best match was').nl().append(containsResult.bestMatch.output)
                            };
                        }
                    });
                }
            });


    });

    expect.addAssertion(['<ReactElement> to have [exactly] rendered <ReactElement>',
        '<ReactElement> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, expected) {

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

        return jsxHtmlLike.diff(adapter, subject, expected, expect.output.clone(), expect, options).then(function (diffResult) {
            if (diffResult.weight !== 0) {
                return expect.fail({
                    diff: function () {
                        return {
                            diff: diffResult.output
                        };
                    }
                });
            }
        });

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

        return jsxHtmlLike.contains(adapter, subject, expected, expect.output, expect, options)
            .then(function (containsResult) {

                if (not) {
                    if (containsResult.found) {
                        expect.fail({
                            diff: output => {
                                return {
                                    diff: output.error('but found the following match').nl().append(containsResult.bestMatch.output)
                                };
                            }
                        });
                    }
                    return;
                }

                if (!containsResult.found) {
                    expect.fail({
                        diff: function (output) {
                            return {
                                diff: output.error('the best match was').nl().append(containsResult.bestMatch.output)
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

    expect.addAssertion('<ReactModule> to have been injected', function (expect, subject) {
        checkAttached(expect);
    });
}

export default { installInto }