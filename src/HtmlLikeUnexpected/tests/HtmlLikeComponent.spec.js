
import HtmlLikeUnexpected from '../';
import MagicPen from 'magicpen';
import MagicPenPrism from 'magicpen-prism';
import Unexpected from 'unexpected';
import ObjectAssign from 'object-assign';

const expect = Unexpected.clone();

const TestAdapter = {
        getName(comp) { return comp.name; },

        getAttributes(comp) { return comp.attribs; },

        getChildren(comp) {
            return [].concat([], comp.children);
        }
};

expect.addType({
    name: 'TestHtmlLike',
    identify: value => value && value.name && value.attribs && value.children,
    inspect: (value, depth, output, inspect) => {

        const htmlLikeUnexpected = new HtmlLikeUnexpected(TestAdapter, TestAdapter);
        return htmlLikeUnexpected.inspect(value, depth, output, inspect);
    },

    diff: (actual, expected, output, diff, inspect, equal) => {
        const htmlLikeUnexpected = new HtmlLikeUnexpected(TestAdapter, TestAdapter);
        return htmlLikeUnexpected.inspect(value, depth, output, inspect);
    }
});

expect.addAssertion('<any> to inspect as <string>', (expect, subject, value) => {
    expect(expect.inspect(subject).toString(), 'to equal', value);
});

expect.addAssertion('<TestHtmlLike> when diffed against <TestHtmlLike> <assertion>', (expect, subject, value) => {

    const htmlLikeUnexpected = new HtmlLikeUnexpected(TestAdapter, TestAdapter);
    const pen = expect.output.clone();
    const result = htmlLikeUnexpected.diff(subject, value, pen, expect.diff.bind(expect), expect.inspect.bind(expect), expect.equal.bind(expect));
    return expect.shift(result);
});

expect.addType({
    name: 'HtmlDiffResult',
    identify: value => value && value.output && typeof value.weight === 'number'
});

expect.addAssertion('<HtmlDiffResult> to have weight <number>', (expect, subject, weight) => {
    expect.withError(() => expect(subject.weight, 'to equal', weight), e => {
        expect.fail({
            diff: function (output) {
                return {
                    inline: false,
                    diff: output.error('expected').text(' weight ').gray('to be ').text(weight).gray(' but was ').text(subject.weight)
                };
            }
        })
    });
});

expect.addAssertion('<HtmlDiffResult> to output <magicpen>', (expect, subject, pen) => {
    expect(subject.output, 'to equal', pen);
});

expect.addAssertion('<HtmlDiffResult> to output <string>', (expect, subject, value) => {
    expect(subject.output.toString(), 'to equal', value);
});

expect.addAssertion('<HtmlDiffResult> to output with weight <string> <number>', (expect, subject, value, weight) => {
    expect(subject.output.toString(), 'to equal', value);
    expect(subject, 'to have weight', weight);
});


expect.use(MagicPenPrism);

