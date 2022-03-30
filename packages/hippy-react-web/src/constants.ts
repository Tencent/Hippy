export const UNSUPPORTED_PROPS_MAP = {
  image: ['capInsets', 'onProgress'],
  listview: ['bounces', 'overScrollEnabled', 'onWillAppear', 'onWillDisappear', 'onMomentumScrollBegin', 'onMomentumScrollEnd', 'onScrollBeginDrag', 'onScrollEndDrag', 'preloadItemNumber', 'editable', 'delText', 'onDelete'],
  modal: ['supportedOrientations', 'immersionStatusBar', 'onOrientationChange', 'primaryKey'],
  refreshWrapper: ['bounceTime'],
  scrollview: ['bounces', 'onScrollBeginDrag', 'onScrollEndDrag', 'pagingEnabled', 'showsHorizontalScrollIndicator', 'showsVerticalScrollIndicator'],
  textinput: ['onKeyboardWillShow', 'onSelectionChange', 'returnKeyType', 'placeholderTextColor', 'underlineColorAndroid'],
  viewpager: ['onPageScroll', 'onPageScrollStateChanged'],
  webview: ['userAgent', 'method', 'onLoad', 'onLoadStart'],
  view: ['nativeBackgroundAndroid'],
};
