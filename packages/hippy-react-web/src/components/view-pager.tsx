import React, { Component } from 'react';
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.min.css';


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

  componentDidMount() {
    const { initialPage = 0, onPageSelected } = this.props;
    this.viewPagerSwiper = new Swiper('.swiper-container', {
      initialSlide: initialPage,
      autoHeight: true,
      on: {
        init() {
        },
        slideChange() {
          if (onPageSelected) onPageSelected({ position: this.activeIndex });
        },
      },
    });
  }

  setPage(index: number) {
    if (Number.isInteger(index)) {
      this.viewPagerSwiper.slideTo(index);
    }
  }

  setPageWithoutAnimation(index: number) {
    if (Number.isInteger(index)) {
      this.viewPagerSwiper.slideTo(index);
    }
  }

  render() {
    const { style, children } = this.props;
    const renderViewPagerItem = () => {
      if (!children || (children as React.ReactNodeArray).length === 0) return null;
      return children.map((item: any, index: number) => {
        const keyParam = index;
        return <div nativeName="ListViewItem" key={`ViewPager-${keyParam}`} className="swiper-slide">{item}</div>;
      });
    };
    return (
      <div style={style}>
        <div className="swiper-container" style={style}>
          <div className="swiper-wrapper">
            {renderViewPagerItem()}
          </div>
        </div>
      </div>
    );
  }
}

export default ViewPager;
