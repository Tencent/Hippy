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

import React, { CSSProperties, ReactElement } from 'react';
import { Fiber } from '@hippy/react-reconciler';
import { callUIFunction } from '../modules/ui-manager-module';
import Element from '../dom/element-node';

export interface RefreshWrapperProps {
  bounceTime?: number;
  horizontal?: boolean;
  onRefresh?: () => void;
  getRefresh?: () => ReactElement;
}

/**
 * Simply to implement the drag down to refresh feature.
 *
 * @deprecated
 * @noInheritDoc
 */
export class RefreshWrapper extends React.Component<RefreshWrapperProps, {}> {
  private instance: Element | Fiber | HTMLDivElement | null = null;
  private refreshComplected: () => void;

  public constructor(props: RefreshWrapperProps) {
    super(props);
    this.refreshComplected = this.refreshCompleted.bind(this);
  }

  /**
   * Call native for start refresh.
   */
  public startRefresh() {
    callUIFunction(this.instance as Element, 'startRefresh', null);
  }

  /**
   * Call native that data is refreshed
   */
  public refreshCompleted() {
    callUIFunction(this.instance as Element, 'refreshComplected', null);
  }

  /**
   * @ignore
   */
  public render() {
    const { children, ...nativeProps } = this.props;
    // Set the style according to the horizontal prop
    const style: CSSProperties = nativeProps.horizontal
    ? { top: 0, bottom: 0, position: 'absolute' }
    : { left: 0, right: 0, position: 'absolute' };
    return (
      <div nativeName="RefreshWrapper" ref={(ref) => {
        this.instance = ref;
      }} {...nativeProps}>
        <div nativeName="RefreshWrapperItemView" style={style}>
          { this.getRefresh() }
        </div>
        { children }
      </div>
    );
  }

  private getRefresh(): ReactElement | null {
    const { getRefresh } = this.props;
    if (typeof getRefresh === 'function') {
      return getRefresh() || null;
    }
    return null;
  }
}

export default RefreshWrapper;
