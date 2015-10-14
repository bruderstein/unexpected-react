import ArrayChanges from 'array-changes';
import isNativeType from './isNativeType';

// Weightings for diff heuristics
const WEIGHT_OK = 0;
const WEIGHT_NATIVE_NONNATIVE_MISMATCH = 10;
const WEIGHT_NAME_MISMATCH = 8;
const WEIGHT_ATTRIBUTE_MISMATCH = 1;
const WEIGHT_ATTRIBUTE_MISSING = 1;
const WEIGHT_STRING_CONTENT_MISMATCH = 3;
const WEIGHT_CHILD_MISSING = 2;
const WEIGHT_CHILD_INSERTED = 2;


function diffElements(adapter, actual, expected, output, diff, inspect, equal, options) {

    let diffWeight = 0;

    let startPosition = 0;

    const actualName = adapter.getName(actual);
    const expectedName = adapter.getName(expected);

    const diffOutput = output.clone();


    diffOutput.prismPunctuation('<');
    if (actualName === expectedName) {
        diffOutput.prismTag(actualName);
        startPosition = actualName.length;
    } else {
        diffWeight += WEIGHT_NAME_MISMATCH;
        diffOutput.prismTag(actualName)
            .sp().annotationBlock(function () {
                this.error('should be ').prismPunctuation('<').prismTag(expectedName).prismPunctuation('>')
            })
        .nl();
    }

    const actualAttributes = adapter.getAttributes(actual);
    const expectedAttributes = adapter.getAttributes(expected);

    diffWeight += diffAttributes(actualAttributes, expectedAttributes, diffOutput, startPosition, diff, inspect, equal, options);

    const actualChildren = adapter.getChildren(actual);
    const expectedChildren = adapter.getChildren(expected);
    if (actualChildren.length || expectedChildren.length) {
        diffOutput.prismPunctuation('>').nl();
        const childrenOutput = diffOutput.clone();
        diffWeight += diffChildren(adapter, actualChildren, expectedChildren, childrenOutput, diff, inspect, equal, options);

        diffOutput.indentLines();
        diffOutput.i().block(childrenOutput);
        diffOutput.outdentLines();
        diffOutput.nl().i().prismPunctuation('</').prismTag(actualName).prismPunctuation('>');
    } else {
        diffOutput.prismPunctuation('/>');
    }

    /*

    const actualIsNative = isNativeType(actual);
    const expectedIsNative = isNativeType(expected);

    const actualAttributes = adapter.getAttributes(actual);
    const expectedAttributes = adapter.getAttributes(expected);

    if (actualIsNative !== expectedIsNative) {
        diffWeight += WEIGHT_NATIVE_NONNATIVE_MISMATCH;

        const thisDiffOutput = output.clone();
        if (actualIsNative) {
            thisDiffOutput.text('' + actual)
                .sp()
                .annotationBlock(function () {
                    this.error('should be').sp().block(inspect(expected))
                });
        } else if (expectedIsNative) {
            var actualOutput = inspect(actual);
            thisDiffOutput.block(actualOutput)
                .annotationBlock(function () {
                    this.nl(actualOutput.size().height - 1);
                    this.error('should be').sp().append(inspect(expected));
                });
        }

        // TODO: Need to check if one level down returns a lower weight
        return {
            weight: diffWeight,
            output: thisDiffOutput
        };
    }


    let canContinueLine = true;
    const thisDiffOutput = output.clone();
    if (adapter.getName(actual) !== adapter.getName(expected)) {
        diffWeight += WEIGHT_NAME_MISMATCH;

        thisDiffOutput
            .prismPunctuation('<')
            .prismTag(adapter.getName(actual))
            .sp()
            .annotationBlock(function () {
                this.error('should be').sp().prismTag(adapter.getName(expected))
            })
            .nl();
        canContinueLine = false;
    }
*/

    return {
        weight: diffWeight,
        output: diffOutput
    };



}

