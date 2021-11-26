/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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
  flexDirection?: 'row' | 'column' | 'row-reverse';
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
  collapse?: boolean,
}

interface Style extends BaseStyle {
  [props: string]: any
}

export default Style;
export {
  Style,
  Transform,
  BaseStyle,
};
