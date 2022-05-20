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
import { canUseDOM } from '../utils';
import StyleSheet from '../modules/stylesheet';
import { formatWebStyle } from '../adapters/transfer';
import { View, ViewProps } from './view';


const cssFunction = (): 'constant' | 'env' => {
  if (canUseDOM && window?.CSS?.supports('top: constants(safe-area-inset-top)')) {
    return 'constant';
  }
  return 'env';
};

const styles = StyleSheet.create({
  root: {
    paddingTop: `${cssFunction}(safe-area-inset-top)`,
    paddingRight: `${cssFunction}(safe-area-inset-right)`,
    paddingBottom: `${cssFunction}(safe-area-inset-bottom)`,
    paddingLeft: `${cssFunction}(safe-area-inset-left)`,
  },
});

const SafeAreaView: React.FC<ViewProps> = React.forwardRef((props, ref) => {
  const { style = {}, children, ...rest } = props;
  let newStyle = StyleSheet.compose(style, styles.root);
  newStyle = formatWebStyle(newStyle);
  return (<View {...rest} ref={ref} style={newStyle}>{ children}</View>);
});
SafeAreaView.displayName = 'SafeAreaView';

export default SafeAreaView;
