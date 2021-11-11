#pragma once

namespace hippy {
inline namespace dom {

constexpr const char* kAlignItems = "alignItems";
constexpr const char* kAilgnSelf = "alignSelf";
constexpr const char* kAlignContent = "alignContent";
constexpr const char* kFlex = "flex";
constexpr const char* kFlexBasis = "flexBasis";
constexpr const char* kFlexGrow = "flexGrow";
constexpr const char* kFlexShrink = "flexShrink";
constexpr const char* kFlexDirection = "flexDirection";
constexpr const char* kFlexWrap = "flexWrap";
constexpr const char* kWidth = "width";
constexpr const char* kHeight = "height";
constexpr const char* kMinWidth = "minWidth";
constexpr const char* kMinHeight = "minHeight";
constexpr const char* kMaxWidth = "maxWidth";
constexpr const char* kMaxHeight = "maxHeight";
constexpr const char* kTop = "top";
constexpr const char* kLeft = "left";
constexpr const char* kBottom = "bottom";
constexpr const char* kRight = "right";
constexpr const char* kJustifyContent = "justifyContent";
constexpr const char* kPosition = "position";
constexpr const char* kDisplay = "display";
constexpr const char* kOverflow = "overflow";
constexpr const char* kOpacity = "opacity";
constexpr const char* kZIndex = "zIndex";

constexpr const char* kMargin = "margin";
constexpr const char* kMarginAuto = "marginAuto";
constexpr const char* kMarginVertical = "marginVertical";
constexpr const char* kMarginHorizontal = "marginHorizontal";
constexpr const char* kMarginLeft = "marginLeft";
constexpr const char* kMarginStart = "marginStart";
constexpr const char* kMarginTop = "marginTop";
constexpr const char* kMarginRight = "marginRight";
constexpr const char* kMarginEnd = "marginEnd";
constexpr const char* kMarginBottom = "marginBottom";

constexpr const char* kPadding = "padding";
constexpr const char* kPaddingVertical = "paddingVertical";
constexpr const char* kPaddingHorizontal = "paddingHorizontal";
constexpr const char* kPaddingLeft = "paddingLeft";
constexpr const char* kPaddingTop = "paddingTop";
constexpr const char* kPaddingRight = "paddingRight";
constexpr const char* kPaddingBottom = "paddingBottom";

constexpr const char* kStyle = "style";

constexpr const char* kBackgroundColor = "backgroundColor";
constexpr const char* kColor = "color";

constexpr const char* kText = "text";
constexpr const char* kDefaultValue = "defaultValue";
constexpr const char* kPlaceholder = "placeholder";
constexpr const char* kPlaceholderTextColor = "placeholderTextColor";
constexpr const char* kEditable = "editable";
constexpr const char* kFontSize = "fontSize";
constexpr const char* kReturnKeyType = "returnKeyType";
constexpr const char* kLetterSpacing = "letterSpacing";
constexpr const char* kFontWeight = "fontWeight";
constexpr const char* kFontStyle = "fontStyle";
constexpr const char* kFontFamily = "fontFamily";
constexpr const char* kLineHeight = "lineHeight";
constexpr const char* kTextAlign = "textAlign";
constexpr const char* kMaxLength = "maxLength";
constexpr const char* kOnBlur = "onBlur";
constexpr const char* kOnChangeText = "onChangeText";
constexpr const char* kOnKeyboardWillShow = "onKeyboardWillShow";
constexpr const char* kOnEndEditing = "onEndEditing";
constexpr const char* kOnSelectionChange = "onSelectionChange";
constexpr const char* kNumberOfLines = "numberOfLines";
constexpr const char* kMultiline = "multiline";
constexpr const char* kKeyboardType = "keyboardType";
constexpr const char* kTextDecorationLine = "textDecorationLine";
constexpr const char* kTextShadowOffset = "textShadowOffset";
constexpr const char* kTextShadowColor = "textShadowColor";
constexpr const char* kTextShadowRadius = "textShadowRadius";
constexpr const char* kBlurTextInput = "blurTextInput";
constexpr const char* kClear = "clear";
constexpr const char* kFocusTextInput = "focusTextInput";
constexpr const char* kGetValue = "getValue";
constexpr const char* kHideInputMethod = "hideInputMethod";
constexpr const char* kShowInputMethod = "showInputMethod";

constexpr const char* kContentContainerStyle = "contentContainerStyle";
constexpr const char* kOnMomentumScrollBegin = "onMomentumScrollBegin";
constexpr const char* kON_MOMENTUM_SCROLL_END = "onMomentumScrollEnd";
constexpr const char* kOnScroll = "onScroll";
constexpr const char* kOnScrollBeginDrag = "onScrollBeginDrag";
constexpr const char* kOnScrollEndDrag = "onScrollEndDrag";
constexpr const char* kOnAppear = "onAppear";
constexpr const char* kOnDisappear = "onDisappear";
constexpr const char* kOnWillAppear = "onWillAppear";
constexpr const char* kOnWillDisappear = "onWillDisappear";

constexpr const char* kScrollEventThrottle = "scrollEventThrottle";
constexpr const char* kScrollIndicatorInsets = "scrollIndicatorInsets";
constexpr const char* kPagingEnabled = "pagingEnabled";
constexpr const char* kScrollEnabled = "scrollEnabled";
constexpr const char* kHorizontal = "horizontal";
constexpr const char* kShowsHorizontalScrollIndicator = "showsHorizontalScrollIndicator";
constexpr const char* kShowsVerticalScrollIndicator = "showsVerticalScrollIndicator";

constexpr const char* knEndReached = "onEndReached";
constexpr const char* kInitialContentOffset = "initialContentOffset";
constexpr const char* kInitialListReady = "initialListReady";
constexpr const char* kType = "type";
constexpr const char* kSticky = "sticky";

constexpr const char* kOnRefresh = "onRefresh";

constexpr const char* kOnLayout = "onLayout";
constexpr const char* kOnClick = "onClick";
constexpr const char* kOnLongClick = "onLongClick";
constexpr const char* kOnTouchStart = "onTouchStart";
constexpr const char* kOnTouchMove = "onTouchMove";
constexpr const char* kOnTouchEnd = "onTouchEnd";
constexpr const char* kOnTouchCancel = "onTouchCancel";
constexpr const char* kOnAttachedToWindow = "onAttachedToWindow";
constexpr const char* kOnDetachedFromWindow = "onDetachedFromWindow";
constexpr const char* kOnShow = "onShow";
constexpr const char* kOnDismiss = "onDismiss";
constexpr const char* kOnRequestClose = "onRequestClose";
constexpr const char* kOnOrientationChange = "onOrientationChange";

constexpr const char* kBorderWidth = "borderWidth";
constexpr const char* kBorderLeftWidth = "borderLeftWidth";
constexpr const char* kBorderTopWidth = "borderTopWidth";
constexpr const char* kBorderRightWidth = "borderRightWidth";
constexpr const char* kBorderBottomWidth = "borderBottomWidth";

constexpr const char* kBorderColor = "borderColor";
constexpr const char* kBorderLeftColor = "borderLeftColor";
constexpr const char* kBorderTopColor = "borderTopColor";
constexpr const char* kBorderRightColor = "borderRightColor";
constexpr const char* kBorderBottomColor = "borderBottomColor";

constexpr const char* kBorderRadius = "borderRadius";
constexpr const char* kBorderTopLeftRadius = "borderTopLeftRadius";
constexpr const char* kBorderTopRightRadius = "borderTopRightRadius";
constexpr const char* kBorderBottomLeftRadius = "borderBottomLeftRadius";
constexpr const char* kBorderBottomRightRadius = "borderBottomRightRadius";

constexpr const char* kShadowColor = "shadowColor";
constexpr const char* kShadowOffset = "shadowOffset";
constexpr const char* kShadowOffsetX = "shadowOffsetX";
constexpr const char* kShadowOffsetY = "shadowOffsetY";
constexpr const char* kShadowOpacity = "shadowOpacity";
constexpr const char* kShadowRadius = "shadowRadius";
constexpr const char* kShadowSpread = "shadowSpread";

constexpr const char* kIMAGEDefaultSource = "defaultSource";
constexpr const char* kImageSrc = "src";
constexpr const char* kImageSource = "source";
constexpr const char* kImageUri = "uri";
constexpr const char* kImageResizeMode = "resizeMode";
constexpr const char* kImageOnLoad = "onLoad";
constexpr const char* kImageOnLoadStart = "onLoadStart";
constexpr const char* kImageOnLoadEnd = "onLoadEnd";
constexpr const char* kImageOnError = "onError";
constexpr const char* kImageOnProgress = "onProgress";

constexpr const char* kInitialPage = "initialPage";
constexpr const char* kPageMargin = "pageMargin";
constexpr const char* kOnPageScroll = "onPageScroll";
constexpr const char* kOnPageSelected = "onPageSelected";
constexpr const char* kOnPageScrollStateChanged = "onPageScrollStateChanged";
constexpr const char* kDirection = "direction";
constexpr const char* kVisible = "visible";
constexpr const char* kHidden = "hidden";
constexpr const char* kVertical = "vertical";

constexpr const char* kModal_ImmersionStatusBar = "immersionStatusBar";
constexpr const char* kModal_OnRequestClose = "onRequestClose";

constexpr const char* kNodeType = "nodeType";
constexpr const char* kNodeId = "id";
constexpr const char* kBorderLeft = "borderLeft";
constexpr const char* kBorderTop = "borderTop";
constexpr const char* kBorderRight = "borderRight";
constexpr const char* kBorderBottom = "borderBottom";
constexpr const char* kTotalProps = "total_props";
constexpr const char* kFlexNodeStyle = "flex_node_style_";
constexpr const char* kBounds = "bounds";
constexpr const char* kChild = "child";

constexpr const char* kHpdDirection = "hpdDirection";
constexpr const char* kBorder = "border";
constexpr const char* kBgColor = "bgColor";

constexpr const char* kTagNameView = "View";

}  // namespace dom
}  // namespace hippy
