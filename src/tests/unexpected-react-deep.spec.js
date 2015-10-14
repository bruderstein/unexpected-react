const EmulateDom = require( '../testHelpers/emulateDom');
EmulateDom();

const Unexpected = require('unexpected');
const UnexpectedReactDeep = require('../unexpected-react-deep');

const React = require('react/addons');

const TestUtils = React.addons.TestUtils;

const expect = Unexpected.clone()
    .use(UnexpectedReactDeep);

class CustomComp extends React.Component {
    render() {
        return <div className={this.props.className}/>
    }
}

class WrapperComp extends React.Component {
    render() {
        return <CustomComp className={this.props.className} />;
    }
}

describe('unexpected-react-deep', () => {

    describe('identify', () => {

        it('identifies a rendered component', () => {

            const component = TestUtils.renderIntoDocument(<div className="foo" />);
            expect(component, 'to be a', 'RenderedReactElement');
        });

    });

    describe('ReactModule', () => {
        it('identifies React correctly', () => {

            expect(React, 'to be a', 'ReactModule');
        });

        it('determines that the global hook has been installed', () => {

            expect(React, 'to have been injected');
        });
    });


    describe('inspect', () => {

        it('inspects a rendered native element', () => {

            const component = TestUtils.renderIntoDocument(<div className="foo" />);
            expect(expect.inspect(component).toString(), 'to equal',
                '<div className="foo" />');
        });

        it('inspects a rendered native element with a string child', () => {

            const component = TestUtils.renderIntoDocument(<div className="foo">content</div>);
            expect(expect.inspect(component).toString(), 'to equal',
                '<div className="foo">content</div>');
        });

        it('inspects a rendered native element with a numeric child', () => {

            const component = TestUtils.renderIntoDocument(<div className="foo">{42}</div>);
            expect(expect.inspect(component).toString(), 'to equal',
                '<div className="foo">42</div>');
        });



        it('inspects a rendered native element with children', () => {

            const component = TestUtils.renderIntoDocument(<div className="foo"><span className="child1" /></div>);
            expect(expect.inspect(component).toString(), 'to equal',
                '<div className="foo"><span className="child1" /></div>');
        });

        it('inspects a rendered native element with children and content', () => {

            const component = TestUtils.renderIntoDocument(
                <div className="foo">
                    <span className="child1">child content 1</span>
                    <span className="child2">child content 2</span>
                </div>);
            expect(expect.inspect(component).toString(), 'to equal',
                '<div className="foo">\n' +
                '  <span className="child1">child content 1</span>\n' +
                '  <span className="child2">child content 2</span>\n' +
                '</div>');
        });

        it('inspects a rendered custom component', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" />);
            expect(expect.inspect(component).toString(), 'to equal',
                '<CustomComp className="bar"><div className="bar" /></CustomComp>');
        });

        it('inspects a rendered custom component with a child custom component element', () => {

            const component = TestUtils.renderIntoDocument(<WrapperComp className="bar" />);
            expect(expect.inspect(component).toString(), 'to equal',
            '<WrapperComp className="bar">\n' +
            '  <CustomComp className="bar"><div className="bar" /></CustomComp>\n' +
            '</WrapperComp>');
        });

    });

    describe('to render as', () => {

        it('matches a rendered simple component', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" />);
            expect(component, 'to render as', <CustomComp className="bar"><div className="bar" /></CustomComp>);
        });

        it('matches a rendered deeper component', () => {

            const component = TestUtils.renderIntoDocument(<WrapperComp className="bar" />);
            expect(component, 'to render as',
                <WrapperComp className="bar">
                    <CustomComp className="bar">
                        <div className="bar" />
                    </CustomComp>
                </WrapperComp>);
        });
    })
});