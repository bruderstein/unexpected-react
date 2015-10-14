
import ArrayChanges from 'array-changes';
import isNativeType from './isNativeType';
import diff from './diff';

function writeAttributes(output, attributes, externalInspector, options) {

    if (attributes) {
        let nextAttribute = o => o.text(' ');

        if (options && options.splitLines) {
            nextAttribute = o => o.nl().i();
        }

        Object.keys(attributes).forEach(function (attrib) {
            nextAttribute(output);
            writeAttribute(output, attrib, attributes[attrib], externalInspector);
        });
    }
}

function writeAttribute(output, attributeName, value, externalInspector) {

    output.prismAttrName(attributeName)
        .prismPunctuation('=');

    if (externalInspector) {

        if (typeof (value) === 'string') {

            output.prismPunctuation('"');
            output.append(value);
            output.prismPunctuation('"');
        } else {
            output.prismPunctuation('{');
            output.append(externalInspector(value));
            output.prismPunctuation('}');
        }
        return;
    }

    switch (typeof value) {
        case 'number':
        case 'boolean':
        case 'undefined':
            output.text('{')
                .text(value)
                .text('}');
            break;
        case 'string':
            output.prismPunctuation('"').prismAttrValue(value).prismPunctuation('"');
            break;

        case 'object':
            if (value === null) {
                output.prismPunctuation('{').prismAttrValue('null').prismPunctuation('}');
            } else {
                output.prismPunctuation('{').prismAttrValue('...').prismPunctuation('}');
            }
            break;
        case 'function':
            output.prismPunctuation('{').prismAttrValue(' function(){...} ').prismPunctuation('}');
            break;
    }
}


function inspect(adapter, value, depth, output, externalInspector) {
    output
        .prismPunctuation('<')
        .prismTag(adapter.getName(value));

    const attributes = adapter.getAttributes(value);
    const measureOutput = output.clone();
    writeAttributes(measureOutput, attributes, externalInspector);
    const size = measureOutput.size();
    const attributesOnSplitLines = size.width > 50;
    if (!attributesOnSplitLines) {
        output.append(measureOutput);
    } else {
        output.indentLines();
        writeAttributes(output, attributes, externalInspector, { splitLines: true });
        output.outdentLines();
        output.nl().i();
    }


    const children = adapter.getChildren(value);
    if (children.length) {
        output.prismPunctuation('>');

        const inspectedChildren = [];

        for (let index = 0; index < children.length; ++index) {
            const tempOutput = output.clone();
            if (isNativeType(children[index])) {
                inspectedChildren.push(tempOutput.text(children[index]))
            } else {
                inspectedChildren.push(inspect(adapter, children[index], depth + 1, tempOutput));
            }
        }

        let width = 0;
        var multipleLines = inspectedChildren.some(function (o) {
            var size = o.size();
            width += size.width;
            return width > 50 || o.height > 1;
        });

        if (multipleLines || attributesOnSplitLines) {
            output.nl().indentLines();
            inspectedChildren.forEach(inspectedChild => {
                output.i().block(inspectedChild).nl();
            });
            output.outdentLines();
        } else {
            inspectedChildren.forEach(inspectedChild => {
                output.append(inspectedChild);
            });
        }

        output.i()
            .prismPunctuation('</').prismTag(adapter.getName(value)).prismPunctuation('>');
    } else {

        if (!attributesOnSplitLines) {
            output.text(' ');
        }
        output.prismPunctuation('/>');
    }
    return output;
}


function attributesMatch(actual, expected, equal, options) {
    if (options && options.exactly) {
        return equal(actual, expected);
    }
    var matching = true;
    Object.keys(expected).forEach(function (key) {
        if (!equal(actual[key], expected[key])) {
            matching = false;
        }
    });
    return matching;
}



