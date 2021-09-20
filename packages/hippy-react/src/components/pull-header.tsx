import React from 'react';
import { PullingEvent } from '@localTypes/event';
import { Fiber } from 'react-reconciler';
import { LayoutableProps } from '../types';
import { callUIFunction } from '../modules/ui-manager-module';
import { Device } from '../native';
import Element from '../dom/element-node';

interface CollapsePullHeaderOptions {
  // time left to hide pullHeader after collapsePullHeader() is called, unit is ms
  time?: number,
}

interface PullHeaderProps extends LayoutableProps {
  /**
   * Trigger when release the finger after pulling distance larger than the content height
   */
  onHeaderReleased?(): void;

  /**
   * Trigger when pulling
   *
   * @param {Object} evt - Event data
   * @param {number} evt.contentOffset - Dragging distance
   */
  onHeaderPulling?(evt: PullingEvent): void;
}

class PullHeader extends React.Component<PullHeaderProps, {}> {
  private instance: Element | Fiber | HTMLDivElement | null = null;

  /**
   * Expand the PullView and display the content
   */
  expandPullHeader() {
    callUIFunction(this.instance as Fiber, 'expandPullHeader', []);
  }

  /**
   * Collapse the PullView and hide the content
   * @param {CollapsePullHeaderOptions} [options] - additional config for pull header
   */
  collapsePullHeader(options: CollapsePullHeaderOptions) {
    if (Device.platform.OS === 'android') {
      callUIFunction(this.instance as Fiber, 'collapsePullHeader', [options]);
    } else {
      // iOS is not supported if param invalid, so create a new function name for compatibility
      if (typeof options !== 'undefined') {
        callUIFunction(this.instance as Element, 'collapsePullHeaderWithOptions', [options]);
      } else {
        callUIFunction(this.instance as Element, 'collapsePullHeader', []);
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
