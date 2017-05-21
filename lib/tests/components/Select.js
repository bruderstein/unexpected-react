'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _SelectOption = require('./SelectOption');

var _SelectOption2 = _interopRequireDefault(_SelectOption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Select = function (_Component) {
    _inherits(Select, _Component);

    function Select() {
        _classCallCheck(this, Select);

        var _this = _possibleConstructorReturn(this, (Select.__proto__ || Object.getPrototypeOf(Select)).call(this));

        _this.state = {
            open: false
        };

        _this.showMenu = _this.showMenu.bind(_this);
        return _this;
    }

    _createClass(Select, [{
        key: 'showMenu',
        value: function showMenu() {
            this.setState({
                open: true
            });
        }
    }, {
        key: 'render',
        value: function render() {

            var content = null;
            if (this.state.open) {
                var options = this.props.options.map(function (option) {
                    return _react2.default.createElement(_SelectOption2.default, { key: option.value, value: option.value, label: option.label });
                });
                content = _react2.default.createElement(
                    'ul',
                    null,
                    options
                );
            } else {
                content = this.props.selected && this.props.selected.label;
            }

            return _react2.default.createElement(
                'div',
                { className: 'Select', onClick: this.showMenu },
                content
            );
        }
    }]);

    return Select;
}(_react.Component);

Select.propTypes = {
    options: _propTypes2.default.array,
    selected: _propTypes2.default.shape({
        label: _propTypes2.default.string
    })
};

module.exports = Select;