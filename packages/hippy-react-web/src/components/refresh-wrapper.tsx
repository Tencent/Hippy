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

/* eslint-disable react/prefer-stateless-function */

import React, { useState } from 'react';
import MPullToRefresh from 'rmc-pull-to-refresh';
import { formatWebStyle } from '../adapters/transfer';
import { isFunc } from '../utils';

export interface RefreshWrapperProps {
  ref?: any;
  style?: HippyTypes.Style;
  getRefresh?: () => null | Element;
  onRefresh?: () => void;
  bounceTime?: number;
}

/**
 * Simply to implement the drag down to refresh feature.
 * @noInheritDoc
 */
const RefreshWrapper: React.FC<RefreshWrapperProps> = React.forwardRef((props, ref) => {
  const { getRefresh, style, children, onRefresh } = props;

  const newProps = { ...props, style: formatWebStyle(style) };
  const wrapperRef = React.useRef(null);
  const pullHeaderRef = React.useRef<null | HTMLDivElement>(null);
  const [refreshing, setRefreshing] = useState(false);

  const pullHeaderHeight = React.useRef(0);
  const PullHeader = React.useCallback(() => {
    const headerVisibility = React.useRef<'hidden' | 'visible'>('hidden');
    if (!isFunc(getRefresh) || !getRefresh) {
      return null;
    }
    React.useEffect(() => {
      if (pullHeaderRef.current) {
        const headerRect = pullHeaderRef.current.getBoundingClientRect();
        pullHeaderHeight.current = headerRect.height;
        if (pullHeaderHeight.current > 0) {
          headerVisibility.current = 'visible';
        }
      }
    }, [pullHeaderRef]);
    return (
      <div ref={pullHeaderRef} style={{ visibility: headerVisibility.current, marginTop: `-${pullHeaderHeight.current}px` }}>
        {getRefresh()}
      </div>
    );
  }, [props.getRefresh]);

  const refreshComplected = () => {
    setRefreshing(false);
  };

  const startRefresh = () => {
    setRefreshing(true);
  };

  React.useImperativeHandle(ref, () => ({
    refreshComplected,
    startRefresh,
  }));

  const pullIndicator = {
    get activate() {
      return <PullHeader />;
    },
    get deactivate() {
      return <PullHeader />;
    },
    get release() {
      return <PullHeader />;
    },
    get finish() {
      return <PullHeader />;
    },
  };

  const handleOnRefresh = () => {
    if (onRefresh && isFunc(onRefresh)) {
      onRefresh();
      setRefreshing(true);
    }
  };

  // @ts-ignore
  const newChildren = React.cloneElement(children, {
    pullToRefresh: <MPullToRefresh
      direction='down'
      refreshing={refreshing}
      onRefresh={handleOnRefresh}
      indicator={pullIndicator}
      distanceToRefresh={pullHeaderHeight.current || 100}
    />,
  });

  // delete unsupported props
  delete newProps.bounceTime;
  delete newProps.getRefresh;
  delete newProps.onRefresh;

  return (
    <div {...newProps} ref={wrapperRef}>
      { newChildren }
    </div>
  );
});
RefreshWrapper.displayName = 'RefreshWrapper';

export default RefreshWrapper;
