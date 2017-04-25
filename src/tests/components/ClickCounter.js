import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
    
    // This is built like this so the prop is only defined if it's provided, so we don't even pass an undefined prop
    const extraProps = {};
    if (this.props.ariaLabel) {
      extraProps.ariaLabel = this.props.ariaLabel;
    }
    
    return (
      <button className={this.props.className} onClick={this.onClick} onMouseDown={this.props.onMouseDown} {...extraProps}>
        Clicked {this.state.count} times
      </button>
    );
  }
}

ClickCounter.propTypes = {
  className: PropTypes.string
}