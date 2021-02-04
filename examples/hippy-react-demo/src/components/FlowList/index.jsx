import React from 'react';
import {
  FlowList,
  FlowListSection,
  FlowListCell,
  Image,
  View,
  callNative,
  StyleSheet,
  HippyEventEmitter,
} from '@hippy/react';


const mockData = {
  listData: [
    {
      case: 'section1',
      views: [
        {
          cellType: 'image',
          url: 'http://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif',
        },
        {
          cellType: 'image',
          url: 'http://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif',
        },
        {
          cellType: 'image',
          url: 'http://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif',
        },
        {
          cellType: 'image',
          url: 'http://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif',
        },
        {
          cellType: 'image',
          url: 'http://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif',
        },
        {
          cellType: 'image',
          url: 'http://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif',
        },
        {
          cellType: 'image',
          url: 'http://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif',
        },
        {
          cellType: 'image',
          url: 'http://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif',
        },
        {
          cellType: 'image',
          url: 'http://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif',
        },
      ],
    },
  ],
};

const styles = StyleSheet.create({
  normalText: {
    fontSize: 24,
    lineHeight: 36,
    fontColor: 'black',
    width: 100,
  },
  image_style: {
    width: 330,
    height: 180,
    margin: 16,
    borderColor: '#4c9afa',
    borderWidth: 1,
    borderRadius: 4,
  },
});

export default class FlowListExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionDatas: mockData.listData,
    };
    this.getRenderRow = this.getRenderRow.bind(this);
    this.getRenderSection = this.getRenderSection.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  getRenderRow(viewData) {
    return (
      <FlowListCell>
        <Image
          style={[styles.image_style, { resizeMode: 'contain' }]}
          source={{ uri: viewData.url }}
        />
      </FlowListCell>
    );
  }

  getRenderSection(index) {
    const { sectionDatas } = this.state;
    const rowDatas = sectionDatas[index].views;
    const numberOfRows = rowDatas.length;
    const sectionLists = [];
    for (let i = 0; i < numberOfRows; i += 1) {
      sectionLists.push(
        this.getRenderRow(rowDatas[i]),
      );
    }
    return (
      <FlowListSection>
        {sectionLists}
      </FlowListSection>
    );
  }

  render() {
    const { sectionDatas } = this.state;
    return (
      <FlowList
        style={{ flex: 1, backgroundColor: '#ffffff' }}
        numberOfSections={sectionDatas.length}
        renderSection={this.getRenderSection}
      />
    );
  }
}