describe('HtmlLikeComponent', () => {


    it('outputs a formatted output with no children', () => {
        expect({ name: 'div', attribs: { id: 'foo', className: 'bar' }, children: [] }, 'to inspect as',
        '<div id="foo" className="bar" />');

    });

    it('outputs a formatted output with children', () => {

        expect({
            name: 'div', attribs: {id: 'foo', className: 'bar'}, children: [
                {
                    name: 'span',
                    attribs: { className: 'child1' },
                    children: ['child content 1']
                },
                {
                    name: 'span',
                    attribs: { className: 'child2' },
                    children: ['child content 2']
                }
            ]
        }, 'to inspect as',
            '<div id="foo" className="bar">\n' +
            '  <span className="child1">child content 1</span>\n' +
            '  <span className="child2">child content 2</span>\n' +
            '</div>');
    });

    it('outputs children on a single line if it fits', () => {

        expect({
            name: 'div', attribs: {id: 'foo', className: 'bar'}, children: [
                {
                    name: 'span',
                    children: ['1']
                },
                {
                    name: 'span',
                    children: ['2']
                }
            ]
        }, 'to inspect as', '<div id="foo" className="bar"><span>1</span><span>2</span></div>');
    });

    it('outputs attributes on split lines if they are too long, with no content', () => {
        expect({
            name: 'div', attribs: {
                id: 'foo',
                className: 'bar blah mcgar',
                'aria-role': 'special-long-button',
                'data-special': 'some other long attrib'
            },
            children: []
        }, 'to inspect as',
            '<div\n' +
            '  id="foo"\n' +
            '  className="bar blah mcgar"\n' +
            '  aria-role="special-long-button"\n' +
            '  data-special="some other long attrib"\n' +
            '/>');
    });

    it('outputs attributes on split lines if they are too long, with content', () => {
        expect({
            name: 'div', attribs: {
                id: 'foo',
                className: 'bar blah mcgar',
                'aria-role': 'special-long-button',
                'data-special': 'some other long attrib'
            },
            children: ['some content']
        }, 'to inspect as',
            '<div\n' +
            '  id="foo"\n' +
            '  className="bar blah mcgar"\n' +
            '  aria-role="special-long-button"\n' +
            '  data-special="some other long attrib"\n' +
            '>\n' +
            '  some content\n' +
            '</div>');
    });

    describe('with no external inspect function', () => {

        let htmlLikeUnexpected;
        let pen;

        beforeEach(() => {

            htmlLikeUnexpected = new HtmlLikeUnexpected(TestAdapter);
            pen = new MagicPen();
            pen.use(MagicPenPrism);
        });

        it('outputs an object attribute with ellipses', () => {

            htmlLikeUnexpected.inspect({
                name: 'div', attribs: {special: {abc: 123, def: 'bar'}}, children: []
            }, 0, pen);

            expect(pen.toString(), 'to equal', '<div special={...} />');
        });
    });

    describe('with an external inspect function', () => {

        let htmlLikeUnexpected;
        let pen;

        beforeEach(() => {

            htmlLikeUnexpected = new HtmlLikeUnexpected(TestAdapter);
            pen = new MagicPen();
            pen.use(MagicPenPrism);
        });

        it('outputs an inspected object attribute', () => {

            htmlLikeUnexpected.inspect({
                name: 'div', attribs: {special: {abc: 123, def: 'bar'}}, children: []
            }, 0, pen, value => ('INSPECTED' + value.abc));
            expect(pen.toString(), 'to equal', "<div special={INSPECTED123} />");
        });
    });

    describe('diff', () => {

       it('gets the weight correct for a single component with a different attribute', () => {

           expect(
               {
                   name: 'div', attribs: { id: 'foo' }, children: []
               },
               'when diffed against',
               {
                   name: 'div', attribs: { id: 'bar' }, children: []
               },
               'to have weight', HtmlLikeUnexpected.Weights.ATTRIBUTE_MISMATCH
           );

       });

        it('outputs the diff of a single component with a different attribute', () => {

            expect(
                {
                    name: 'div', attribs: { id: 'foo' }, children: []
                },
                'when diffed against',
                {
                    name: 'div', attribs: { id: 'bar' }, children: []
                },
                'to output',
                '<div id="foo" // should be id="bar" -foo\n' +
                '              //                    +bar\n' +
                '/>'
            );

        });

        it('outputs the diff of a single component with a different attribute and a matching attribute after', () => {

            expect(
                {
                    name: 'div', attribs: { id: 'foo', className: 'testing' }, children: []
                },
                'when diffed against',
                {
                    name: 'div', attribs: { id: 'bar', className: 'testing' }, children: []
                },
                'to output',
                '<div id="foo" // should be id="bar" -foo\n' +
                '              //                    +bar\n' +
                '     className="testing"\n' +
                '/>'
            );
        });

        it('outputs the diff of a single component with a different attribute and a matching attribute before', () => {

            expect(
                {
                    name: 'div', attribs: { className: 'testing', id: 'foo'  }, children: []
                },
                'when diffed against',
                {
                    name: 'div', attribs: { className: 'testing', id: 'bar' }, children: []
                },
                'to output',
                '<div className="testing" id="foo" // should be id="bar" -foo\n' +
                '                                  //                    +bar\n' +
                '/>'
            );
        });

        it('breaks the output if there are lots of matching attributes', () => {

            const attribs = {
                attrib1: 'aaa',
                attrib2: 'hello world',
                attrib3: 'testing is fun',
                attrib4: 'hallo welt',
                attrib5: 'jonny number five',
            };

            const afterAttribs = {
                after: 'bbb',
                after2: 'ccc some more words',
                after3: 'here is some more'
            };
            const actualAttribs = ObjectAssign({}, attribs, { mismatch: 'foo' }, afterAttribs);
            const expectedAttribs = ObjectAssign({}, attribs, { mismatch: 'bar' }, afterAttribs);

            expect(
                {
                    name: 'div', attribs: actualAttribs, children: []
                },
                'when diffed against',
                {
                    name: 'div', attribs: expectedAttribs, children: []
                },
                'to output',
                '<div attrib1="aaa" attrib2="hello world" attrib3="testing is fun"\n' +
                '     attrib4="hallo welt" attrib5="jonny number five" mismatch="foo" // should be mismatch="bar" -foo\n' +
                '                                                                     //                          +bar\n' +
                '     after="bbb" after2="ccc some more words" after3="here is some more"\n' +
                '/>'
            );
        });

        it('highlights a missing attribute', () => {
            expect(
                {
                    name: 'div', attribs: { id: 'foo'  }, children: []
                },
                'when diffed against',
                {
                    name: 'div', attribs: { className: 'testing', id: 'foo' }, children: []
                },
                'to output',
                '<div id="foo" // missing className="testing"\n' +
                '/>'
            );
        });

        it('highlights two missing attributes', () => {
            expect(
                {
                    name: 'div', attribs: { id: 'foo'  }, children: []
                },
                'when diffed against',
                {
                    name: 'div', attribs: { className: 'testing', id: 'foo', extra: '123' }, children: []
                },
                'to output',
                '<div id="foo" // missing className="testing"\n' +
                '     // missing extra="123"\n' +
                '/>'
            );
        });

        it('diffs a component with a single text child', () => {

            expect(
                {
                    name: 'div', attribs: { id: 'foo' }, children: ['abc']
                },
                'when diffed against',
                {
                    name: 'div', attribs: { id: 'foo' }, children: ['def']
                },
                'to output with weight',
                '<div id="foo">\n' +
                '  -abc\n' +
                '  +def\n' +
                '</div>', HtmlLikeUnexpected.Weights.STRING_CONTENT_MISMATCH
            );
        });

        it('diffs a component with child components with different content', () => {

            expect(
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: {}, children: ['one'] },
                    { name: 'span', attribs: {}, children: ['two'] }
                ]
                },
                'when diffed against',
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: {}, children: ['one'] },
                    { name: 'span', attribs: {}, children: ['updated'] }
                ]
                },
                'to output with weight',
                '<div id="foo">\n' +
                '  <span>one</span>\n' +
                '  <span>\n' +
                '    -two\n' +
                '    +updated\n' +
                '  </span>\n' +
                '</div>', HtmlLikeUnexpected.Weights.STRING_CONTENT_MISMATCH
            );
        });

        it('diffs a component with child components with different tags', () => {

            expect(
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'div', attribs: {}, children: ['one'] },
                    { name: 'span', attribs: {}, children: ['two'] }
                ]
                },
                'when diffed against',
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: {}, children: ['one'] },
                    { name: 'span', attribs: {}, children: ['two'] }
                ]
                },
                'to output with weight',
                '<div id="foo">\n' +
                '  <div // should be <span>\n' +
                '  >\n' +
                '    one\n' +
                '  </div>\n' +
                '  <span>two</span>\n' +
                '</div>', HtmlLikeUnexpected.Weights.NAME_MISMATCH
            );
        });

        it('diffs a component with child components with different attributes', () => {

            expect(
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo'}, children: ['one'] },
                    { name: 'span', attribs: {}, children: ['two'] }
                ]
                },
                'when diffed against',
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childbar' }, children: ['one'] },
                    { name: 'span', attribs: {}, children: ['two'] }
                ]
                },
                'to output with weight',
                '<div id="foo">\n' +
                '  <span id="childfoo" // should be id="childbar" -childfoo\n' +
                '                      //                         +childbar\n' +
                '  >\n' +
                '    one\n' +
                '  </span>\n' +
                '  <span>two</span>\n' +
                '</div>', HtmlLikeUnexpected.Weights.ATTRIBUTE_MISMATCH
            );
        });

        it('diffs a component with a missing child', () => {

            expect(
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo'}, children: ['one'] }
                ]
                },
                'when diffed against',
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo' }, children: ['one'] },
                    { name: 'span', attribs: {}, children: ['two'] }
                ]
                },
                'to output with weight',
                '<div id="foo">\n' +
                '  <span id="childfoo">one</span>\n' +
                '  // missing <span>two</span>\n' +
                '</div>', HtmlLikeUnexpected.Weights.CHILD_MISSING
            );
        });

        it('diffs a component with an extra child', () => {

            expect(
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo'}, children: ['one'] },
                    { name: 'span', attribs: {}, children: ['two'] }
                ]
                },
                'when diffed against',
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo' }, children: ['one'] }
                ]
                },
                'to output with weight',
                '<div id="foo">\n' +
                '  <span id="childfoo">one</span>\n' +
                '  <span>two</span> // should be removed\n' +
                '</div>', HtmlLikeUnexpected.Weights.CHILD_INSERTED
            );
        });

        it('diffs a component with a child that is an element and should be a string', () => {

            expect(
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo'}, children: ['one'] },
                    { name: 'span', attribs: {}, children: ['two'] }
                ]
                },
                'when diffed against',
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo' }, children: ['one'] },
                    'some text'
                ]
                },
                'to output with weight',
                '<div id="foo">\n' +
                '  <span id="childfoo">one</span>\n' +
                "  <span>two</span> // should be 'some text'\n" +
                '</div>', HtmlLikeUnexpected.Weights.NATIVE_NONNATIVE_MISMATCH
            );
        });

        it('diffs a component with a child that is an deep element and should be a string', () => {

            expect(
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo'}, children: ['one'] },
                    { name: 'span', attribs: {}, children: [
                        { name: 'span', attribs: { className: 'deep'}, children: ['nested and broken over many lines']}
                    ] }
                ]
                },
                'when diffed against',
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo' }, children: ['one'] },
                    'some text'
                ]
                },
                'to output with weight',
                '<div id="foo">\n' +
                '  <span id="childfoo">one</span>\n' +
                '  <span>                                                            // \n' +
                '    <span className="deep">nested and broken over many lines</span> //\n' +
                "  </span>                                                           // should be 'some text'\n" +
                '</div>', HtmlLikeUnexpected.Weights.NATIVE_NONNATIVE_MISMATCH
            );
        });

        it('diffs a component with a child that is a string and should be an element', () => {

            expect(
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo'}, children: ['one'] },
                    'some text'
                ]
                },
                'when diffed against',
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo' }, children: ['one'] },
                    { name: 'span', attribs: {}, children: ['two'] }
                ]
                },
                'to output with weight',
                '<div id="foo">\n' +
                '  <span id="childfoo">one</span>\n' +
                '  some text // should be <span>two</span>\n' +
                '</div>', HtmlLikeUnexpected.Weights.NATIVE_NONNATIVE_MISMATCH
            );
        });

        it('diffs a component with a child that is a string and should be a deep multiline element', () => {

            expect(
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo'}, children: ['one'] },
                    'some text'
                ]
                },
                'when diffed against',
                {
                    name: 'div', attribs: { id: 'foo' }, children: [
                    { name: 'span', attribs: { id: 'childfoo' }, children: ['one'] },
                    { name: 'span', attribs: {}, children: [
                        { name: 'span', attribs: { className: 'deep'}, children: ['nested and broken over many lines']}
                    ] }
                ]
                },
                'to output with weight',
                '<div id="foo">\n' +
                '  <span id="childfoo">one</span>\n' +
                '  some text // should be <span>\n' +
                '            //             <span className="deep">nested and broken over many lines</span>\n' +
                '            //           </span>\n' +
                '</div>', HtmlLikeUnexpected.Weights.NATIVE_NONNATIVE_MISMATCH
            );
        });

    });
});