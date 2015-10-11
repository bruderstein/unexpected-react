
import HtmlLikeUnexpected from '../';
import MagicPen from 'magicpen';
import MagicPenPrism from 'magicpen-prism';
import Unexpected from 'unexpected';

const expect = Unexpected.clone();

const TestAdapter = {
        getName(comp) { return comp.name; },

        getAttributes(comp) { return comp.attribs; },

        getChildren(comp) {
            return comp.children;
        }
}

describe('HtmlLikeComponent', () => {

    let htmlLikeUnexpected;
    let pen;

    beforeEach(() => {

        htmlLikeUnexpected = new HtmlLikeUnexpected(TestAdapter);
        pen = new MagicPen();
        MagicPenPrism.installInto(pen);

    });

    it('outputs a formatted output with no children', () => {
        htmlLikeUnexpected.inspect({ name: 'div', attribs: { id: 'foo', className: 'bar' }, children: [] }, 0, pen);
        expect(pen.toString(), 'to equal', '<div id="foo" className="bar" />');
    });

    it('outputs a formatted output with children', () => {

        htmlLikeUnexpected.inspect({
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
        }, 0, pen);

        expect(pen.toString(), 'to equal',
            '<div id="foo" className="bar">\n' +
            '  <span className="child1">child content 1</span>\n' +
            '  <span className="child2">child content 2</span>\n' +
            '</div>');
    });

    it('outputs children on a single line if it fits', () => {

        htmlLikeUnexpected.inspect({
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
        }, 0, pen);

        expect(pen.toString(), 'to equal',
            '<div id="foo" className="bar"><span>1</span><span>2</span></div>');
    });

    describe('with no external inspect function', () => {

        it('outputs an object attribute with ellipses', () => {

            htmlLikeUnexpected.inspect({
                name: 'div', attribs: {special: {abc: 123, def: 'bar'}}, children: []
            }, 0, pen);

            expect(pen.toString(), 'to equal',
                '<div special={...} />');
        });
    });

    describe('with an external inspect function', () => {

        it('outputs an inspected object attribute', () => {

            htmlLikeUnexpected.inspect({
                name: 'div', attribs: {special: {abc: 123, def: 'bar'}}, children: []
            }, 0, pen, (value) => 'INSPECTED' + value.abc);

            expect(pen.toString(), 'to equal',
                '<div special={INSPECTED123} />');
        });
    });
});