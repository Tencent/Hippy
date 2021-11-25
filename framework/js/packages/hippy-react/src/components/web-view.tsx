import React from 'react';

interface LoadEvent {
  url: string;
}

interface WebViewProps {
  /**
   * WebView loads url
   */
  source: {
    uri: string;
  };

  /**
   * Custom user agent.
   */
  userAgent?: string;

  /**
   * Request method
   */
  method?: 'get' | 'post';

  /**
   * Invoke when web page loaded.
   *
   * @param {Object} evt - Load event data
   * @param {string} evt.url - Web page url
   */
  onLoad?(evt: LoadEvent): void;

  /**
   * Invoke when web page start to load.
   *
   * @param {Object} evt - Load event data
   * @param {string} evt.url - Web page url
   */
  onLoadStart?(evt: LoadEvent): void;

  /**
   * Invoke when web page load completed
   *
   * @param {Object} evt - Load event data
   * @param {string} evt.url - Web page url
   */
  onLoadEnd(evt: LoadEvent): void;
}

/**
 * System built-in WebView
 *
 * For iOS it uses WKWebView, for Android it uses Webkit built-in.
 */
function WebView(props: WebViewProps) {
  return (
    // @ts-ignore
    <iframe title="hippy" nativeName="WebView" {...props} />
  );
}

export default WebView;
