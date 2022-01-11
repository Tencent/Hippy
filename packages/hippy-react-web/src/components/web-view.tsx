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

import React from 'react';
import { formatWebStyle } from '../adapters/transfer';

/**
 * System built-in WebView
 *
 * For iOS it uses WKWebView, for Android it uses Webkit built-in.
 */
function WebView(props) {
  const { source, style, ...otherProps } = props;
  const src = source.uri;
  const newStyle = formatWebStyle(style);
  return (
    <iframe title="WebView" src={src} style={newStyle} {...otherProps} />
  );
}

export default WebView;
