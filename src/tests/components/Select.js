
import React, { Component } from 'react';
import SelectOption from './SelectOption';

class Select extends Component {

    constructor() {
        super();
        this.state = {
            open: false
        };

        this.showMenu = this.showMenu.bind(this);
    }

    showMenu() {
        this.setState({
            open: true
        });
    }

    render() {

        let content = null;
        if (this.state.open) {
            const options = this.props.options.map(option =>
                    <SelectOption key={option.value} value={option.value} label={option.label}/>
                );
            content = <ul>{options}</ul>;
        } else {
            content = this.props.selected && this.props.selected.label;
        }

        return (
            <div className="Select" onClick={this.showMenu}>
                {content}
            </div>
        );
    }
}

module.exports = Select;