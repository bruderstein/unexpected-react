'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Unexpected = require('unexpected');

var React = require('react');
var ReactTestRenderer = require('react-test-renderer');
var UnexpectedReactTest = require('../../test-renderer');

var PropTypes = React.PropTypes;

var expect = Unexpected.clone().installPlugin(UnexpectedReactTest);

expect.output.preferredWidth = 80;

var ClassComponent = function (_React$Component) {
  _inherits(ClassComponent, _React$Component);

  function ClassComponent() {
    _classCallCheck(this, ClassComponent);

    return _possibleConstructorReturn(this, (ClassComponent.__proto__ || Object.getPrototypeOf(ClassComponent)).apply(this, arguments));
  }

  _createClass(ClassComponent, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { className: 'class-component' },
        this.props.content
      );
    }
  }]);

  return ClassComponent;
}(React.Component);

ClassComponent.propTypes = {
  content: PropTypes.any
};

var MyDiv = function (_React$Component2) {
  _inherits(MyDiv, _React$Component2);

  function MyDiv() {
    _classCallCheck(this, MyDiv);

    return _possibleConstructorReturn(this, (MyDiv.__proto__ || Object.getPrototypeOf(MyDiv)).apply(this, arguments));
  }

  _createClass(MyDiv, [{
    key: 'render',
    value: function render() {
      return React.createElement('div', this.props);
    }
  }]);

  return MyDiv;
}(React.Component);

