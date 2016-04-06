'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _SelectOption = require('./SelectOption');

var _SelectOption2 = _interopRequireDefault(_SelectOption);

var Select = (function (_Component) {
    _inherits(Select, _Component);

    function Select() {
        _classCallCheck(this, Select);

        _get(Object.getPrototypeOf(Select.prototype), 'constructor', this).call(this);
        this.state = {
            open: false
        };

        this.showMenu = this.showMenu.bind(this);
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
                    return _react2['default'].createElement(_SelectOption2['default'], { key: option.value, value: option.value, label: option.label });
                });
                content = _react2['default'].createElement(
                    'ul',
                    null,
                    options
                );
            } else {
                content = this.props.selected && this.props.selected.label;
            }

            return _react2['default'].createElement(
                'div',
                { className: 'Select', onClick: this.showMenu },
                content
            );
        }
    }]);

    return Select;
})(_react.Component);

Select.propTypes = {
    options: _react.PropTypes.array,
    selected: _react.PropTypes.shape({
        label: _react.PropTypes.string
    })
};

module.exports = Select;
//# sourceMappingURL=Select.js.map