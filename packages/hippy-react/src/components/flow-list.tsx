import React from 'react';
import { HippyEventEmitter } from '../events';
import { callUIFunction } from '../modules/ui-manager-module';

type DataItem = any;

interface FlowListProps {
  renderSection?(
    datas: DataItem[]
  ): React.ReactElement;
}

const hippyEventEmitter = new HippyEventEmitter();

class FlowList extends React.Component<FlowListProps> {
  private instance:  HTMLDivElement | null = null;

  public render() {
    const {
      numberOfSections,
      renderSection,
      ...nativeProps
    } = this.props;

    hippyEventEmitter.addListener("updateViewSize", (e) => {
      console.log(e);
      callUIFunction(this.instance, 'refresh', []);
    });

    const sectionList = [];
    for (let i = 0; i < numberOfSections; i += 1) {
      sectionList.push((
        renderSection(i)
      ));
    }

    return (
      <div
        ref={(ref) => { this.instance = ref; }}
        nativeName="FlowList"
        {...nativeProps}
      >
        {sectionList}
      </div>
    );
  }
}

export default FlowList;
export {
  FlowListProps,
};