var ClickCounter = function (_React$Component3) {
  _inherits(ClickCounter, _React$Component3);

  function ClickCounter() {
    _classCallCheck(this, ClickCounter);

    var _this3 = _possibleConstructorReturn(this, (ClickCounter.__proto__ || Object.getPrototypeOf(ClickCounter)).call(this));

    _this3.onClick = _this3.onClick.bind(_this3);
    _this3.onMouseOver = _this3.onMouseOver.bind(_this3);
    _this3.state = { count: 0 };
    return _this3;
  }

  _createClass(ClickCounter, [{
    key: 'onClick',
    value: function onClick() {
      this.setState({
        count: this.state.count + 1
      });
    }
  }, {
    key: 'onMouseOver',
    value: function onMouseOver(event) {
      this.setState({
        count: event.mouseX
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'button',
        {
          className: this.props.className,
          onClick: this.onClick,
          onMouseOver: this.onMouseOver
        },
        this.state.count
      );
    }
  }]);

  return ClickCounter;
}(React.Component);

ClickCounter.propTypes = { className: PropTypes.string };

expect.addAssertion('<any> to inspect as <string>', function (expect, subject, value) {
  expect.errorMode = 'bubble';
  expect(expect.inspect(subject).toString(), 'to equal', value);
});

describe('unexpected-react (test renderer)', function () {

  it('identifies a test renderer', function () {
    var comp = ReactTestRenderer.create(React.createElement(ClassComponent, null));
    expect(comp, 'to be a', 'ReactTestRenderer');
  });

  describe('inspect', function () {

    it('inspects the deep generated component', function () {
      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: React.createElement(
          'span',
          null,
          'hi'
        ) }));
      expect(comp, 'to inspect as', '<div className="class-component"><span>hi</span></div>');
    });
  });

  describe('to have rendered', function () {

    it('compares a renderer with JSX content', function () {
      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: React.createElement(
          'span',
          null,
          'hi'
        ) }));
      expect(comp, 'to have rendered', React.createElement(
        'div',
        { className: 'class-component' },
        React.createElement(
          'span',
          null,
          'hi'
        )
      ));
    });

    it('highlights the error if the content does not match', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: React.createElement(
          'span',
          null,
          'hi'
        ) }));
      expect(function () {
        return expect(comp, 'to have rendered', React.createElement(
          'div',
          { className: 'class-component' },
          React.createElement(
            'span',
            null,
            'hix'
          )
        ));
      }, 'to throw', ['expected <div className="class-component"><span>hi</span></div>', 'to have rendered <div className="class-component"><span>hix</span></div>', '', '<div className="class-component">', '  <span>', '    hi // -hi', '       // +hix', '  </span>', '</div>'].join('\n'));
    });

    it('ignores extra classnames by default', function () {
      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: React.createElement(
          'span',
          { className: 'foo bar' },
          'hi'
        ) }));
      expect(comp, 'to have rendered', React.createElement(
        'div',
        { className: 'class-component' },
        React.createElement(
          'span',
          { className: 'bar' },
          'hi'
        )
      ));
    });

    it('does not ignore extra classnames with `exactly`', function () {
      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: React.createElement(
          'span',
          { className: 'foo bar' },
          'hi'
        ) }));
      expect(function () {
        return expect(comp, 'to have exactly rendered', React.createElement(
          'div',
          { className: 'class-component' },
          React.createElement(
            'span',
            { className: 'bar' },
            'hi'
          )
        ));
      }, 'to throw', ['expected <div className="class-component"><span className="foo bar">hi</span></div>', 'to have exactly rendered <div className="class-component"><span className="bar">hi</span></div>', '', '<div className="class-component">', '  <span className="foo bar" // expected \'foo bar\' to equal \'bar\'', '                            //', '                            // -foo bar', '                            // +bar', '  >', '    hi', '  </span>', '</div>'].join('\n'));
    });
  });

  describe('to contain', function () {

    it('finds content within a deep rendered element', function () {
      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: React.createElement(
          'div',
          null,
          React.createElement(ClassComponent, { content: React.createElement(
              'span',
              null,
              'buried'
            ) })
        ) }));
      expect(comp, 'to contain', React.createElement(
        'span',
        null,
        'buried'
      ));
    });

    it('shows the best match if content is not found', function () {
      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: React.createElement(
          'div',
          null,
          React.createElement(ClassComponent, { content: React.createElement(
              'span',
              null,
              'buried'
            ) })
        ) }));
      expect(comp, 'to be a', 'ReactTestRenderer');
      expect(function () {
        return expect(comp, 'to contain', React.createElement(
          'span',
          null,
          'changed'
        ));
      }, 'to throw', ['expected', '<div className="class-component">', '  <div><div className="class-component"><span>buried</span></div></div>', '</div>', 'to contain <span>changed</span>', '', 'the best match was', '<span>', '  buried // -buried', '         // +changed', '</span>'].join('\n'));
    });

    it('passes when the content is not expected to be found', function () {
      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: React.createElement(
          'div',
          null,
          React.createElement(ClassComponent, { content: React.createElement(
              'span',
              null,
              'buried'
            ) })
        ) }));
      expect(comp, 'not to contain', React.createElement(
        'span',
        null,
        'buriedx'
      ));
    });

    it('fails if the content is found but it was not expected to be', function () {
      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: React.createElement(
          'div',
          null,
          React.createElement(ClassComponent, { content: React.createElement(
              'span',
              null,
              'buried'
            ) })
        ) }));
      expect(function () {
        return expect(comp, 'not to contain', React.createElement(
          'span',
          null,
          'buried'
        ));
      }, 'to throw', ['expected', '<div className="class-component">', '  <div><div className="class-component"><span>buried</span></div></div>', '</div>', 'not to contain <span>buried</span>', '', 'but found the following match', '<span>buried</span>'].join('\n'));
    });
  });

  describe('queried for', function () {

    it('finds an element nested in the content', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: React.createElement(
          'div',
          null,
          React.createElement(ClassComponent, { content: [React.createElement(
              'span',
              { key: '1' },
              'buried'
            ), React.createElement(
              'span',
              { key: '2', className: 'thisone' },
              'other'
            )] })
        )
      }));
      expect(comp, 'queried for', React.createElement('span', { className: 'thisone' }), 'to have rendered', React.createElement(
        'span',
        null,
        'other'
      ));
    });

    it('shows the best match if the query  an element nested in the content', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: React.createElement(
          'div',
          null,
          React.createElement(ClassComponent, { content: [React.createElement(
              'span',
              { key: '1' },
              'buried'
            ), React.createElement(
              'span',
              { key: '2', className: 'thisone' },
              'other'
            )] })
        )
      }));
      expect(function () {
        return expect(comp, 'queried for', React.createElement('span', { className: 'notexists' }), 'to have rendered', React.createElement(
          'span',
          null,
          'other'
        ));
      }, 'to throw', ['expected', '<div className="class-component">', '  <div>', '    <div className="class-component">', '      <span>buried</span><span className="thisone">other</span>', '    </div>', '  </div>', '</div>', 'queried for <span className="notexists" /> to have rendered <span>other</span>', '', '`queried for` found no match.  The best match was', '<span // missing className="notexists"', '>', '  buried', '</span>'].join('\n'));
    });
  });

  describe('with event', function () {

    it('calls an event on a component and re-renders', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClickCounter, null));
      expect(comp, 'with event click', 'to have rendered', React.createElement(
        'button',
        null,
        1
      ));
    });

    it('calls two events and re-renders', function () {
      var comp = ReactTestRenderer.create(React.createElement(ClickCounter, null));
      expect(comp, 'with event click', 'with event click', 'to have rendered', React.createElement(
        'button',
        null,
        2
      ));
    });

    it('calls an event on a component and validates with `to contain`', function () {
      var comp = ReactTestRenderer.create(React.createElement(ClickCounter, null));
      expect(comp, 'with event click', 'to contain', React.createElement(
        'button',
        null,
        1
      ));
    });

    it('calls an event on a component with event arguments', function () {
      var comp = ReactTestRenderer.create(React.createElement(ClickCounter, null));
      expect(comp, 'with event mouseOver', { mouseX: 100 }, 'to have rendered', React.createElement(
        'button',
        null,
        100
      ));
    });

    it('calls an event on a nested component using `on`', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: [React.createElement(ClickCounter, { className: 'one', key: '1' }), React.createElement(ClickCounter, { className: 'two', key: '2' })] }));

      expect(comp, 'with event click', 'on', React.createElement('button', { className: 'two' }), 'to have rendered', React.createElement(
        'div',
        null,
        React.createElement(
          'button',
          { className: 'one' },
          0
        ),
        React.createElement(
          'button',
          { className: 'two' },
          1
        )
      ));
    });

    it('calls an event on a nested component using `eventTarget`', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: [React.createElement(ClickCounter, { className: 'one', key: '1' }), React.createElement(ClickCounter, { className: 'two', key: '2' })] }));

      expect(comp, 'with event click', 'on', React.createElement(
        'div',
        null,
        React.createElement('button', null),
        React.createElement('button', { eventTarget: true })
      ), 'to have rendered', React.createElement(
        'div',
        null,
        React.createElement(
          'button',
          { className: 'one' },
          0
        ),
        React.createElement(
          'button',
          { className: 'two' },
          1
        )
      ));
    });

    it('shows the error when the `on` query cannot be located', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: [React.createElement(ClickCounter, { className: 'one', key: '1' }), React.createElement(ClickCounter, { className: 'two', key: '2' })] }));

      expect(function () {
        return expect(comp, 'with event click', 'on', React.createElement(
          'div',
          null,
          React.createElement('button', null),
          React.createElement('button', { className: 'notavailabe', eventTarget: true })
        ), 'to have rendered', React.createElement(
          'div',
          null,
          React.createElement(
            'button',
            { className: 'one' },
            0
          ),
          React.createElement(
            'button',
            { className: 'two' },
            1
          )
        ));
      }, 'to throw', ['expected', '<div className="class-component">', '  <button className="one" onClick={function bound onClick() { /* native code */ }}', '     onMouseOver={function bound onMouseOver() { /* native code */ }}>', '    0', '  </button>', '  <button className="two" onClick={function bound onClick() { /* native code */ }}', '     onMouseOver={function bound onMouseOver() { /* native code */ }}>', '    0', '  </button>', '</div>', 'with event \'click\' on <div><button /><button className="notavailabe" eventTarget={true} /></div> to have rendered <div><button className="one">0</button><button className="two">1</button></div>', '', 'Could not find the target for the event. The best match was', '', '<div className="class-component">', '  <button className="one" onClick={function bound onClick() { /* native code */ }}', '     onMouseOver={function bound onMouseOver() { /* native code */ }}>', '    0', '  </button>', '  <button className="two" // missing class \'notavailabe\'', '     onClick={function bound onClick() { /* native code */ }}', '     onMouseOver={function bound onMouseOver() { /* native code */ }}>', '    0', '  </button>', '</div>'].join('\n'));
    });

    it('passes the renderer as the value of the promise following an event', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClickCounter, null));
      return expect(comp, 'with event', 'click').then(function (renderer) {
        expect(renderer, 'to be a', 'ReactTestRenderer');
        expect(renderer, 'to have rendered', React.createElement(
          'button',
          null,
          1
        ));
      });
    });

    it('passes the renderer as the value of the promise following an event with `on`', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClickCounter, null));
      return expect(comp, 'with event click', 'on', React.createElement('button', null)).then(function (renderer) {
        expect(renderer, 'to be a', 'ReactTestRenderer');
        expect(renderer, 'to have rendered', React.createElement(
          'button',
          null,
          1
        ));
      });
    });

    it('passes the renderer as the value of the promise following an event with eventArgs', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClickCounter, null));
      return expect(comp, 'with event', 'mouseOver', { mouseX: 100 }).then(function (renderer) {
        expect(renderer, 'to be a', 'ReactTestRenderer');
        expect(renderer, 'to have rendered', React.createElement(
          'button',
          null,
          100
        ));
      });
    });

    it('passes the renderer as the value of the promise following two events', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClickCounter, null));
      return expect(comp, 'with event click', 'on', React.createElement('button', null), 'with event', 'click').then(function (renderer) {
        expect(renderer, 'to be a', 'ReactTestRenderer');
        expect(renderer, 'to have rendered', React.createElement(
          'button',
          null,
          2
        ));
      });
    });

    it('finds an element with `queried for` after an event', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: [React.createElement(ClickCounter, { className: 'one', key: '1' }), React.createElement(ClickCounter, { className: 'two', key: '2' })] }));

      expect(comp, 'with event', 'click', 'on', React.createElement('button', { className: 'two' }), 'queried for', React.createElement('button', { className: 'two' }), 'to have rendered', React.createElement(
        'button',
        null,
        1
      ));
    });

    it('finds an element with `to contain` after an event', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClickCounter, { className: 'one' }));

      expect(comp, 'with event', 'click', 'to contain', React.createElement(
        'button',
        null,
        1
      ));
    });

    it('finds an element with `to contain` after an event with `on`', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: [React.createElement(ClickCounter, { className: 'one', key: '1' }), React.createElement(ClickCounter, { className: 'two', key: '2' })] }));

      expect(comp, 'with event', 'click', 'on', React.createElement('button', { className: 'two' }), 'to contain', React.createElement(
        'button',
        { className: 'two' },
        1
      ));
    });

    it('passes when no element can be found using `not to contain` after an event', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: [React.createElement(ClickCounter, { className: 'one', key: '1' }), React.createElement(ClickCounter, { className: 'two', key: '2' })] }));

      expect(comp, 'with event', 'click', 'on', React.createElement('button', { className: 'two' }), 'not to contain', React.createElement(
        'button',
        { className: 'not-exists' },
        1
      ));
    });

    it('shows the best match when no element can be found using `to contain` after an event', function () {

      var comp = ReactTestRenderer.create(React.createElement(ClassComponent, { content: [React.createElement(ClickCounter, { className: 'one', key: '1' }), React.createElement(ClickCounter, { className: 'two', key: '2' })] }));

      expect(function () {
        return expect(comp, 'with event', 'click', 'on', React.createElement('button', { className: 'two' }), 'to contain', React.createElement(
          'button',
          { className: 'not-exists' },
          1
        ));
      }, 'to throw', ['expected', '<div className="class-component">', '  <button className="one" onClick={function bound onClick() { /* native code */ }}', '     onMouseOver={function bound onMouseOver() { /* native code */ }}>', '    0', '  </button>', '  <button className="two" onClick={function bound onClick() { /* native code */ }}', '     onMouseOver={function bound onMouseOver() { /* native code */ }}>', '    1', '  </button>', '</div>', 'with event \'click\' on <button className="two" /> to contain <button className="not-exists">1</button>', '', 'the best match was', '<button className="two" // missing class \'not-exists\'', '   onClick={function bound onClick() { /* native code */ }}', '   onMouseOver={function bound onMouseOver() { /* native code */ }}>', '  1', '</button>'].join('\n'));
    });
  });
});