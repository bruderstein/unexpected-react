/*global unexpected:true, TestUtils:true, React:true, sinon:true*/

require( './src/testHelpers/emulateDom');

global.unexpected = require('unexpected');
unexpected.output.preferredWidth = 80;
unexpected.use(require('./src/unexpected-react'));

global.TestUtils = require('react-addons-test-utils');
global.React = require('react');


const TodoItem = React.createClass({
    propTypes: {
        id: React.PropTypes.number,
        label: React.PropTypes.string
    },

    getInitialState() {
        return {
            isCompleted: false
        };
    },

    onClick() {
        this.setState({
            isCompleted: true
        });
    },

    render() {
        return (
            <div
              className={`item ${ this.state.isCompleted ? 'completed' : 'incomplete'}`}
              onClick={this.onClick}
            >
                <span className="id">{this.props.id}</span>
                <span className="label">{this.props.label}</span>
                <span>{this.state.isCompleted ? 'Completed!' : 'Todo'}</span>
            </div>
        );
    }
});

const TodoList = React.createClass({
    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        const { children } = this.props;

        return (
            <div>
                <div className="items">
                    { children }
                </div>
                <div className="add-new-item">
                   <input placeholder="Enter something to do" />
                </div>
            </div>
        );
    }
});

global.TodoItem = TodoItem;
global.TodoList = TodoList;

const MyButton = React.createClass({
    getInitialState () {
        return {
            count: 0
        };
    },

    onClick () {
        const { count } = this.state;
        this.setState({ count: count + 1 });
    },

    render() {
        const { count } = this.state;

        return (
            <button onClick={ this.onClick }>
                Button was clicked { count } times
            </button>
        );
    }
});

global.MyButton = MyButton;
