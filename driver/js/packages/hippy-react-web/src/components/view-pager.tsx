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

// @ts-nocheck
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';
import 'swiper/swiper.min.css';

interface ViewPagerProps extends SwiperOptions {
  style: Object,
  children: [],
  initialPage: number,
  onPageSelected: Function,
  scrollEnabled: boolean,
  loop: boolean,
  nativeName?: string
}

/**
 * Container that allows to flip left and right between child views.
 * Each child view of the ViewPage will be treated as a separate page
 * and will be stretched to fill the ViewPage.
 * @noInheritDoc
 */
export const ViewPager: React.FC<ViewPagerProps> = React.forwardRef((props, ref) => {
  const {
    style = {},
    children,
    initialPage = 0,
    onPageSelected,
    scrollEnabled = true,
    loop = false,
    direction = 'horizontal',
  } = props;

  const swiperRef = React.useRef<null | Swiper>(null);

  const renderViewPagerItem = () => {
    if (!children || (children as React.ReactNodeArray).length === 0) return null;
    return children.map((item: any, index: number) => {
      const keyParam = index;
      return <SwiperSlide key={`ViewPager-${keyParam}`}>{item}</SwiperSlide>;
    });
  };

  const onSwiper = (swiper: Swiper) => {
    swiperRef.current = swiper;
  };

  const setPage = (index: number) => {
    if (Number.isInteger(index) && swiperRef.current) {
      swiperRef.current.slideToLoop(index);
    }
  };

  const setPageWithoutAnimation = (index: number) => {
    if (Number.isInteger(index) && swiperRef.current) {
      swiperRef.current.slideToLoop(index, 0);
    }
  };

  React.useImperativeHandle(ref, () => ({
    setPage,
    setPageWithoutAnimation,
  }));

  return (
    <Swiper
      direction={direction}
      loop={loop}
      style={Object.assign({ width: '100%' }, style)}
      initialSlide={initialPage}
      autoHeight
      allowTouchMove={scrollEnabled}
      onSwiper={onSwiper}
      onSlideChange={(swiper) => {
        if (onPageSelected) {
          onPageSelected.call(this, { position: swiper.realIndex || 0 });
        }
      }}
    >
      {renderViewPagerItem()}
    </Swiper>
  );
});

ViewPager.displayName = 'ViewPager';
export default ViewPager;
