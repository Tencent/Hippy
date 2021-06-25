import React, { Component } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.min.css';

/**
 * Container that allows to flip left and right between child views.
 * Each child view of the ViewPage will be treated as a separate page
 * and will be stretched to fill the ViewPage.
 * @noInheritDoc
 */
export class ViewPager extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  setPage(index: number) {
    if (Number.isInteger(index)) {
      this.viewPagerSwiper.slideToLoop(index);
    }
  }

  setPageWithoutAnimation(index: number) {
    if (Number.isInteger(index)) {
      this.viewPagerSwiper.slideToLoop(index, 0);
    }
  }

  render() {
    const {
      style = {},
      children,
      initialPage = 0,
      onPageSelected,
      scrollEnabled,
      loop = false,
      direction = 'horizontal' } = this.props;
    const renderViewPagerItem = () => {
      if (!children || (children as React.ReactNodeArray).length === 0) return null;
      return children.map((item: any, index: number) => {
        const keyParam = index;
        return <SwiperSlide nativeName="ListViewItem" key={`ViewPager-${keyParam}`}>{item}</SwiperSlide>;
      });
    };
    return (
      <Swiper
        direction={direction}
        loop={loop}
        style={Object.assign({ width: '100%' }, style)}
        initialSlide={initialPage}
        autoHeight
        allowTouchMove={scrollEnabled}
        onSwiper={swiper => this.viewPagerSwiper = swiper}
        onSlideChange={(swiper) => {
          if (onPageSelected) {
            onPageSelected({ position: swiper.realIndex || 0 });
          }
        }}
      >
        {renderViewPagerItem()}
      </Swiper>
    );
  }
}

export default ViewPager;
