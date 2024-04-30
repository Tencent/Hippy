/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export enum EllipsizeMode {
  HEAD = 'head',
  clip = 'clip',
  MIDDLE = 'middle',
  TAIL = 'tail'
}
export enum ImageResizeMode {
  COVER = 'cover',
  CONTAIN = 'contain',
  STRETCH = 'stretch',
  REPEAT = 'repeat',
  CENTER = 'center',
}
export enum NodeProps {
  ELLIPSIZE_MODE = 'ellipsizeMode',
  TINY_COLOR = 'tinyColor',
  ON_LOAD = 'onLoad',
  ON_LOAD_START = 'onLoadStart',
  ON_LOAD_END = 'onLoadEnd',
  RESIZE_MODE = 'resizeMode',
  SOURCE = 'source',
  DEFAULT_SOURCE = 'defaultSource',
  ON_ERROR = 'onError',
  ON_PROGRESS = 'onProgress',
  CAP_INSETS = 'capInsets',
  HORIZONTAL = 'horizontal',
  STYLE = 'style',
  METHOD = 'method',
  USER_AGENT = 'userAgent',
  INITIAL_LIST_SIZE = 'initialListSize',
  INITIAL_CONTENT_OFFSET = 'initialContentOffset',
  BOUNCES = 'bounces',
  CONTENT_CONTAINER_STYLE = 'contentContainerStyle',
  SCROLL_INDICATOR_INSETS= 'scrollIndicatorInsets',
  OVER_SCROLL_ENABLED = 'overScrollEnabled',
  PRELOAD_ITEM_NUMBER = 'preloadItemNumber',
  ON_APPEAR = 'onAppear',
  ON_DISAPPEAR = 'onDisappear',
  ON_WILL_APPEAR = 'onWillAppear',
  ON_WILL_DISAPPEAR = 'onWillDisappear',
  ON_END_REACHED = 'onEndReached',
  ON_LOAD_MORE = 'onLoadMore',
  ON_MOMENTUM_SCROLL_BEGIN = 'onMomentumScrollBegin',
  ON_MOMENTUM_SCROLL_END = 'onMomentumScrollEnd',
  ON_SCROLL = 'onScroll',
  ON_SCROLL_BEGIN_DRAG = 'onScrollBeginDrag',
  ON_SCROLL_END_DRAG = 'onScrollEndDrag',
  ROW_SHOULD_STICKY = 'rowShouldSticky',
  STICKY = 'sticky',
  ON_HEADER_PULLING = 'onHeaderPulling',
  ON_HEADER_RELEASED = 'onHeaderReleased',
  SCROLL_EVENT_THROTTLE = 'scrollEventThrottle',
  INITIAL_LIST_READY = 'initialListReady',
  SCROLL_TO_CONTENT_OFFSET = 'scrollToContentOffset',
  SCROLL_TO_INDEX = 'scrollToIndex',
  COLLAPSE_PULL_HEADER = 'collapsePullHeader',
  ANIMATED = 'animated',
  ANIMATION_TYPE = 'animationType',
  SUPPORTED_ORIENTATIONS = 'supportedOrientations',
  IMMERSION_STATUS_BAR = 'immersionStatusBar',
  DARK_STATUS_BAR_TEXT = 'darkStatusBarText',
  ON_SHOW = 'onShow',
  ON_ORIENTATION_CHANGE = 'onOrientationChange',
  ON_REQUEST_CLOSE = 'onRequestClose',
  TRANSPARENT = 'transparent',
  VISIBLE = 'visible',
  ON_REFRESH = 'onRefresh',
  GET_REFRESH = 'getRefresh',
  BOUNCE_TIME = 'bounceTime',
  REFRESH_COMPLETED = 'refreshComplected',
  START_REFRESH = 'startRefresh',
  PAGING_ENABLED = 'pagingEnabled',
  SCROLL_ENABLED = 'scrollEnabled',
  SHOW_HORIZONTAL_SCROLL_INDICATOR = 'showsHorizontalScrollIndicator',
  SHOW_VERTICAL_SCROLL_INDICATOR = 'showsVerticalScrollIndicator',
  SHOW_SCROLL_INDICATOR = 'showScrollIndicator',
  DEFAULT_VALUE = 'defaultValue',
  EDITABLE = 'editable',
  KEY_BOARD_TYPE = 'keyboardType',
  MAX_LENGTH = 'maxLength',
  MULTILINE = 'multiline',
  NUMBER_OF_LINES = 'numberOfLines',
  ON_BLUR = 'onBlur',
  ON_CHANGE_TEXT = 'onChangeText',
  ON_KEYBOARD_WILL_SHOW = 'onKeyboardWillShow',
  ON_END_EDITING = 'onEndEditing',
  ON_SELECTION_CHANGE = 'onSelectionChange',
  PLACEHOLDER = 'placeholder',
  PLACEHOLDER_TEXT_COLOR = 'placeholderTextColor',
  PLACEHOLDER_TEXT_COLORS = 'placeholderTextColors',
  RETURN_KEY_TYPE = 'returnKeyType',
  VALUE = 'value',
  AUTO_FOCUS = 'autoFocus',
  BLUR_TEXT_INPUT = 'blurTextInput',
  CLEAR = 'clear',
  FOCUS_TEXT_INPUT = 'focusTextInput',
  GET_VALUE = 'getValue',
  HIDE_INPUT_METHOD = 'hideInputMethod',
  SET_VALUE = 'setValue',
  SHOW_INPUT_METHOD = 'showInputMethod',
  ON_LAYOUT = 'onLayout',
  ACCESSIBLE = 'accessible',
  ACCESSIBILITY_LABEL = 'accessibilityLabel',
  OPACITY = 'opacity',
  OVERFLOW = 'overflow',
  ON_ATTACHED_TO_WINDOW = 'onAttachedToWindow',
  ON_TOUCH_DOWN = 'onTouchDown',
  ON_TOUCH_MOVE = 'onTouchMove',
  ON_TOUCH_END = 'onTouchEnd',
  ON_TOUCH_CANCEL = 'onTouchCancel',
  HIPPY_VIEW_PAGER_ITEM_PROPS = 'hippyViewPagerItemProps',
  INITIAL_PAGE = 'initialPage',
  ON_PAGE_SELECTED = 'onPageSelected',
  ON_PAGE_SCROLL = 'onPageScroll',
  ON_PAGE_SCROLL_STATE_CHANGED = 'onPageScrollStateChanged',
  DIRECTION = 'direction',
  SET_PAGE = 'setPage',
  SET_PAGE_WITHOUT_ANIMATION = 'setPageWithoutAnimation',
  ON_CLICK = 'onClick',
  ON_LONG_CLICK = 'onLongClick',
}
export enum KeyboardType {
  default = 'default',
  numeric = 'numeric',
  password = 'password',
  email = 'email',
  phonePad = 'phone-pad',
}
export enum ReturnKeyType {
  done = 'done',
  go = 'go',
  next = 'next',
  search = 'search',
  send = 'send',
}
export enum ModalAnimationType {
  Slide = 'slide',
  Fade = 'fade',
  SlideFade = 'slide_fade',
  None = 'none',
}
export enum ModalOrientations {
  Portrait = 'portrait',
  PortraitUpsideDown = 'portrait-upside-down',
  Landscape = 'landscape',
  LandscapeLeft = 'landscape-left',
  LandscapeRight = 'landscape-right',
}
export enum SCROLL_STATE {
  IDLE = 'idle',
  DRAG = 'dragging',
  SETTL = 'settling',
}
export const STYLE_MARGIN_V = 'marginVertical';
export const STYLE_MARGIN_H = 'marginHorizontal';
export const STYLE_PADDING_V = 'paddingVertical';
export const STYLE_PADDING_H = 'paddingHorizontal';

export * from './exports';
export * from './hippy-internal-types';
