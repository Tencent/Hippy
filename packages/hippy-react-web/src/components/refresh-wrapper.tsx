/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import { formatWebStyle } from '../adapters/transfer';

/**
 * Simply to implement the drag down to refresh feature.
 * @noInheritDoc
 */
function RefreshWrapper(props) {
  const { style, displayInWeb = false } = props;
  const newProps = { ...props, style: formatWebStyle(style) };
  if (!displayInWeb) {
    return <div nativeName="RefreshWrapper" />;
  }
  return (
    <div {...newProps} />
  );
}

export default RefreshWrapper;