function diffElements(adapter, actual, expected, output, diff, inspect, equal, options) {
    var result = {
        diff: output,
        inline: true
    };
    var actualIsNative = isNativeType(actual);
    var expectedIsNative = isNativeType(expected);
    if (actualIsNative && expectedIsNative) {
        return diff('' + actual, '' + expected);
    }

    var stringVsComponentMismatch = actualIsNative !== expectedIsNative;
    const actualAttributes = adapter.getAttributes(actual);
    const actualChildren = adapter.getChildren(actual);
    const expectedAttributes = adapter.getAttributes(expected);
    const expectedChildren = adapter.getChildren(expected);
    // TODO: Need to count the attributes - and do we really need to know about attributes here?
    var emptyElements = !stringVsComponentMismatch && (!actualAttributes || actualChildren.length === 0) &&
        (!expectedAttributes || expectedChildren.length === 0);

    var attributesMatching = !stringVsComponentMismatch && attributesMatch(actualAttributes, expectedAttributes, equal, options);

    var conflictingElement = stringVsComponentMismatch ||
        adapter.getName(actual) !== adapter.getName(expected) ||
        !attributesMatching;

    if (stringVsComponentMismatch) {

        if (actualIsNative) {
            output.append('' + actual)
                .sp()
                .annotationBlock(function () {
                    this.error('should be').sp().block(inspect(expected));
                });
        } else if (expectedIsNative) {

            var actualOutput = inspect(actual);
            output.block(actualOutput)
                .annotationBlock(function () {
                    this.nl(actualOutput.size().height - 1);
                    this.error('should be').sp().append(inspect(expected));
                });
        }

    } else if (conflictingElement) {
        var canContinueLine = true;
        output
            .prismPunctuation('<')
            .prismTag(adapter.getName(actual));
        if (adapter.getName(actual) !== adapter.getName(expected)) {
            output.sp().annotationBlock(function () {
                this.error('should be').sp().prismTag(adapter.getName(expected));
            }).nl();
            canContinueLine = false;
        }
        Object.keys(actualAttributes).forEach(function (attributeName) {
            output.sp(canContinueLine ? 1 : 2 + adapter.getName(actual).length);
            if (attributeName in expectedAttributes) {
                if (actualAttributes[attributeName] === expectedAttributes[attributeName]) {
                    writeAttribute(output, attributeName, actualAttributes[attributeName]);
                    canContinueLine = true;
                } else {
                    writeAttribute(output, attributeName, actualAttributes[attributeName], inspect);
                    output.sp().annotationBlock(function () {
                        var diffResults = diff(actualAttributes[attributeName], expectedAttributes[attributeName]);
                        if (diffResults) {
                            this.append(diffResults.diff);
                        } else {
                            this.error('should equal').sp().append(inspect(expectedAttributes[attributeName]));
                        }

                    }).nl();
                    canContinueLine = false;
                }
                delete expectedAttributes[attributeName];
            } else if (options.exactly) {
                writeAttribute(output, attributeName, actualAttributes[attributeName]);
                output.sp().annotationBlock(function () {
                    this.error('should be removed');
                }).nl();
                canContinueLine = false;
            }
        });
        Object.keys(expectedAttributes).forEach(function (propName) {
            output.sp(canContinueLine ? 1 : 2 + adapter.getName(actual).length);
            output.annotationBlock(function () {
                this.error('missing').sp();
                writeAttribute(this, propName, expectedAttributes[propName]);
            }).nl();
            canContinueLine = false;
        });
        if (emptyElements) {
            output.prismPunctuation('/>');
        } else {
            output.prismPunctuation('>');
        }
    } else {
        output.prismPunctuation('<')
            .prismTag(adapter.getName(actual));
        writeAttributes(output, actualAttributes); // No inspection of attributes that are non-native and identical
                                                   // Hence no passing of `inspect`
        output.prismPunctuation('>');
    }

    if (!stringVsComponentMismatch && !emptyElements) {
        output.nl().indentLines();
        diffChildren(adapter, actualChildren, expectedChildren, output, diff, inspect, equal, options);
        output.nl().outdentLines();
    }

    if (!emptyElements) {
        output.code('</' + adapter.getName(actual) + '>', 'html');
    }
    return result;
}

