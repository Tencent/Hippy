/**
 * All of component implemented by Native.
 */

const View = Symbol.for('View');
const Image = Symbol.for('Image');
const ListView = Symbol.for('ListView');
const ListViewItem = Symbol.for('ListViewItem');
const Text = Symbol.for('Text');
const TextInput = Symbol.for('TextInput');
const WebView = Symbol.for('WebView');
const VideoPlayer = Symbol.for('VideoPlayer');

const NATIVE_COMPONENT_NAME_MAP = {
  [View]: 'View',
  [Image]: 'Image',
  [ListView]: 'ListView',
  [ListViewItem]: 'ListViewItem',
  [Text]: 'Text',
  [TextInput]: 'TextInput',
  [WebView]: 'WebView',
  [VideoPlayer]: 'VideoPlayer',
};

export default NATIVE_COMPONENT_NAME_MAP;
export {
  View,
  Image,
  ListView,
  ListViewItem,
  Text,
  TextInput,
  WebView,
  VideoPlayer,
};
