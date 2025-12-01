import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  ConsoleModule,
  ListView
} from '@hippy/react';

class ListViewEx extends ListView {

  render() {
    const result = super.render();
    const copy = {
      ...result,
      props: {
        ...result.props,
        nativeName: 'ListViewEx',
      },
    }
    Object.freeze(copy);
    return copy;
  }

}

const styles = StyleSheet.create({
  container: {
    collapsable: false,
    height: 100,
    flexDirection: 'row',
  },
  avatar: {
    margin: 10,
    width: 45,
    height: 45,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  itemContainer: {
    marginVertical: 10,
    marginRight: 10,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    numberOfLines: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  desc: {
    fontSize: 14,
    numberOfLines: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  header: {
    height: 50,
    lineHeight: 50,
    backgroundColor: '#f99',
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});

const titles = [
  '新研究发现口香糖能够减轻焦虑',
  '全球气候变暖导致植物物种数量减少',
  '电动汽车销量在全球范围内超过传统汽车',
  '特斯拉公司推出全新的太阳能屋顶瓦片',
  '智能音箱的销售量在全球范围内飙升',
  '全球卫生组织发布新的饮食指南',
  '人工智能技术正在改变医疗保健行业',
  '亚马逊推出全新的无人机快递服务',
  '科学家发现了新的行星系',
  '新的研究表明运动可以提高大脑功能',
  '全球经济增长预期下调',
  '新的研究表明长时间使用电子设备会导致近视',
  '世界各地的城市都在采取行动应对气候变化',
  '新的研究表明抑郁症可能与肠道菌群有关',
  '全球范围内的塑料污染问题日益严重',
  '新的研究表明饮食含有多种颜色的食物可以提供更多的营养',
  '科学家发现了新的抗生素',
  '全球各地的城市正在推广自行车共享计划',
  '新的研究表明化妆品可能会对皮肤健康造成负面影响',
  '全球范围内的数字支付市场正在迅速增长'];

const descs = [
  '一项最新研究表明，咀嚼口香糖可以减轻焦虑和压力感受，并改善心理健康。',
  '最新研究发现，全球气候变暖是导致植物物种数量减少的主要原因之一，对生态系统造成了巨大的影响。',
  '新的市场研究表明，电动汽车的销售量在全球范围内已经超过了传统汽车，成为市场的新宠。',
  '特斯拉公司最近推出了一款全新的太阳能屋顶瓦片，这款瓦片可以产生清洁的太阳能电力，为房屋提供能源。',
  '智能音箱的销售量在全球范围内飙升，这得益于智能家居市场的增长和人们对智能设备的需求。',
  '全球卫生组织最近发布了新的饮食指南，鼓励人们采用更健康的饮食习惯，包括增加蔬菜和水果的摄入量。',
  '人工智能技术正在改变医疗保健行业，为医生提供更快、更准确的诊断和治疗方法，提高了整个行业的效率。',
  '亚马逊公司最近推出了一项全新的无人机快递服务，可以更快速地将包裹送到顾客手中，提高了送货效率。',
  '科学家最近发现了一组新的行星，这些行星位于离地球较远的星系中，为我们了解宇宙带来了新的启示。',
  '最新的研究表明，运动可以帮助提高大脑的功能，包括记忆力和注意力等方面。',
  '最新的经济数据显示，全球经济增长预期已经被下调，这可能会对全球贸易和就业市场造成影响。',
  '最新的研究表明，长时间使用电子设备会导致近视，这可能会影响年轻人的视力健康。',
  '世界上的许多城市都在采取积极的措施应对气候变化，包括推广可再生能源和改善交通系统等。',
  '最新的研究表明，抑郁症可能与肠道菌群的失调有关，这为治疗抑郁症提供了新的思路。',
  '全球范围内的塑料污染问题日益严重，已经成为世界范围内的一个重要环境问题。',
  '最新的研究表明，饮食含有多种颜色的食物可以提供更多的营养，包括维生素和矿物质等。',
  '科学家最近发现了一种新的抗生素，这可能会为治疗感染等疾病提供新的疗法。',
  '世界各地的城市正在推广自行车共享计划，这有助于减少交通拥堵和空气污染等问题。',
  '最新的研究表明，化妆品可能会对皮肤健康造成负面影响，包括皮肤过敏和炎症等。',
  '全球范围内的数字支付市场正在迅速增长，这得益于人们对更安全、更便捷的支付方式的需求。'
];

function random(...args) {
  if (args.length == 1) {
    const arg0 = args[0];
    if (arg0 instanceof Array) {
      return arg0[Math.floor(Math.random() * arg0.length)];
    }
    return Math.floor(Math.random() * (arg0 + 1));
  } else if (args.length == 2) {
    const [from, to] = args;
    return Math.floor(Math.random() * (to - from + 1)) + from;
  }
  throw new Error('Illegal arguments length');
}

function mockData() {
  const result = [];
  for (let i = 0; i < 5; ++i) {
    result.push({
      color: `rgb(${random(255)}, ${random(255)}, ${random(255)})`,
      avatar: `https://qq.com/${random(1, 32)}?set=set4&size=45x45`,
      title: random(titles),
      desc: random(descs),
    });
  }
  return result;
}

function mockFetchData() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData()), 10);
  });
}

