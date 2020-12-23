import React from 'react';
import { PullingEvent } from '@localTypes/event';
import { LayoutableProps } from '../types';
import { callUIFunction } from '../modules/ui-manager-module';

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
  private instance: HTMLDivElement | null = null;

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
    callUIFunction(this.instance, 'expandPullFooter', []);
  }

  /**
   * Collapse the PullView and hide the content
   */
  collapsePullFooter() {
    callUIFunction(this.instance, 'collapsePullFooter', []);
  }

  render() {
    const { children, ...nativeProps } = this.props;
    return (
      <div
        nativeName="PullFooterView"
        ref={(ref) => { this.instance = ref; }}
        {...nativeProps}
      >
        { children }
      </div>
    );
  }
}

export default PullFooter;
