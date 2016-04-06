
import React, { Component, PropTypes } from 'react';

class SelectOption extends Component {

    render() {
        return (
            <li id={'unique_' + Math.floor(Math.random()*10000)} className="Select__item--unselected Select__item ">
                {this.props.label}
            </li>);
    }
}

SelectOption.propTypes = {
    label: PropTypes.string
};

module.exports = SelectOption;