function diffAttributes(actualAttributes, expectedAttributes, diffOutput, nameLength, diff, inspect, equal, options) {

    let diffWeight = 0;
    const attributes = [];
    Object.keys(actualAttributes).forEach(attrib => {
        if (expectedAttributes.hasOwnProperty(attrib)) {
            if (!equal(actualAttributes[attrib], expectedAttributes[attrib])) {
                const diffResult = diff(actualAttributes[attrib], expectedAttributes[attrib]);
                const attribOutput = diffOutput.clone();
                outputAttribute(attribOutput, attrib, actualAttributes[attrib], inspect);
                attribOutput.sp().annotationBlock(function () {
                    this.error('should be').sp();
                    outputAttribute(this, attrib, expectedAttributes[attrib], inspect);
                    this.sp().block(diffResult.diff);
                });
                attributes.push({ matches: false, output: attribOutput });
                diffWeight += WEIGHT_ATTRIBUTE_MISMATCH;
            } else {
                const attribOutput = diffOutput.clone();
                outputAttribute(attribOutput, attrib, actualAttributes[attrib], inspect);
                attributes.push({ matches: true, output: attribOutput });
            }
        }
    });

    Object.keys(expectedAttributes).forEach(attrib => {
        if (!actualAttributes.hasOwnProperty(attrib)) {
            diffWeight += WEIGHT_ATTRIBUTE_MISSING;
            const attributeOutput = diffOutput.clone();
            attributeOutput.annotationBlock(function () {
                this.error('missing').sp();
                outputAttribute(this, attrib, expectedAttributes[attrib], inspect);
            });

            attributes.push({ matches: false, output: attributeOutput })
        }
    });


    const hasMismatchingAttributes = attributes.some(attrib => {
        return attrib.matching === false;
    });

    let multilineAttributes = false;
    if (!hasMismatchingAttributes) {
        let width = nameLength + 1;
        multilineAttributes = attributes.some(attrib => {
            const size = attrib.output.size();
            if (attrib.matching) {   // If the attributes don't match, they'll be split onto a separate line anyway
                width += size.width;
            }
            return width >= 50;
        });
    }

    const indentSize = nameLength + 1;
    let isMultiline = false;
    if (multilineAttributes) {
        attributes.forEach(attrib => {
            diffOutput.nl().i().sp(indentSize).append(attrib.output);
            isMultiline = true;
        });
    } else {
        let width = nameLength;
        let canContinueLine = true;
        attributes.forEach(attrib => {
            if (!canContinueLine) {
                diffOutput.nl().i().sp(indentSize);
                isMultiline = true;
                canContinueLine = true;
                width = 0;
            }
            diffOutput.sp().append(attrib.output);
            width += attrib.output.size().width;
            if (!attrib.matches || width > 50) {
                canContinueLine = false;
            }
        });

        if (!canContinueLine || isMultiline) {
            diffOutput.nl();
        }
    }
    return diffWeight;
}

function diffChildren(adapter, actualChildren, expectedChildren, output, diff, inspect, equal, options) {

    let diffWeight = 0;
    if (actualChildren.length === 1 && expectedChildren.length === 1 &&
        isNativeType(actualChildren[0]) && isNativeType(expectedChildren[0])) {

        if (actualChildren[0] !== expectedChildren[0]) {
            var stringDiff = diff(('' + actualChildren[0]).trim(), ('' + expectedChildren[0]).trim());
            output.block(stringDiff.diff);
            return WEIGHT_STRING_CONTENT_MISMATCH;
        } else {
            output.text(actualChildren[0]);
            return WEIGHT_OK;
        }
    }


    var changes = ArrayChanges(actualChildren, expectedChildren,
        function (a, b) {
            const elementDiff = diffElements(adapter, a, b, output, diff, inspect, equal, options);
            return elementDiff.weight === WEIGHT_OK;
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

            switch(diffItem.type) {
                case 'insert':
                    diffWeight += WEIGHT_CHILD_MISSING;
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
                    break;

                case 'remove':
                    diffWeight += WEIGHT_CHILD_INSERTED;
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
                    break;

                case 'equal':
                    if (typeof diffItem.value === 'string') {
                        this.block(function () {
                            this.text(diffItem.value);
                        });
                    } else {
                        this.block(inspect(diffItem.value));
                    }
                    break;

                default:
                    const elementDiffResult = diffElements(adapter, diffItem.value, diffItem.expected, output, diff, inspect, equal, options);
                    diffWeight += elementDiffResult.weight;

                    this.block(elementDiffResult.output);
                    break;
            }
        }).nl(index < changes.length - 1 ? 1 : 0);
    });

    return diffWeight;
}

function outputAttribute(output, name, value, inspect) {

    output.prismAttrName(name)
        .prismPunctuation('=');
    if (typeof value === 'string') {
        output.prismPunctuation('"')
            .prismAttrValue(value)
            .prismPunctuation('"');
    } else {
        output.prismPunctuation('{')
            .prismAttrValue(inspect(value))
            .prismPunctuation('}');
    }
}

module.exports = {
    diffElements
};