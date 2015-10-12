

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


function HtmlLikeUnexpected(adapter) {

    // TODO: Need to put isRawType in it's own file and reuse it
        function isRawType(value) {
            var type = typeof value;
            return type === 'string' ||
                type === 'number' ||
                type === 'boolean' ||
                type === 'undefined' ||
                value === null;
        }

        function inspect(value, depth, output, externalInspector) {
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
                    if (isRawType(children[index])) {
                        inspectedChildren.push(tempOutput.text(children[index]))
                    } else {
                        inspectedChildren.push(inspect(children[index], depth + 1, tempOutput));
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
    return { inspect };
}

module.exports = HtmlLikeUnexpected;