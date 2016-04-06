'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EmulateDom = require('../testHelpers/emulateDom');

var Unexpected = require('unexpected');
var UnexpectedReact = require('../unexpected-react');

var React = require('react/addons');

var TestUtils = React.addons.TestUtils;

var expect = Unexpected.clone().use(UnexpectedReact);

expect.output.preferredWidth = 80;

/**
 * This is a regression test for bruderstein/unexpected-react#9
 * Unit tests for the issue added in unexpected-htmllike
 */

var LiElement = (function (_React$Component) {
    _inherits(LiElement, _React$Component);

    function LiElement() {
        _classCallCheck(this, LiElement);

        _get(Object.getPrototypeOf(LiElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(LiElement, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'li',
                null,
                this.props.name
            );
        }
    }]);

    return LiElement;
})(React.Component);

LiElement.propTypes = {
    name: React.PropTypes.string
};

var UlElement = (function (_React$Component2) {
    _inherits(UlElement, _React$Component2);

    function UlElement() {
        _classCallCheck(this, UlElement);

        _get(Object.getPrototypeOf(UlElement.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(UlElement, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'ul',
                null,
                this.props.items.map(function (i) {
                    return React.createElement(LiElement, { key: i.id, name: i.name });
                })
            );
        }
    }]);

    return UlElement;
})(React.Component);

UlElement.propTypes = {
    items: React.PropTypes.array
};

describe('Test', function () {
    var items = [{ id: 0, name: 'Banana' }, { id: 1, name: 'Chocolate' }, { id: 2, name: 'Mustard' }];

    it('should render liElement', function () {
        var component = TestUtils.renderIntoDocument(React.createElement(UlElement, { items: items }));

        return expect(function () {
            return expect(component, 'to have rendered with all children', React.createElement(
                'ul',
                null,
                React.createElement(
                    'li',
                    null,
                    items[0].name
                ),
                React.createElement(
                    'li',
                    null,
                    items[2].name
                ),
                React.createElement(
                    'li',
                    null,
                    items[1].name
                )
            ));
        }, 'to error', 'expected\n' + '<UlElement items={[\n' + "  { id: 0, name: 'Banana' },\n" + "  { id: 1, name: 'Chocolate' },\n" + "  { id: 2, name: 'Mustard' }\n" + ']}>\n' + '  <ul>\n' + '    <LiElement name="Banana"><li>Banana</li></LiElement>\n' + '    <LiElement name="Chocolate"><li>Chocolate</li></LiElement>\n' + '    <LiElement name="Mustard"><li>Mustard</li></LiElement>\n' + '  </ul>\n' + '</UlElement>\n' + 'to have rendered with all children <ul><li>Banana</li><li>Mustard</li><li>Chocolate</li></ul>\n' + '\n' + '<UlElement items={[\n' + "  { id: 0, name: 'Banana' },\n" + "  { id: 1, name: 'Chocolate' },\n" + "  { id: 2, name: 'Mustard' }\n" + ']}>\n' + '  <ul>\n' + '    <LiElement name="Banana">\n' + '      <li>Banana</li>\n' + '    </LiElement>\n' + '    <LiElement name="Chocolate">\n' + '      <li>\n' + '        -Chocolate\n' + '        +Mustard\n' + '      </li>\n' + '    </LiElement>\n' + '    <LiElement name="Mustard">\n' + '      <li>\n' + '        -Mustard\n' + '        +Chocolate\n' + '      </li>\n' + '    </LiElement>\n' + '  </ul>\n' + '</UlElement>');
    });
});
//# sourceMappingURL=issue9.spec.js.map