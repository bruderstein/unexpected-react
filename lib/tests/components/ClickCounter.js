'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ClickCounter = function (_Component) {
  _inherits(ClickCounter, _Component);

  function ClickCounter() {
    _classCallCheck(this, ClickCounter);

    var _this = _possibleConstructorReturn(this, (ClickCounter.__proto__ || Object.getPrototypeOf(ClickCounter)).call(this));

    _this.state = { count: 0 };
    _this.onClick = _this.onClick.bind(_this);
    return _this;
  }

  _createClass(ClickCounter, [{
    key: 'onClick',
    value: function onClick() {
      this.setState({
        count: this.state.count + 1
      });
    }
  }, {
    key: 'render',
    value: function render() {

      // This is built like this so the prop is only defined if it's provided, so we don't even pass an undefined prop
      var extraProps = {};
      if (this.props.ariaLabel) {
        extraProps.ariaLabel = this.props.ariaLabel;
      }

      return _react2.default.createElement(
        'button',
        _extends({ className: this.props.className, onClick: this.onClick, onMouseDown: this.props.onMouseDown }, extraProps),
        'Clicked ',
        this.state.count,
        ' times'
      );
    }
  }]);

  return ClickCounter;
}(_react.Component);

exports.default = ClickCounter;


ClickCounter.propTypes = {
  className: _propTypes2.default.string
};