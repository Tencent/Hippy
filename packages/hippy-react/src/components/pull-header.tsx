import React from 'react';
import { PullingEvent } from '@localTypes/event';
import { Fiber } from 'react-reconciler';
import { LayoutableProps } from '../types';
import { callUIFunction } from '../modules/ui-manager-module';
import { Device } from '../native';

interface CollapsePullHeaderOptions {
  // time left when PullHeader collapses, unit is ms
  time?: number,
}

interface PullHeaderProps extends LayoutableProps {
  /**
   * Trigger when release the finger after pulling distance larger than the content height
   */
  onHeaderReleased?() :void;

  /**
   * Trigger when pulling
   *
   * @param {Object} evt - Event data
   * @param {number} evt.contentOffset - Dragging distance
   */
  onHeaderPulling?(evt: PullingEvent): void;
}

class PullHeader extends React.Component<PullHeaderProps, {}> {
  private instance: HTMLDivElement | Fiber | null = null;

  /**
   * Expand the PullView and display the content
   */
  expandPullHeader() {
    callUIFunction(this.instance as Fiber, 'expandPullHeader', []);
  }

  /**
   * Collapse the PullView and hide the content
   * @param options
   */
  collapsePullHeader(options: CollapsePullHeaderOptions) {
    if (Device.platform.OS === 'android') {
      callUIFunction(this.instance as Fiber, 'collapsePullHeader', [options]);
    } else {
      if (typeof options !== 'undefined') {
        callUIFunction(this.instance as Fiber, 'collapsePullHeaderWithOptions', [options]);
      } else {
        callUIFunction(this.instance as Fiber, 'collapsePullHeader', []);
      }
    }
  }

  render() {
    const { children, ...nativeProps } = this.props;
    return (
      <div
        nativeName="PullHeaderView"
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

export default PullHeader;
