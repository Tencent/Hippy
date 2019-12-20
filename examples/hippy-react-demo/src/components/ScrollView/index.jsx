import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
} from 'hippy-react';

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
  return (
    <ScrollView>
      <View style={styles.itemTitle}>
        <Text>Horizontal ScrollView</Text>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        horizontal={false}
        style={styles.verticalScrollView}
        showsVerticalScrollIndicator={false}
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
