'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Unexpected = require('unexpected');
var UnexpectedReact = require('../unexpected-react');

var React = require('react');
var ReactTestRenderer = require('react/lib/ReactTestRenderer');
var TestUtils = require('react-addons-test-utils');
var Immutable = require('immutable');

var PropTypes = React.PropTypes;

var expect = Unexpected.clone().installPlugin(UnexpectedReact);

var ES5Component = React.createClass({
    displayName: 'ES5Component',
    render: function render() {
        return null;
    }
});

function createNoNameComponent() {
    return React.createClass({
        displayName: '',
        render: function render() {
            return null;
        }
    });
}

var NoNameComponent = createNoNameComponent();

var ClassComponent = (function (_React$Component) {
    _inherits(ClassComponent, _React$Component);

    function ClassComponent() {
        _classCallCheck(this, ClassComponent);

        _get(Object.getPrototypeOf(ClassComponent.prototype), 'constructor', this).apply(this, arguments);
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
})(React.Component);

ClassComponent.propTypes = {
    content: PropTypes.any
};

var MyDiv = (function (_React$Component2) {
    _inherits(MyDiv, _React$Component2);

    function MyDiv() {
        _classCallCheck(this, MyDiv);

        _get(Object.getPrototypeOf(MyDiv.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(MyDiv, [{
        key: 'render',
        value: function render() {
            return React.createElement('div', this.props);
        }
    }]);

    return MyDiv;
})(React.Component);

var FunctionComp = function FunctionComp(props) {
    return React.createElement('div', props);
};

describe('unexpected-react test renderer', function () {

    it('renders', function () {
        var renderer = ReactTestRenderer.create(React.createElement(
            'div',
            { className: 'foo' },
            React.createElement(
                'span',
                null,
                'one'
            ),
            React.createElement(
                'span',
                null,
                'two'
            )
        ));

        expect(renderer, 'to be a', 'ReactTestRenderer');
    });
});
//# sourceMappingURL=unexpected-react-testrenderer.spec.js.map