import React from 'react';
import { PullingEvent } from '@localTypes/event';
import { LayoutableProps } from '../types';
import { callUIFunction } from '../modules/ui-manager-module';

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
  private instance: HTMLDivElement | null = null;

  /**
   * Expand the PullView and display the content
   */
  expandPullHeader() {
    callUIFunction(this.instance, 'expandPullHeader');
  }

  /**
   * Collapse the PullView and hide the content
   */
  collapsePullHeader() {
    callUIFunction(this.instance, 'collapsePullHeader');
  }

  render() {
    const { children, ...nativeProps } = this.props;
    return (
      <div
        nativeName="PullHeaderView"
        ref={(ref) => { this.instance = ref; }}
        {...nativeProps}
      >
        { children }
      </div>
    );
  }
}

export default PullHeader;