function diffChildren(adapter, actual, expected, output, diff, inspect, equal, options) {
    if (typeof actual === 'string' && typeof expected === 'string') {
        var stringDiff = diff(actual.trim(), expected.trim());
        output.i().block(stringDiff.diff);
        return;
    }

    var actualChildren = [].concat(actual);

    var expectedChildren = [].concat(expected);

    var changes = ArrayChanges(actualChildren, expectedChildren,
        function (a, b) {
            return elementsMatch(a, b, equal, options);
        },

        function (a, b) {
            // Figure out whether a and b are the same element so they can be diffed inline.
            var aIsNativeType = isNativeType(a);
            var bIsNativeType = isNativeType(b);
            if (aIsNativeType && bIsNativeType) {
                return true;
            }

            if (aIsNativeType !== bIsNativeType) {
                return false;
            }


            return (
                adapter.getName(a)  === adapter.getName(b)
            );
        } );

    changes.forEach(function (diffItem, index) {
        output.i().block(function () {
            var type = diffItem.type;

            if (type === 'insert') {
                this.annotationBlock(function () {
                    this.error('missing ');
                    if (typeof diffItem.value === 'string') {
                        this.block(function () {
                            this.text(diffItem.value);
                        });
                    } else {
                        this.block(inspect(diffItem.value));
                    }
                });
            } else if (type === 'remove') {
                if (typeof diffItem.value === 'string') {
                    this.block(function () {
                        this.text(diffItem.value).sp().error('// should be removed');
                    });
                } else {
                    var actualInspectBlock = inspect(diffItem.value);
                    this.block(actualInspectBlock).sp().annotationBlock(function () {
                        this.error('should be removed');
                        this.nl(actualInspectBlock.size().height - 1);
                    });
                }
            } else if (type === 'equal') {
                if (typeof diffItem.value === 'string') {
                    this.block(function () {
                        this.text(diffItem.value);
                    });
                } else {
                    this.block(inspect(diffItem.value));
                }
            } else {
                var valueDiff = diffElements(adapter, diffItem.value, diffItem.expected, output.clone(), diff, inspect, equal, options);

                if (valueDiff) {
                    this.block(valueDiff.diff);
                }
            }
        }).nl(index < changes.length - 1 ? 1 : 0);
    });
}

function elementsMatch(adapter, actual, expected, equal, options) {

    if (typeof actual === 'string' && typeof expected === 'string') {
        return actual === expected;
    }

    if ((typeof actual === 'string' || typeof actual === 'number') &&
        (typeof expected === 'string' || typeof expected === 'number')) {
        return '' + actual === '' + expected;
    }

    if (typeof actual !== typeof expected) { // Fundamentally different e.g. string vs ReactElement
        return false;
    }

    if (adapter.getName(actual) !== adapter.getName(expected)) {
        return false;
    }

    if (!attributesMatch(adapter.getAttributes(actual), adapter.getAttributes(expected), equal, options)) {
        return false;
    }

    const actualChildren = adapter.getChildren(actual);
    const expectedChildren = adapter.getChildren(expected);
    // For 'exactly', we can just check the count of the actual children matches,
    // string children will not be concatenated in this mode, and serves to also check
    // the case that the expected does not have children, but the actual does (ignored when exactly=false)
    if (options.exactly && React.Children.count(expected.props.children) !== React.Children.count(actual.props.children)) {
        return false;
    }

    if (expectedChildren.length) {

        var arrayDiffs = ArrayChanges(
            actualChildren,
            expectedChildren,
            function (a, b) {
                return elementsMatch(a, b, equal, options);
            },
            function () {
                return false;
            });

        var arrayMatches = true;
        arrayDiffs.forEach(function (diffItem) {
            switch (diffItem.type) {
                case 'equal':
                    return;
                case 'remove':
                    if (options.exactly || options.withAllChildren) {
                        arrayMatches = false;
                    }
                    break;
                default:
                    arrayMatches = false;
                    break;

            }
        });

        if (!arrayMatches) {
            return false;
        }
    }
    return true;

};



function HtmlLikeUnexpected(actualAdapter, expectedAdapter) {

    return {
        inspect: inspect.bind(null, actualAdapter),
        diff: diff.diffElements.bind(null, actualAdapter, expectedAdapter)
    };
}

HtmlLikeUnexpected.Weights = diff.Weights;

export default HtmlLikeUnexpected;