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

import React, { ReactElement, ReactNode } from 'react';
import { callUIFunction } from '../modules/ui-manager-module';
import Element from '../dom/element-node';

interface PageSelectedEvent {
  position: number;
}
interface PageScrollEvent {
  position: number;
  offset: number;
}

type PageScrollState = 'idle' | 'dragging' | 'settling';

interface PageScrollStateEvent {
  pageScrollState: PageScrollState;
}

interface ViewPagerProps {
  /**
   * Specific initial page after rendering.
   *
   * Default: 0
   */
  initialPage: number;

  /**
   * When `false`, the view cannot be scrolled via touch interaction.
   *
   * Default: true
   *
   * > Note that the view can always be scrolled by calling setPage.
   */
  scrollEnabled?: boolean;

  /**
   * Fires at most once per page is selected
   *
   * @param {Object} evt - Page selected event data.
   * @param {number} evt.position - Page index of selected.
   */
  onPageSelected?(evt: PageSelectedEvent): void;

  /**
   * Called when the page scroll starts.
   *
   * @param {Object} evt - Page scroll event data.
   * @param {number} evt.position - Page index that will be selected.
   * @param {number} evt.offset - Scroll offset while scrolling.
   */
  onPageScroll?(evt: PageScrollEvent): void;

  /**
   * Called when the page scroll state changed.
   *
   * @param {string} evt - Page scroll state event data
   * This can be one of the following values:
   *
   * * idle
   * * dragging
   * * settling
   */
  onPageScrollStateChanged?(evt: PageScrollState): void;
}

function ViewPagerItem(props: any) {
  return (
    <div
      nativeName="ViewPagerItem"
      {...props}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        collapsable: false,
      }}
    />
  );
}

/**
 * Container that allows to flip left and right between child views.
 * Each child view of the ViewPage will be treated as a separate page
 * and will be stretched to fill the ViewPage.
 * @noInheritDoc
 */
class ViewPager extends React.Component<ViewPagerProps, {}> {
  private instance: Element | HTMLDivElement | null = null;

  /**
   * @ignore
   */
  constructor(props: ViewPagerProps) {
    super(props);
    this.setPage = this.setPage.bind(this);
    this.setPageWithoutAnimation = this.setPageWithoutAnimation.bind(this);
    this.onPageScrollStateChanged = this.onPageScrollStateChanged.bind(this);
  }

  private onPageScrollStateChanged(params: PageScrollStateEvent) {
    const { onPageScrollStateChanged } = this.props;
    if (onPageScrollStateChanged) {
      onPageScrollStateChanged(params.pageScrollState);
    }
  }

  public setPage(selectedPage: number | undefined) {
    if (typeof selectedPage !== 'number') {
      return;
    }
    callUIFunction(this.instance as Element, 'setPage', [selectedPage]);
  }

  public setPageWithoutAnimation(selectedPage: number | undefined) {
    if (typeof selectedPage !== 'number') {
      return;
    }
    callUIFunction(this.instance as Element, 'setPageWithoutAnimation', [selectedPage]);
  }

  /**
   * @ignore
   */
  public render() {
    const { children, onPageScrollStateChanged, ...nativeProps } = this.props;
    let mappedChildren: ReactElement[] = [];
    if (Array.isArray(children)) {
      mappedChildren = children.map((child: ReactNode) => {
        const viewPageItemProps: any = {};
        if (typeof (child as ReactElement).key === 'string') {
          viewPageItemProps.key = `viewPager_${(child as ReactElement).key}`;
        }
        // eslint-disable-next-line react/jsx-key
        return (<ViewPagerItem {...viewPageItemProps}>{child}</ViewPagerItem>);
      });
    } else {
      mappedChildren.push((
        <ViewPagerItem>
          { children }
        </ViewPagerItem>
      ));
    }
    if (typeof onPageScrollStateChanged === 'function') {
      (nativeProps as any).onPageScrollStateChanged = this.onPageScrollStateChanged;
    }
    return (
      <div
        nativeName="ViewPager"
        ref={(ref) => {
          this.instance = ref;
        }}
        {...nativeProps}
      >
        {mappedChildren}
      </div>
    );
  }
}

export default ViewPager;
