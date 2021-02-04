import React from 'react';

interface FlowListCellProps {}

class FlowListCell extends React.Component<FlowListCellProps> {
  constructor(props: FlowListCellProps) {
    super(props);
  }

  public render() {
    const {
      children,
      ...nativeProps
    } = this.props;
    return (
      <div
        ref={(ref) => { this.instance = ref; }}
        nativeName="FlowListCell"
        {...nativeProps}
      >
        {children}
      </div>
    );
  }
}

export default FlowListCell;
export {
  FlowListCellProps,
};
