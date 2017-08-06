var Unexpected = require('unexpected');

var React = require('react');
var PropTypes = require('prop-types');
var ReactTestRenderer = require('react-test-renderer');
var UnexpectedReactTest = require('../../test-renderer');

var expect = Unexpected.clone()
  .installPlugin(UnexpectedReactTest);

expect.output.preferredWidth = 80;

class ClassComponent extends React.Component {
  render() {
    return (
      <div className="class-component">
        {this.props.content}
      </div>
    );
  }
}

ClassComponent.propTypes = {
  content: PropTypes.any
};

class MyDiv extends React.Component {
  render() {
    return React.createElement('div', this.props);
  }
}

class ClickCounter extends React.Component {
  
  constructor() {
  
    super();
    this.onClick = this.onClick.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.state = { count: 0 };
  }
  
  onClick() {
    this.setState({
      count: this.state.count + 1
    });
  }
  
  onMouseOver(event) {
    this.setState({
      count: event.mouseX
    });
  }

  render() {
    return (
      <button 
        className={this.props.className} 
        onClick={this.onClick}
        onMouseOver={this.onMouseOver}
      >{this.state.count}</button>
    );
  }
}

ClickCounter.propTypes = { className: PropTypes.string };

expect.addAssertion('<any> to inspect as <string>', function (expect, subject, value) {
  expect.errorMode = 'bubble';
  expect(expect.inspect(subject).toString(), 'to equal', value);
});

