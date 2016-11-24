import React, { Component, PropTypes } from 'react';

export default class ClickCounter extends Component {
  
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
      <button className={this.props.className} onClick={this.onClick} onMouseDown={this.props.onMouseDown}>
        Clicked {this.state.count} times
      </button>
    );
  }
}

ClickCounter.propTypes = {
  className: PropTypes.string
}