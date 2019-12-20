/* eslint-disable class-methods-use-this */

import React from 'react';
import { formatWebStyle } from '../adapters/transfer';

/**
 * Simply router component for switch in multiple Hippy page.
 * @noInheritDoc
 */
class Navigator extends React.Component {
  pop() {
    // TODO
  }

  push() {
    // TODO
  }

  render() {
    const { style } = this.props;
    const newProps = Object.assign({}, this.props, {
      style: formatWebStyle(style),
    });
    return (
      <div {...newProps} />
    );
  }
}

export default Navigator;
