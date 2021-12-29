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
  },
  itemTitle: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 2,
    backgroundColor: '#fafafa',
    padding: 10,
    marginTop: 10,
  },
});

export default function ScrollExpo() {
  const onScroll = (e) => {
    console.log('scroll', e);
  };
  const scrollRef = React.useRef(null);
  const scrollTo = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(100, null, false);
    }
  };
  const scrollToWithAnimated = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(200, null, true);
    }
  };
  const scrollToWithDuration = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollToWithDuration(200, null, 500);
    }
  };
  return (
    <ScrollView>
      <View style={styles.itemTitle}>
        <Text>Horizontal ScrollView</Text>
      </View>
      <View>
        <ScrollView
          ref={scrollRef}
          horizontal={true}
          bounces={true}
          scrollEventThrottle={300}
          onScroll={onScroll}
          showsHorizontalScrollIndicator={false} // only iOS support
          showScrollIndicator={false} // only Android support
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
      <View style={styles.itemTitle} onClick={scrollTo}>
        <Text>scrollTo</Text>
      </View>
      <View style={styles.itemTitle} onClick={scrollToWithAnimated}>
        <Text>scrollToWithAnimated</Text>
      </View>
      <View style={styles.itemTitle} onClick={scrollToWithDuration}>
        <Text>scrollToWithDuration</Text>
      </View>
      <View style={styles.itemTitle}>
        <Text>Vertical ScrollView</Text>
      </View>
      <ScrollView
        bounces={true}
        horizontal={false}
        style={styles.verticalScrollView}
        showScrollIndicator={true} // web Android support
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
      <View style={styles.itemTitle}>
        <Text>Scroll Dsiable</Text>
      </View>
      <View>
        <ScrollView
          horizontal={true}
          scrollEnabled={false}
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
    </ScrollView>
  );
}
