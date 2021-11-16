import React from 'react';
import { formatWebStyle } from '../adapters/transfer';

/**
 * System built-in WebView
 *
 * For iOS it uses WKWebView, for Android it uses Webkit built-in.
 */
function WebView(props) {
  const { source, style, ...otherProps } = props;
  const src = source.uri;
  const newStyle = formatWebStyle(style);
  return (
    <iframe title="WebView" src={src} style={newStyle} {...otherProps} />
  );
}

export default WebView;
