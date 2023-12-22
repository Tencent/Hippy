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

/* eslint-disable no-underscore-dangle */

import React from 'react';
import * as StyleSheet from '../modules/stylesheet';
import { HippyEventListener } from '../event';
import { Device } from '../native';

type ModalOrientation = 'portrait' | 'portrait-upside-down' | 'landscape' | 'landscape-left' | 'landscape-right';

interface ModalProps {
  /**
   * Show or hide
   *
   * Default false
   */
  visible: boolean;

  /**
   * Primary key
   * > iOS only
   */
  primaryKey: string;

  /**
   * Background is transparent or not
   * Default: true
   */
  transparent?: boolean;

  /**
   * Enable animation to popup or hide
   *
   * Default: true
   *
   * > Deprecated, use animationType to instance of
   */
  animated?: boolean;

  /**
   * Be text color in statusbar dark theme.
   * Default: false
   */
  darkStatusBarText?: boolean;

  /**
   * Make the Modal content be under of statusbar.
   * > Android Only
   *
   * Default: false
   */
  immersionStatusBar?: boolean;

  /**
   * Hide statusbar texts when Modal is showing
   *
   * Default: false
   */
  autoHideStatusBar?: boolean;

  /**
   * Hide navigation bar when Modal is showing
   *
   * Default: false
   */
  autoHideNavigationBar?: boolean;

  /**
   * The animation effect when toggle
   *
   * Default: 'slide'
   */
  animationType?: 'none' | 'slide' | 'fade' | 'slide_fade';

  /**
   * Modal supports orientations
   */
  supportedOrientations?: ModalOrientation[];

  style?: HippyTypes.Style;

  /**
   * Trigger when hardware button pressed
   * > Android Only
   */
  onRequestClose?: () => void;

  /**
   * Trigger when the Modal will show
   */
  onShow?: () => void;

  /**
   * Trigger when the Modal will hide
   */
  onDismiss?: () => void;

  /**
   * Trigger when the device orientation changed.
   */
  onOrientationChange?: () => void;
}

const styles = StyleSheet.create({
  modal: {
    position: 'absolute',
    collapsable: false,
  },
});

/**
 * The Modal component is a basic way to present content above an enclosing view.
 * @noInheritDoc
 */
class Modal extends React.Component<ModalProps, {}> {
  private static defaultProps = {
    visible: true,
  };
  private eventSubscription: null | HippyEventListener;
  /**
   * @ignore
   */
  public constructor(props: ModalProps) {
    super(props);
    this.eventSubscription = null;
  }

  /**
   * @ignore
   */
  public componentDidMount() {
    if (Device.platform.OS === 'ios') {
      this.eventSubscription = new HippyEventListener('modalDismissed');
      this.eventSubscription.addCallback((params: any) => {
        const { primaryKey, onDismiss } = this.props;
        if (params.primaryKey === primaryKey && typeof onDismiss === 'function') {
          onDismiss();
        }
      });
    }
  }

  /**
   * @ignore
   */
  public componentWillUnmount() {
    if (Device.platform.OS === 'ios') {
      if (this.eventSubscription) {
        this.eventSubscription.unregister();
      }
    }
  }

  /**
   * @ignore
   */
  public render() {
    const {
      children,
      visible,
      transparent,
      animated,
    } = this.props;
    let {
      animationType,
    } = this.props;
    if (visible === false) {
      return null;
    }
    const containerStyles = {
      backgroundColor: transparent ? 'transparent' : 'white',
    };
    if (!animationType) {
      // manually setting default prop here to keep support for the deprecated 'animated' prop
      animationType = 'none';
      if (animated) {
        animationType = 'slide';
      }
    }

    return (
      <div
        nativeName="Modal"
        animationType={animationType}
        transparent={transparent}
        // @ts-ignore
        style={[styles.modal, containerStyles]}
        {...this.props}
      >
        {children}
      </div>
    );
  }
}

export default Modal;
