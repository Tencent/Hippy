/**
 * All of component implemented by Native.
 */

const View = Symbol('View');
const Image = Symbol('Image');
const ListView = Symbol('ListView');
const ListViewItem = Symbol('ListViewItem');
const Text = Symbol('Text');
const TextInput = Symbol('TextInput');
const WebView = Symbol('WebView');
const VideoPlayer = Symbol('VideoPlayer');

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
