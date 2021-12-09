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
import StyleSheet from '../modules/stylesheet';
import View from './view';

const side = 'left';
const styles = StyleSheet.create({
  modal: {
    position: 'absolute',
    width: '100%',
  },
  container: {
    position: 'absolute',
    [side]: '25%',
    top: 0,
  },
});

/**
 * The Modal component is a basic way to present content above an enclosing view.
 * @noInheritDoc
 */
function Modal(props) {
  const {
    visible,
    transparent,
    children,
    onRequestClose,
    onShow,
    supportedOrientations,
    onOrientationChange,
  } = props;

  if (visible === false) {
    return <View />;
  }

  const containerStyles = {
    backgroundColor: transparent ? 'transparent' : 'white',
  };

  const newStyle = formatWebStyle(styles.modal);

  return (
    <div
      transparent={transparent}
      onRequestClose={onRequestClose}
      onShow={onShow}
      style={newStyle}
      supportedOrientations={supportedOrientations}
      onOrientationChange={onOrientationChange}
    >
      <View style={[styles.container, containerStyles]}>
        {children}
      </View>
    </div>
  );
}
Modal.defaultProps = {
  visible: true,
};

export default Modal;
