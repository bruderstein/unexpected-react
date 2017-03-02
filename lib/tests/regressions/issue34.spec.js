'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _unexpectedReact = require('../../unexpected-react');

var _unexpectedReact2 = _interopRequireDefault(_unexpectedReact);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _unexpected = require('unexpected');

var _unexpected2 = _interopRequireDefault(_unexpected);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Foo = function (_Component) {
  _inherits(Foo, _Component);

  function Foo(props) {
    _classCallCheck(this, Foo);

    var _this = _possibleConstructorReturn(this, (Foo.__proto__ || Object.getPrototypeOf(Foo)).call(this, props));

    _this.state = {
      focus: false
    };

    _this.handleFocus = _this.handleFocus.bind(_this);
    _this.handleBlur = _this.handleBlur.bind(_this);
    return _this;
  }

  _createClass(Foo, [{
    key: 'handleFocus',
    value: function handleFocus(e) {
      this.setState({ focus: true });
    }
  }, {
    key: 'handleBlur',
    value: function handleBlur(e) {
      this.setState({ focus: false });
    }
  }, {
    key: 'render',
    value: function render() {
      var focus = this.state.focus;


      return _react2.default.createElement(
        'div',
        { tabIndex: '0', onFocus: this.handleFocus, onBlur: this.handleBlur },
        focus && _react2.default.createElement(
          'div',
          { className: 'with-focus' },
          _react2.default.createElement(
            'span',
            null,
            'with focus'
          )
        )
      );
    }
  }]);

  return Foo;
}(_react.Component);

var expect = _unexpected2.default.clone().use(_unexpectedReact2.default);

describe('issue 34', function () {
  var renderer = void 0;

  before(function () {
    expect.addAssertion('<ReactShallowRenderer> when focussed <assertion>', function (expect, renderer) {
      var _renderer$getRenderOu = renderer.getRenderOutput(),
          onFocus = _renderer$getRenderOu.props.onFocus;

      onFocus();
      return expect.shift(renderer);
    });
    expect.addAssertion('<ReactShallowRenderer> when blurred <assertion>', function (expect, renderer) {
      var _renderer$getRenderOu2 = renderer.getRenderOutput(),
          onBlur = _renderer$getRenderOu2.props.onBlur;

      onBlur();
      return expect.shift(renderer);
    });
  });

  beforeEach(function () {
    renderer = (0, _reactAddonsTestUtils.createRenderer)();
  });

  describe('with event', function () {
    it('renders div.with-focus on focus', function () {
      renderer.render(_react2.default.createElement(Foo, null));

      return expect(renderer, 'with event focus', 'to contain', _react2.default.createElement(
        'div',
        { className: 'with-focus' },
        _react2.default.createElement(
          'span',
          null,
          'with focus'
        )
      ));
    });

    it('does not render div.with-focus\' on blur', function () {
      renderer.render(_react2.default.createElement(Foo, null));

      return expect(renderer, 'with event focus', 'with event blur', 'not to contain', _react2.default.createElement('div', { className: 'with-focus' }));
    });
  });

  describe('custom', function () {
    it('renders div.with-focus on focus', function () {
      renderer.render(_react2.default.createElement(Foo, null));

      return expect(renderer, 'when focussed', 'to contain', _react2.default.createElement(
        'div',
        { className: 'with-focus' },
        _react2.default.createElement(
          'span',
          null,
          'with focus'
        )
      ));
    });

    it('does not render div.with-focus on blur', function () {
      renderer.render(_react2.default.createElement(Foo, null));

      return expect(renderer, 'when focussed', 'when blurred', 'not to contain', _react2.default.createElement('div', { className: 'with-focus' }));
    });
  });
});