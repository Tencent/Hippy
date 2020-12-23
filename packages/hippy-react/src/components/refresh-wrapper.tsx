import React, { ReactElement } from 'react';
import Style from '@localTypes/style';
import { callUIFunction } from '../modules/ui-manager-module';

interface RefreshWrapperProps {
  bounceTime?: number;
  onRefresh?(): void;
  getRefresh?(): ReactElement;
}

interface RefreshWrapperItemViewProps {
  style: Style[];
}

/**
 * Simply to implement the drag down to refresh feature.
 * @noInheritDoc
 */
class RefreshWrapper extends React.Component<RefreshWrapperProps, {}> {
  private instance: HTMLDivElement | null = null;

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
    callUIFunction(this.instance, 'startRefresh', null);
  }

  /**
   * Call native that data is refreshed
   */
  public refreshCompleted() {
    callUIFunction(this.instance, 'refreshComplected', null);
  }

  /**
   * @ignore
   */
  public render() {
    const { children, ...nativeProps } = this.props;
    return (
      <div nativeName="RefreshWrapper" ref={(ref) => { this.instance = ref; }} {...nativeProps}>
        <div nativeName="RefreshWrapperItemView" style={[{ left: 0, right: 0, position: 'absolute' }]}>
          { this.getRefresh() }
        </div>
        { children }
      </div>
    );
  }
}

export default RefreshWrapper;
