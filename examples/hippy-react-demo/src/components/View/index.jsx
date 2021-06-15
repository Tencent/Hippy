import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
} from '@hippy/react';

import imageUrl from './defaultSource.jpg';

const styles = StyleSheet.create({
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
  rectangle: {
    width: 160,
    height: 80,
    marginVertical: 10,
  },
  bigRectangle: {
    width: 200,
    height: 100,
    borderColor: '#eee',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  smallRectangle: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
});

export default function ViewExpo() {
  const renderTitle = title => (
    <View style={styles.itemTitle}>
      <Text>{title}</Text>
    </View>
  );
  return (
    <ScrollView style={{ padding: 10 }}>
      {renderTitle('backgroundColor')}
      <View style={[styles.rectangle, { backgroundColor: '#4c9afa' }]} />
      {renderTitle('backgroundImage')}
      <View style={[styles.rectangle, {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        backgroundImage: imageUrl,
      }]} ><Text style={{ color: 'white' }}>背景图</Text></View>
      {renderTitle('linear gradient image1')}
      <View style={[styles.rectangle, {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        backgroundImage: 'linear-gradient(200 deg, #ff0000 0, #00ff00ff 0.5, blue 1)',
      }]} ></View>
      {renderTitle('linear gradient image2')}
      <View style={[styles.rectangle, {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        backgroundImage: 'linear-gradient(to bottom left, #ff0000, #00ff00ff, blue)',
      }]} ></View>
      {renderTitle('border props')}
      <View style={[styles.rectangle, { borderColor: '#242424', borderRadius: 4, borderWidth: 1 }]} />
      {renderTitle('flex props')}
      <View style={[styles.bigRectangle, {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }]}
      >
        <View style={[styles.smallRectangle, { backgroundColor: 'yellow' }]} />
        <View style={[styles.smallRectangle, { backgroundColor: 'blue' }]} />
        <View style={[styles.smallRectangle, { backgroundColor: 'green' }]} />
      </View>
    </ScrollView>
  );
}