export default class ListExample extends React.Component {

  fetchingFormer = false;
  fetchingLatter = false;

  constructor(props) {
    super(props);
    this.state = {
      dataSource: [...mockData(), ...mockData()],
      keyOffset: 0,
      deltaHeightToAppend: 50,
    };
    this.appendFormer = this.appendFormer.bind(this);
    this.appendLatter = this.appendLatter.bind(this);
    this.getRenderRow = this.getRenderRow.bind(this);
    this.onEndReached = this.onEndReached.bind(this);
    this.getRowKey = this.getRowKey.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.getRowType = this.getRowType.bind(this);
  }

  async appendFormer() {
    this.fetchingFormer = true;
    this.setState({
      deltaHeightToAppend: 0,
    });
    const newData = await mockFetchData();
    this.setState({
      keyOffset: this.state.keyOffset - newData.length,
      deltaHeightToAppend: 100 * newData.length,
      dataSource: newData.concat(this.state.dataSource),
    }, () => {
      setTimeout(() => { this.fetchingFormer = false }, 500);
    });
  }

  async appendLatter() {
    this.fetchingLatter = true;
    const newData = await mockFetchData();
    this.setState({
      dataSource: this.state.dataSource.concat(newData),
    }, () => {
      setTimeout(() => { this.fetchingLatter = false }, 500);
    });
  }

  onEndReached() {
    if (this.fetchingLatter) {
      return;
    }
    this.appendLatter();
  }

  onScroll(opt) {
    if (this.fetchingFormer) {
      return;
    }
    console.log(opt.contentOffset.y);
    if (opt.contentOffset.y < 800) {
      this.appendFormer();
    }
  }

  getRowKey(index) {
    if (index === 0) {
      return 'row-header';
    }
    if (index === this.state.dataSource.length + 1) {
      return 'row-footer';
    }
    return `row-${index + this.state.keyOffset}`;
  }

  getRowType(index) {
    if (index === 0 || index === this.state.dataSource.length + 1) {
      return 0;
    }
    return 1;
  }

  getRenderRow(index) {
    if (index === 0 || index === this.state.dataSource.length + 1) {
      return <Text style={styles.header}>加载中...</Text>;
    }
    const { dataSource } = this.state;
    const item = dataSource[index - 1];
    return (
      <View style={[styles.container, { backgroundColor: item.color }]}>
        <Image style={styles.avatar} source={{ uri: item.avatar }} />
        <View style={styles.itemContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.desc}</Text>
        </View>
      </View>
    );
  }

  render() {
    const { dataSource, deltaHeightToAppend } = this.state;
    return (
      <View style={{ flex: 1, collapsable: false }}>
        <ListViewEx
          bounces={false}
          style={[{ backgroundColor: '#ffffff', flex: 1 }]}
          numberOfRows={dataSource.length + 2}
          renderRow={this.getRenderRow}
          onEndReached={this.onEndReached}
          getRowKey={this.getRowKey}
          getRowType={this.getRowType}
          onScroll={this.onScroll}
          scrollEventThrottle={100}
          preloadItemNumber={2}
          deltaHeightToAppend={deltaHeightToAppend}
          onDataRendered={() => { ConsoleModule.log('test onDataRendered'); }}
        />
      </View>
    );
  }
}
