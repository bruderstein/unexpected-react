import ArrayChanges from 'array-changes';
import isNativeType from './isNativeType';

// Weightings for diff heuristics
const WEIGHT_NATIVE_NONNATIVE_MISMATCH = 10;
const WEIGHT_NAME_MISMATCH = 8;
const WEIGHT_ATTRIBUTE_MISMATCH = 1;
const WEIGHT_ATTRIBUTE_MISSING = 1;


function diffElements(adapter, actual, expected, output, diff, inspect, equal, options) {

    let diffWeight = 0;

    let startPosition = 0;

    const actualName = adapter.getName(actual);
    const expectedName = adapter.getName(expected);

    const diffOutput = output.clone();

    diffOutput.prismPunctuation('<');
    if (actualName === expectedName) {
        diffOutput.prismTag(actualName)
        startPosition = actualName.length;
    }

    const actualAttributes = adapter.getAttributes(actual);
    const expectedAttributes = adapter.getAttributes(expected);

    diffWeight += diffAttributes(actualAttributes, expectedAttributes, diffOutput, startPosition, diff, inspect, equal, options);

    diffOutput.prismPunctuation('/>');

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
        } else {
            diffOutput.sp();
        }
    }
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