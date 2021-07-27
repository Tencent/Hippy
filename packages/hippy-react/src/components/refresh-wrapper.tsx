import React, { CSSProperties, ReactElement } from 'react';
import { Fiber } from 'react-reconciler';
import Style from '@localTypes/style';
import { callUIFunction } from '../modules/ui-manager-module';
import Element from '../dom/element-node';

interface RefreshWrapperProps {
  bounceTime?: number;
  onRefresh?(): void;
  getRefresh?(): ReactElement;
}

/**
 * Simply to implement the drag down to refresh feature.
 *
 * @deprecated
 * @noInheritDoc
 */
class RefreshWrapper extends React.Component<RefreshWrapperProps, {}> {
  private instance: Element | Fiber | HTMLDivElement | null = null;

  public refreshComplected: () => void;

  constructor(props: RefreshWrapperProps) {
    super(props);
    // TODO: Upward compatible with the the old typo mistake.
    this.refreshComplected = this.refreshCompleted.bind(this);
  }

  private getRefresh(): ReactElement | null {
    const { getRefresh } = this.props;
    if (typeof getRefresh === 'function') {
      return getRefresh() || null;
    }
    return null;
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
    const style = { left: 0, right: 0, position: 'absolute' } as CSSProperties;
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
}

export default RefreshWrapper;
