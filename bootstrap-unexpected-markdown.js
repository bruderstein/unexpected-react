/*global unexpected:true, TestUtils:true, React:true, sinon:true*/

require( './src/tests/helpers/emulateDom');

global.unexpected = require('unexpected');
unexpected.output.preferredWidth = 80;
unexpected.use(require('./src/unexpected-react'));

global.TestUtils = require('react-dom/test-utils');
global.React = require('react');
global.PropTypes = require('prop-types');
global.createRenderer = require('react-test-renderer/shallow').createRenderer;
global.createClass = require('create-react-class');


const TodoItem = createClass({
    propTypes: {
        id: PropTypes.number,
        label: PropTypes.string
    },

    getInitialState() {
        return {
            completed: false
        };
    },

    onClick() {
        this.setState({
            completed: true
        });
    },

    render() {
        return (
            <div
              id={'todo-' + this.props.id}
              className={`item ${ this.state.completed ? 'completed' : 'incomplete'}`}
              onClick={this.onClick}
            >
                <span className="id">{this.props.id}</span>
                <span className="label">{this.props.label}</span>
                <span>{this.state.completed ? 'Completed!' : 'Todo'}</span>
            </div>
        );
    }
});

const TodoList = createClass({
    propTypes: {
        children: PropTypes.node
    },
    
    getInitialState() {
        return { clicked: {} };
    },
    
    onClick(index) {
        // State mutation, this is not recommended, but saves us rebuilding each time
        this.state.clicked[index] = true;
        this.setState({
            clicked: this.state.clicked
        });
    },
    
    noop() {},

    render() {
        const children = this.props.children.map(child => {
            return React.cloneElement(child, { 
                key: child.props.id,
                onClick: this.onClick.bind(this, child.props.id),
                clicked: !!this.state.clicked[child.props.id],
                onMouseDown: this.noop
            });
        });
        

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

const App = createClass({

    getInitialState() {
        return { clickTestClicked: false };
    },
    
    onClickTest() {
        this.setState({ clickTestClicked: true });
    },
    
    render() {
        return (
            <div>
                    <div className="other-button"><button>Not clicked</button></div>
                    <div className="click-test">
                        <button className="click-test" onClick={this.onClickTest}>
                            {this.state.clickTestClicked ? 'Button was clicked' : 'Not clicked'}
                        </button>
                    </div>
            </div>
        );
    }
});

global.TodoItem = TodoItem;
global.TodoList = TodoList;
global.App = App;

const MyButton = createClass({
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
