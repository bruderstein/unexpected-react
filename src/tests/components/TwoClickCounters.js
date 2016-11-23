import React, { Component } from 'react';
import ClickCounter from './ClickCounter';

export default class TwoClickCounters extends Component {
  
  render() {
    return (
      <div>
        <ClickCounter className="one" />
        <ClickCounter className="two" />
      </div>
    )
  }
}

