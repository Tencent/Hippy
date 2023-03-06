/* eslint-disable complexity */

/**
 * get hippy native view's name, map with html tag
 *
 * @param tag - html tag or Vue component name
 */
export function getHippyTagName(tag: string): string {
  // Hippy 官方内置支持的 View
  const NATIVE_COMPONENT_MAP = {
    View: 'View',
    Image: 'Image',
    ListView: 'ListView',
    ListViewItem: 'ListViewItem',
    Text: 'Text',
    TextInput: 'TextInput',
    WebView: 'WebView',
    VideoPlayer: 'VideoPlayer',
    // native inner view, just name different with View
    ScrollView: 'ScrollView',
    Swiper: 'ViewPager',
    SwiperSlide: 'ViewPagerItem',
    PullHeaderView: 'PullHeaderView',
    PullFooterView: 'PullFooterView',
  };
  switch (tag) {
    case 'div':
    case 'button':
    case 'form':
      return NATIVE_COMPONENT_MAP.View;
    case 'img':
      return NATIVE_COMPONENT_MAP.Image;
    case 'ul':
      return NATIVE_COMPONENT_MAP.ListView;
    case 'li':
      return NATIVE_COMPONENT_MAP.ListViewItem;
    case 'span':
    case 'label':
    case 'p':
    case 'a':
      return NATIVE_COMPONENT_MAP.Text;
    case 'textarea':
    case 'input':
      return NATIVE_COMPONENT_MAP.TextInput;
    case 'iframe':
      return NATIVE_COMPONENT_MAP.WebView;
    case 'swiper':
      return NATIVE_COMPONENT_MAP.Swiper;
    case 'swiper-slide':
      return NATIVE_COMPONENT_MAP.SwiperSlide;
    case 'pull-header':
      return NATIVE_COMPONENT_MAP.PullHeaderView;
    case 'pull-footer':
      return NATIVE_COMPONENT_MAP.PullFooterView;
    default:
      return tag;
  }
}
