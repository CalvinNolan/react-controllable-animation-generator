import React, { Component } from 'react';
import PropTypes from 'prop-types';

class SidebarItem extends Component {
  render() {
    return (
      <div className={`sidebarItem ${this.props.className}`} onClick={ this.props.onClick }>
        <h2>{ this.props.title }</h2>
      </div>
    );
  }
}

SidebarItem.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string
}

SidebarItem.defaultProps = {
  className: ''
}

export default SidebarItem;
