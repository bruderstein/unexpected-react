
import React, { Component, PropTypes } from 'react';
import TestRenderer from 'react-test-renderer';
import Unexpected from 'unexpected';
import UnexpectedReactJest from '../../test-renderer-jest';

const expect = Unexpected.clone().use(UnexpectedReactJest);

class ClickCounter extends Component {

  constructor() {
    super();
    this.state = { count: 0 };
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState({
      count: this.state.count + 1
    });
  }

  render() {
    return (
      <button className={this.props.className} onClick={this.onClick}>Clicked {this.state.count} times</button>
    );
  }
}

class TestComponent extends Component {

  render() {
    return (
      <div>
        <ClickCounter className="one" />
        <ClickCounter className="two" />
      </div>
    )
  }
}

describe('snaphot-tests', function () {
  
  it('stores a basic snapshot', function () {
    const renderer = TestRenderer.create(<TestComponent />);
    
    expect(renderer, 'to match snapshot');
  });
});
