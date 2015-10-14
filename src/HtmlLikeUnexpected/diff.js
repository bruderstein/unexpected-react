import ArrayChanges from 'array-changes';
import isNativeType from './isNativeType';

// Weightings for diff heuristics

const Weights = {
    OK: 0,
    NATIVE_NONNATIVE_MISMATCH: 10,
    NAME_MISMATCH: 8,
    ATTRIBUTE_MISMATCH: 1,
    ATTRIBUTE_MISSING: 1,
    STRING_CONTENT_MISMATCH: 3,
    CHILD_MISSING: 2,
    CHILD_INSERTED: 2
};

function diffElements(actualAdapter, expectedAdapter, actual, expected, output, diff, inspect, equal, options) {

    let diffWeight = 0;

    let startPosition = 0;

    const diffOutput = output.clone();

    if (isNativeType(actual) && isNativeType(expected)) {
        if (('' + actual).trim() !== ('' + expected).trim()) {
            const diffResult = diff(actual, expected);
            return {
                weight: Weights.STRING_CONTENT_MISMATCH,
                output: diffResult.diff
            }
        } else {
            diffOutput.text(actual);
            return {
                weight: Weights.OK,
                output: diffOutput
            };
        }
    } else if (isNativeType(actual) && !isNativeType(expected)) {
        diffOutput.block('' + actual).sp().annotationBlock(function () {
            this.error('should be ').block(inspect(expected));
        });
        return {
            weight: Weights.NATIVE_NONNATIVE_MISMATCH,
            output: diffOutput
        };
    } else if (!isNativeType(actual) && isNativeType(expected)) {

        const actualOutput = inspect(actual);
        diffOutput.block(actualOutput).sp().annotationBlock(function () {

            this.nl(actualOutput.size().height - 1).error('should be ').block(inspect(expected))
        });
        return {
            weight: Weights.NATIVE_NONNATIVE_MISMATCH,
            output: diffOutput
        }

    }

    const actualName = actualAdapter.getName(actual);
    const expectedName = expectedAdapter.getName(expected);



    diffOutput.prismPunctuation('<');
    if (actualName === expectedName) {
        diffOutput.prismTag(actualName);
        startPosition = actualName.length;
    } else {
        diffWeight += Weights.NAME_MISMATCH;
        diffOutput.prismTag(actualName)
            .sp().annotationBlock(function () {
                this.error('should be ').prismPunctuation('<').prismTag(expectedName).prismPunctuation('>')
            })
        .nl();
    }

    const actualAttributes = actualAdapter.getAttributes(actual);
    const expectedAttributes = expectedAdapter.getAttributes(expected);

    diffWeight += diffAttributes(actualAttributes, expectedAttributes, diffOutput, startPosition, diff, inspect, equal, options);

    const actualChildren = actualAdapter.getChildren(actual);
    const expectedChildren = expectedAdapter.getChildren(expected);
    if (actualChildren.length || expectedChildren.length) {
        diffOutput.prismPunctuation('>').nl();
        const childrenOutput = diffOutput.clone();
        diffWeight += diffChildren(actualAdapter, expectedAdapter, actualChildren, expectedChildren, childrenOutput, diff, inspect, equal, options);

        diffOutput.indentLines();
        diffOutput.i().block(childrenOutput);
        diffOutput.outdentLines();
        diffOutput.nl().i().prismPunctuation('</').prismTag(actualName).prismPunctuation('>');
    } else {
        diffOutput.prismPunctuation('/>');
    }

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
                diffWeight += Weights.ATTRIBUTE_MISMATCH;
            } else {
                const attribOutput = diffOutput.clone();
                outputAttribute(attribOutput, attrib, actualAttributes[attrib], inspect);
                attributes.push({ matches: true, output: attribOutput });
            }
        }
    });

    Object.keys(expectedAttributes).forEach(attrib => {
        if (!actualAttributes.hasOwnProperty(attrib)) {
            diffWeight += Weights.ATTRIBUTE_MISSING;
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

function diffChildren(actualAdapter, expectedAdapter, actualChildren, expectedChildren, output, diff, inspect, equal, options) {

    let diffWeight = 0;

    var changes = ArrayChanges(actualChildren, expectedChildren,
        function (a, b) {
            const elementDiff = diffElements(actualAdapter, expectedAdapter, a, b, output, diff, inspect, equal, options);
            return elementDiff.weight === Weights.OK;
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
                actualAdapter.getName(a)  === expectedAdapter.getName(b)
            );
        } );

    changes.forEach(function (diffItem, index) {
        output.i().block(function () {

            switch(diffItem.type) {
                case 'insert':
                    diffWeight += Weights.CHILD_MISSING;
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
                    diffWeight += Weights.CHILD_INSERTED;
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
                    const elementDiffResult = diffElements(actualAdapter, expectedAdapter, diffItem.value, diffItem.expected, output, diff, inspect, equal, options);
                    diffWeight += elementDiffResult.weight;

                    if (!elementDiffResult.output) {
                        console.log(elementDiffResult)
                    }
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

export default {
    diffElements,
    Weights
};