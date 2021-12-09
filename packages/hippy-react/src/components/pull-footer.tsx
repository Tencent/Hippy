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
import { PullingEvent } from '@localTypes/event';
import { Fiber } from 'react-reconciler';
import { LayoutableProps } from '../types';
import { callUIFunction } from '../modules/ui-manager-module';
import Element from '../dom/element-node';

interface PullFooterProps extends LayoutableProps {
  /**
   * Keep content displaying after onFooterReleased trigged.
   */
  sticky?: boolean;

  /**
   * Trigger when release the finger after pulling distance larger than the content height
   */
  onFooterReleased?(): void;

  /**
   * Trigger when pulling
   *
   * @param {Object} evt - Event data
   * @param {number} evt.contentOffset - Dragging distance
   */
  onFooterPulling?(evt: PullingEvent): void;
}

class PullFooter extends React.Component<PullFooterProps, {}> {
  private instance: Element | Fiber | HTMLDivElement | null = null;

  /**
  * @ignore
  */
  static defaultProps = {
    sticky: true,
  };

  /**
   * Expand the PullView and display the content
   */
  expandPullFooter() {
    callUIFunction(this.instance as Element, 'expandPullFooter', []);
  }

  /**
   * Collapse the PullView and hide the content
   */
  collapsePullFooter() {
    callUIFunction(this.instance as Element, 'collapsePullFooter', []);
  }

  render() {
    const { children, ...nativeProps } = this.props;
    return (
      <div
        nativeName="PullFooterView"
        ref={(ref) => {
          this.instance = ref;
        }}
        {...nativeProps}
      >
        { children }
      </div>
    );
  }
}

export default PullFooter;