describe('unexpected-react (test renderer)', function () {
  
  it('identifies a test renderer', function () {
    const comp = ReactTestRenderer.create(<ClassComponent />);
    expect(comp, 'to be a', 'ReactTestRenderer');
  });
  
  describe('inspect', function () {
    
    it('inspects the deep generated component', function () {
      const comp = ReactTestRenderer.create(<ClassComponent content={<span>hi</span>} />);
      expect(comp, 'to inspect as', '<div className="class-component"><span>hi</span></div>');
    });
    
  });
  
  describe('to have rendered', function () {
    
    it('compares a renderer with JSX content', function () {
      const comp = ReactTestRenderer.create(<ClassComponent content={<span>hi</span>} />);
      expect(comp, 'to have rendered', <div className="class-component"><span>hi</span></div>);
    });
    
    it('highlights the error if the content does not match', function () {
  
      const comp = ReactTestRenderer.create(<ClassComponent content={<span>hi</span>} />);
      expect(
        () => expect(comp, 'to have rendered', <div className="class-component"><span>hix</span></div>),
        'to throw',
        [
          'expected <div className="class-component"><span>hi</span></div>',
          'to have rendered <div className="class-component"><span>hix</span></div>',
          '',
          '<div className="class-component">',
          '  <span>',
          '    hi // -hi',
          '       // +hix',
          '  </span>',
          '</div>'
        ].join('\n'));
    });
    
    it('ignores extra classnames by default', function () {
      const comp = ReactTestRenderer.create(<ClassComponent content={<span className="foo bar">hi</span>} />);
      expect(comp, 'to have rendered', <div className="class-component"><span className="bar">hi</span></div>);
    });
    
    it('does not ignore extra classnames with `exactly`', function () {
      const comp = ReactTestRenderer.create(<ClassComponent content={<span className="foo bar">hi</span>} />);
      expect(
        () => expect(comp, 'to have exactly rendered', <div className="class-component"><span className="bar">hi</span></div>),
        'to throw',
      [
        'expected <div className="class-component"><span className="foo bar">hi</span></div>',
        'to have exactly rendered <div className="class-component"><span className="bar">hi</span></div>',
        '',
        '<div className="class-component">',
        '  <span className="foo bar" // expected \'foo bar\' to equal \'bar\'',
        '                            //',
        '                            // -foo bar',
        '                            // +bar',
        '  >',
        '    hi',
        '  </span>',
        '</div>'
      ].join('\n'));
    });

  });
  
  describe('to contain', function () {
    
    it('finds content within a deep rendered element', function () {
      const comp = ReactTestRenderer.create(<ClassComponent content={<div><ClassComponent content={<span>buried</span>} /></div>} />);
      expect(comp, 'to contain', <span>buried</span>);
    });
    
    it('shows the best match if content is not found', function () {
      const comp = ReactTestRenderer.create(<ClassComponent content={<div><ClassComponent content={<span>buried</span>} /></div>} />);
      expect(comp, 'to be a', 'ReactTestRenderer');
      expect(
        () => expect(comp, 'to contain', <span>changed</span>),
        'to throw',
        [
          'expected',
          '<div className="class-component">',
          '  <div><div className="class-component"><span>buried</span></div></div>',
          '</div>',
          'to contain <span>changed</span>',
          '',
          'the best match was',
          '<span>',
          '  buried // -buried',
          '         // +changed',
          '</span>'
        ].join('\n'));
    });
    
    it('passes when the content is not expected to be found', function () {
      const comp = ReactTestRenderer.create(<ClassComponent content={<div><ClassComponent content={<span>buried</span>} /></div>} />);
      expect(comp, 'not to contain', <span>buriedx</span>);
    });
  
    it('fails if the content is found but it was not expected to be', function () {
      const comp = ReactTestRenderer.create(<ClassComponent content={<div><ClassComponent content={<span>buried</span>} /></div>} />);
      expect(
        () => expect(comp, 'not to contain', <span>buried</span>),
        'to throw',
        [
          'expected',
          '<div className="class-component">',
          '  <div><div className="class-component"><span>buried</span></div></div>',
          '</div>',
          'not to contain <span>buried</span>',
          '',
          'but found the following match',
          '<span>buried</span>'
        ].join('\n'));
    });
  });

  describe('queried for', function () {

    it('finds an element nested in the content', function () {

      const comp = ReactTestRenderer.create(
        <ClassComponent content={
          <div><ClassComponent content={[<span key="1">buried</span>, <span key="2" className="thisone">other</span>]} />
          </div>}
        />);
      expect(comp, 'queried for', <span className="thisone" />, 'to have rendered', <span>other</span>);
    });

    it('shows the best match if the query  an element nested in the content', function () {

      const comp = ReactTestRenderer.create(
        <ClassComponent content={
          <div><ClassComponent content={[<span key="1">buried</span>, <span key="2" className="thisone">other</span>]} />
          </div>}
        />);
      expect(
        () => expect(comp, 'queried for', <span className="notexists" />, 'to have rendered', <span>other</span>),
        'to throw',
        [
          'expected',
          '<div className="class-component">',
          '  <div>',
          '    <div className="class-component">',
          '      <span>buried</span><span className="thisone">other</span>',
          '    </div>',
          '  </div>',
          '</div>',
          'queried for <span className="notexists" /> to have rendered <span>other</span>',
          '',
          '`queried for` found no match.  The best match was',
          '<span // missing className="notexists"',
          '>',
          '  buried',
          '</span>'
        ].join('\n'));
    });
  });
  
  describe('with event', function () {
    
    it('calls an event on a component and re-renders', function () {
      
      const comp = ReactTestRenderer.create(<ClickCounter />);
      expect(comp,
        'with event click',
        'to have rendered',
        <button>{1}</button>
      );
    });
    
    it('calls two events and re-renders', function () {
      const comp = ReactTestRenderer.create(<ClickCounter />);
      expect(comp,
        'with event click',
        'with event click',
        'to have rendered',
        <button>{2}</button>
      );
    });
    
    it('calls an event on a component and validates with `to contain`', function () {
      const comp = ReactTestRenderer.create(<ClickCounter />);
      expect(comp,
        'with event click',
        'to contain',
        <button>{1}</button>
      );
    });
  
    it('calls an event on a component with event arguments', function () {
      const comp = ReactTestRenderer.create(<ClickCounter />);
      expect(comp,
        'with event mouseOver', { mouseX: 100 },
        'to have rendered',
        <button>{100}</button>
      );
    });
    
    it('calls an event on a nested component using `on`', function () {
  
      const comp = ReactTestRenderer.create(
        <ClassComponent content={[<ClickCounter className="one" key="1"/>, <ClickCounter className="two" key="2"/>] } />);
      
      expect(comp,
        'with event click', 'on', <button className="two" />,
        'to have rendered',
        <div>
          <button className="one">{0}</button>
          <button className="two">{1}</button>
        </div>
      );
    });
    
    it('calls an event on a nested component using `eventTarget`', function () {
    
      const comp = ReactTestRenderer.create(
        <ClassComponent content={[<ClickCounter className="one" key="1"/>, <ClickCounter className="two" key="2"/>] } />);
    
      expect(comp,
        'with event click', 'on', <div><button /><button eventTarget /></div>,
        'to have rendered',
        <div>
          <button className="one">{0}</button>
          <button className="two">{1}</button>
        </div>
      );
    });
  
    it('shows the error when the `on` query cannot be located', function () {
    
      const comp = ReactTestRenderer.create(
        <ClassComponent content={[<ClickCounter className="one" key="1"/>, <ClickCounter className="two" key="2"/>] } />);
  
      expect(
        () => expect(comp,
          'with event click', 'on', <div><button /><button className="notavailabe" eventTarget /></div>,
          'to have rendered',
          <div>
            <button className="one">{0}</button>
            <button className="two">{1}</button>
          </div>
        ),
        'to throw',
        [
          'expected',
          '<div className="class-component">',
          '  <button className="one" onClick={function bound onClick() { /* native code */ }}',
          '     onMouseOver={function bound onMouseOver() { /* native code */ }}>',
          '    0',
          '  </button>',
          '  <button className="two" onClick={function bound onClick() { /* native code */ }}',
          '     onMouseOver={function bound onMouseOver() { /* native code */ }}>',
          '    0',
          '  </button>',
          '</div>',
          'with event click on <div><button /><button className="notavailabe" eventTarget={true} /></div> to have rendered <div><button className="one">0</button><button className="two">1</button></div>',
          '',
          'Could not find the target for the event. The best match was',
          '',
          '<div className="class-component">',
          '  <button className="one" onClick={function bound onClick() { /* native code */ }}',
          '     onMouseOver={function bound onMouseOver() { /* native code */ }}>',
          '    0',
          '  </button>',
          '  <button className="two" // missing class \'notavailabe\'',
          '     onClick={function bound onClick() { /* native code */ }}',
          '     onMouseOver={function bound onMouseOver() { /* native code */ }}>',
          '    0',
          '  </button>',
          '</div>'
        ].join('\n'));
    });
  
    it('passes the renderer as the value of the promise following an event', function () {
    
      const comp = ReactTestRenderer.create(<ClickCounter />);
      return expect(comp, 'with event', 'click')
        .then(renderer => {
          expect(renderer, 'to be a', 'ReactTestRenderer');
          expect(renderer, 'to have rendered', <button>{1}</button>);
        });
    });
    
    it('passes the renderer as the value of the promise following an event with `on`', function () {
  
      const comp = ReactTestRenderer.create(<ClickCounter />);
      return expect(comp, 'with event click', 'on', <button />)
        .then(renderer => {
          expect(renderer, 'to be a', 'ReactTestRenderer');
          expect(renderer, 'to have rendered', <button>{1}</button>);
        });
    });
  
    it('passes the renderer as the value of the promise following an event with eventArgs', function () {
    
      const comp = ReactTestRenderer.create(<ClickCounter />);
      return expect(comp, 'with event', 'mouseOver', { mouseX: 100 } )
        .then(renderer => {
          expect(renderer, 'to be a', 'ReactTestRenderer');
          expect(renderer, 'to have rendered', <button>{100}</button>);
        });
    });
    
    it('passes the renderer as the value of the promise following two events', function () {
    
      const comp = ReactTestRenderer.create(<ClickCounter />);
      return expect(comp, 'with event click', 'on', <button />, 'with event', 'click')
        .then(renderer => {
          expect(renderer, 'to be a', 'ReactTestRenderer');
          expect(renderer, 'to have rendered', <button>{2}</button>);
        });
    });
  
    it('finds an element with `queried for` after an event', function () {
    
      const comp = ReactTestRenderer.create(
        <ClassComponent content={[<ClickCounter className="one" key="1"/>, <ClickCounter className="two" key="2"/>] } />);
    
      expect(comp, 
        'with event', 'click', 'on', <button className="two" />, 
        'queried for', <button className="two" />, 
        'to have rendered', <button>{1}</button>);
    });
  
    it('finds an element with `to contain` after an event', function () {
    
      const comp = ReactTestRenderer.create(<ClickCounter className="one" />);
    
      expect(comp,
        'with event', 'click',
        'to contain', <button>{1}</button>);
    });
    
    it('finds an element with `to contain` after an event with `on`', function () {
      
      const comp = ReactTestRenderer.create(
        <ClassComponent content={[<ClickCounter className="one" key="1" />, <ClickCounter className="two" key="2" />] } />);
  
      expect(comp,
        'with event', 'click', 'on', <button className="two" />,
        'to contain', <button className="two">{1}</button>);
    });
    
    it('passes when no element can be found using `not to contain` after an event', function () {
    
      const comp = ReactTestRenderer.create(
        <ClassComponent content={[<ClickCounter className="one" key="1" />, <ClickCounter className="two" key="2" />] } />);
    
      expect(comp,
        'with event', 'click', 'on', <button className="two" />,
        'not to contain', <button className="not-exists">{1}</button>);
    });
    
    it('shows the best match when no element can be found using `to contain` after an event', function () {
  
      const comp = ReactTestRenderer.create(
        <ClassComponent content={[<ClickCounter className="one" key="1" />, <ClickCounter className="two" key="2" />] } />);
   
      expect(
        () =>
          expect(comp,
            'with event', 'click', 'on', <button className="two"/>,
            'to contain', <button className="not-exists">{1}</button>),
        'to throw',
        [
          'expected',
          '<div className="class-component">',
          '  <button className="one" onClick={function bound onClick() { /* native code */ }}',
          '     onMouseOver={function bound onMouseOver() { /* native code */ }}>',
          '    0',
          '  </button>',
          '  <button className="two" onClick={function bound onClick() { /* native code */ }}',
          '     onMouseOver={function bound onMouseOver() { /* native code */ }}>',
          '    1',
          '  </button>',
          '</div>',
          'with event \'click\' on <button className="two" /> to contain <button className="not-exists">1</button>',
          '',
          'the best match was',
          '<button className="two" // missing class \'not-exists\'',
          '   onClick={function bound onClick() { /* native code */ }}',
          '   onMouseOver={function bound onMouseOver() { /* native code */ }}>',
          '  1',
          '</button>'
        ].join('\n'));
    });
  });
  
});
