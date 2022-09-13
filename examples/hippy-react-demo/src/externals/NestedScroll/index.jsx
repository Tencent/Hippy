import React from 'react';
import {
  ListView,
  View,
  StyleSheet,
  Text,
  ViewPager,
  ScrollView,
} from '@hippy/react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    borderWidth: 1,
    borderColor: 'black',
  },
  matchParent: {
    flex: 1,
  },
  label: {
    position: 'absolute',
    left: 5,
    top: 5,
    backgroundColor: '#4c9afa',
    color: 'white',
    fontSize: 9,
    height: 12,
    lineHeight: 12,
    opacity: .75,
  },
});

function renderTestCases(itemFn, key, priority, width, height) {
  const childWidth = width - 42;
  const childHeight = height - 42;
  const result = [];

  const arr0 = itemFn(`${key}-0`, priority, childWidth, childHeight);
  result.push(<View style={styles.container}>
    <ListView
      bounces={false}
      style={{ flex: 1 }}
      numberOfRows={arr0.length}
      renderRow={i => arr0[i]}
      getRowStyle={i => ({ backgroundColor: i % 2 ? 'white' : '#ccc', width: childWidth, height: childHeight })}
      getRowKey={i => `${key}-0-${i}`}
      nestedScrollPriority={priority} />
    <Label text="list[v]" />
  </View>);
  const arr1 = itemFn(`${key}-1`, priority, childWidth, childHeight);
  result.push(<View style={styles.container}>
    <ListView
      horizontal={true}
      bounces={false}
      style={{ flex: 1 }}
      numberOfRows={arr1.length}
      renderRow={i => arr1[i]}
      getRowStyle={i => ({ backgroundColor: i % 2 ? 'white' : '#ccc', width: childWidth, height: childHeight })}
      getRowKey={i => `${key}-1-${i}`}
      nestedScrollPriority={priority} />
    <Label text="list[h]" />
  </View>);
  const arr2 = itemFn(`${key}-2`, priority, childWidth, childHeight);
  result.push(<View style={styles.container}>
    <ViewPager
      direction="vertical"
      style={{ flex: 1 }}
      initialPage={0}>
      {arr2.map((item, i) => (<View style={{ flex: 1, backgroundColor: i % 2 ? 'white' : '#ccc' }} key={`${key}-2-${i}`}>{item}</View>))}
    </ViewPager>
    <Label text="pager[v]" />
  </View>);
  const arr3 = itemFn(`${key}-3`, priority, childWidth, childHeight);
  result.push(<View style={styles.container}>
    <ViewPager
      style={{ flex: 1 }}
      initialPage={0}>
      {arr3.map((item, i) => (<View style={{ flex: 1, backgroundColor: i % 2 ? 'white' : '#ccc' }} key={`${key}-3-${i}`}>{item}</View>))}
    </ViewPager>
    <Label text="pager[h]" />
  </View>);
  const arr4 = itemFn(`${key}-4`, priority, childWidth, childHeight);
  result.push(<View style={styles.container}>
    <ScrollView
      style={{ flex: 1 }}
      nestedScrollPriority={priority}>
      {arr4.map((item, i) => (<View style={{ width: childWidth, height: childHeight, backgroundColor: i % 2 ? 'white' : '#ccc' }} key={`${key}-4-${i}`}>{item}</View>))}
    </ScrollView>
    <Label text="scroll[v]" />
  </View>);
  const arr5 = itemFn(`${key}-5`, priority, childWidth, childHeight);
  result.push(<View style={styles.container}>
    <ScrollView
      horizontal={true}
      style={{ flex: 1 }}
      nestedScrollPriority={priority}>
      {arr5.map((item, i) => (<View style={{ width: childWidth, height: childHeight, backgroundColor: i % 2 ? 'white' : '#ccc' }} key={`${key}-5-${i}`}>{item}</View>))}
    </ScrollView>
    <Label text="scroll[h]" />
  </View>);
  const arr6 = itemFn(`${key}-6`, priority, childWidth, childHeight);
  result.push(<View style={styles.container}>
    <ScrollView
      style={{ flex: 1 }}
      pagingEnabled={true}
      nestedScrollPriority={priority}>
      {arr6.map((item, i) => (<View style={{ width: childWidth, height: childHeight, backgroundColor: i % 2 ? 'white' : '#ccc' }} key={`${key}-6-${i}`}>{item}</View>))}
    </ScrollView>
    <Label text="scroll[v, paging]" />
  </View>);
  const arr7 = itemFn(`${key}-7`, priority, childWidth, childHeight);
  result.push(<View style={styles.container}>
    <ScrollView
      horizontal={true}
      style={{ flex: 1 }}
      pagingEnabled={true}
      nestedScrollPriority={priority}>
      {arr7.map((item, i) => (<View style={{ width: childWidth, height: childHeight, backgroundColor: i % 2 ? 'white' : '#ccc' }} key={`${key}-7-${i}`}>{item}</View>))}
    </ScrollView>
    <Label text="scroll[h, paging]" />
  </View>);
  return result;
}

function Label({ text }) {
  return (
    <Text style={styles.label}> {text} </Text>
  );
}

export default class NestedScrollExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 300,
      height: 300,
      priority: 'self',
    };
  }

  render() {
    const { width, height, priority } = this.state;
    const fn = (key, priority, width, height) => [
      // eslint-disable-next-line react/jsx-key
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width, height }}><Text style={{ fontSize: 40 }}>A</Text></View>,
      // eslint-disable-next-line react/jsx-key
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width, height }}><Text style={{ fontSize: 40 }}>B</Text></View>,
    ];
    const fn2 = (key, priority, width, height) => renderTestCases(fn, key, priority, width, height);
    const fn3 = (key, priority, width, height) => renderTestCases(fn2, key, priority, width, height);
    const fn4 = (key, priority, width, height) => renderTestCases(fn3, key, priority, width, height);
    const items = fn4('key', priority, width, height);
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: 50, flexDirection: 'row' }}>
          <Text>self</Text>
          <Text>parent</Text>
          <Text>none</Text>
        </View>
        <View style={{ width, height }}>
          {items[1]}
        </View>
      </View>
    );
  }
}
