import React from 'react';

interface FlowListSectionProps {}

class FlowListSection extends React.Component<FlowListSectionProps> {
  constructor(props: FlowListSectionProps) {
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
        nativeName="FlowListSection"
        {...nativeProps}
      >
        {children}
      </div>
    );
  }
}

export default FlowListSection;
export {
  FlowListSectionProps,
};
