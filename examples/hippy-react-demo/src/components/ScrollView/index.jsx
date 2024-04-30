import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
} from '@hippy/react';

const styles = StyleSheet.create({
  itemStyle: {
    width: 100,
    height: 100,
    lineHeight: 100,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#4c9afa',
    fontSize: 80,
    margin: 20,
    color: '#4c9afa',
    textAlign: 'center',
  },
  verticalScrollView: {
    height: 300,
    width: 140,
    margin: 20,
    borderColor: '#eee',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  itemTitle: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e0e0e0',
    borderRadius: 2,
    backgroundColor: '#fafafa',
    padding: 10,
    marginTop: 10,
  },
});

export default function ScrollExpo() {
  return (
    <ScrollView>
      <View style={styles.itemTitle}>
        <Text>Horizontal ScrollView</Text>
      </View>
      <View>
        <ScrollView
            horizontal={true}
            bounces={true}
            showsHorizontalScrollIndicator={false} // only iOS support
            showScrollIndicator={false} // only Android support
            onScroll={params => console.log('onScroll', params)}
            onMomentumScrollBegin={params => console.log('onMomentumScrollBegin', params)}
            onMomentumScrollEnd={params => console.log('onMomentumScrollEnd', params)}
            onScrollBeginDrag={params => console.log('onScrollBeginDrag', params)}
            onScrollEndDrag={params => console.log('onScrollEndDrag', params)}
        >
          <Text style={styles.itemStyle}>A</Text>
          <Text style={styles.itemStyle}>B</Text>
          <Text style={styles.itemStyle}>C</Text>
          <Text style={styles.itemStyle}>D</Text>
          <Text style={styles.itemStyle}>E</Text>
          <Text style={styles.itemStyle}>F</Text>
          <Text style={styles.itemStyle}>A</Text>
        </ScrollView>
      </View>
      <View style={styles.itemTitle}>
        <Text>Vertical ScrollView</Text>
      </View>
      <ScrollView
        bounces={true}
        horizontal={false}
        style={styles.verticalScrollView}
        showScrollIndicator={false} // only Android support
        showsVerticalScrollIndicator={false} // only iOS support
      >
        <Text style={styles.itemStyle}>A</Text>
        <Text style={styles.itemStyle}>B</Text>
        <Text style={styles.itemStyle}>C</Text>
        <Text style={styles.itemStyle}>D</Text>
        <Text style={styles.itemStyle}>E</Text>
        <Text style={styles.itemStyle}>F</Text>
        <Text style={styles.itemStyle}>A</Text>
      </ScrollView>
    </ScrollView>
  );
}
