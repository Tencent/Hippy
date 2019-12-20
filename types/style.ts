// TODO: Style type definition finished yet.

interface Transform {
  perspective?: number;
  rotate?: string;
  rotateX?: string;
  rotateY?: string;
  rotateZ?: string;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  translateX?: number;
  translateY?: number;
  skewX?: string;
  skewY?: string;
}

interface BaseStyle {
  color?: string | number;
  colors?: string[] | number[];
  collapsable?: false;
  backgroundColor?: string | number;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  margin?: number;
  marginVertical?: number;
  marginHorizontal?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  padding?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  borderWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  position?: 'relative' | 'absolute';
  flexDirection?: 'row' | 'column';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'start' | 'center' | 'end' | 'flex-start' | 'flex-end' | 'left' | 'right' | 'normal' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch';
  alignItems?: 'stretch' | 'center' | 'flex-start' | 'flex-end' | 'baseline';
  alignSelf?: 'stretch' | 'center' | 'flex-start' | 'flex-end' | 'baseline';
  overflow?: 'hidden' | 'scroll';
  flex?: any;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: true;
  zIndex?: number;
  shadowColor?: string;
  shadowOffset?: string;
  shadowOpacity?: number;
  shadowRadius?: string;
  tintColor?: string | number;
  tintColors?: string[] | number[] | null;
  underlineColorAndroid?: string;
  transform?: Transform[];
}

interface Style extends BaseStyle {}

export default Style;
export {
  Style,
  Transform,
  BaseStyle,
};
