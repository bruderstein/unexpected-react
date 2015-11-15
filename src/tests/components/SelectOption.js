
import React, { Component } from 'react';

export default class SelectOption extends Component {

    render() {
        return (
            <li id={'unique_' + Math.floor(Math.random()*10000)}>
                {this.props.label}
            </li>);
    }
}