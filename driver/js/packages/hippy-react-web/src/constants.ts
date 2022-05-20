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

export const UNSUPPORTED_PROPS_MAP = {
  image: ['capInsets', 'onProgress', 'tintColor'],
  listview: ['bounces', 'overScrollEnabled', 'onWillAppear', 'onWillDisappear', 'onMomentumScrollBegin', 'onMomentumScrollEnd', 'onScrollBeginDrag', 'onScrollEndDrag', 'preloadItemNumber', 'editable', 'delText', 'onDelete', 'initialListSize'],
  modal: ['supportedOrientations', 'immersionStatusBar', 'onOrientationChange', 'primaryKey'],
  refreshWrapper: ['bounceTime'],
  scrollview: ['bounces', 'onScrollBeginDrag', 'onScrollEndDrag', 'pagingEnabled', 'showsHorizontalScrollIndicator', 'showsVerticalScrollIndicator'],
  textinput: ['onKeyboardWillShow', 'onSelectionChange', 'returnKeyType', 'placeholderTextColor', 'underlineColorAndroid'],
  viewpager: ['onPageScroll', 'onPageScrollStateChanged'],
  webview: ['userAgent', 'method', 'onLoad', 'onLoadStart'],
  view: ['nativeBackgroundAndroid'],
};
