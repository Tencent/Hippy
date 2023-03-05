/* eslint-disable complexity */
import type {
  SsrCommonParams,
  SsrNodeProps,
} from '@tencent/hippy-vue-next-shared';

/**
 * 根据客户端请求参数返回服务端渲染所需的屏幕尺寸等数据
 *
 * @param hippyContext - 请求上下文数据
 */
export function getSsrDimensions(hippyContext: SsrCommonParams): SsrNodeProps {
  const { device } = hippyContext;
  const { screen } = device;
  let { statusBarHeight } = screen;
  if (device.platform.OS === 'android') {
    statusBarHeight /= screen.scale;
  }
  return {
    window: device.window,
    screen: {
      ...screen,
      statusBarHeight,
    },
  };
}

/**
 * 获取模版中的 tag 所对应的 hippy 在 native 中的 view 名称
 *
 * @param tag - html 标签或 Vue 组件名称
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
    // Native内置组件，与View组件属性方法基本一致，仅名称不同
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
