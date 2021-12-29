import React, { useRef } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
} from '@hippy/react';

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
  const ref = useRef(null);
  const onTouchStart = (e) => {
    console.log('touch start', e);
  };
  const onTouchMove = (e) => {
    console.log('touch move', e);
  };
  const onTouchEnd = (e) => {
    console.log('touch end', e);
  };
  const onTouchCancel = (e) => {
    console.log('touch cancel', e);
  };
  const onLayout = (e) => {
    console.log('layoutemit', e);
  };
  const interruptTouch = () => {
    alert('touch event was interrupted');
  };
  const onAttachedToWindow = () => {
    console.log('component mount');
  };
  return (
    <ScrollView style={{ padding: 10, height: '100vh', overflow: 'scroll' }}>
      {renderTitle('onLayout')}
      <View onLayout={onLayout} style={[styles.rectangle, { backgroundColor: '#4c9afa' }]} />
      {renderTitle('onAttachedToWindow')}
      <View onAttachedToWindow={onAttachedToWindow} style={[styles.rectangle, { backgroundColor: '#4c9afa' }]} />
      {renderTitle('onTouchDown')}
      <View ref={ref} onTouchDown={onTouchStart} style={[styles.rectangle, { backgroundColor: '#4c9afa' }]} />
      {renderTitle('onTouchMove')}
      <View onTouchMove={onTouchMove} style={[styles.rectangle, { backgroundColor: '#4c9afa' }]} />
      {renderTitle('onTouchEnd')}
      <View onTouchEnd={onTouchEnd} style={[styles.rectangle, { backgroundColor: '#4c9afa' }]} />
      {renderTitle('onTouchCancel')}
      <View onTouchMove={interruptTouch} onTouchCancel={onTouchCancel} style={[styles.rectangle, { backgroundColor: '#4c9afa' }]} />

      {renderTitle('backgroundColor')}
      <View style={[styles.rectangle, { backgroundColor: '#4c9afa' }]} />
      {renderTitle('opacity')}
      <View opacity={0.5} style={[styles.rectangle, { backgroundColor: '#4c9afa' }]} />
      {renderTitle('overflow')}
      <View overflow={'hidden'} style={[styles.rectangle, { backgroundColor: '#4c9afa' }]} />
      {renderTitle('overflow')}
      <View overflow={'visible'} style={[styles.rectangle, { backgroundColor: '#4c9afa' }]} />
      {renderTitle('backgroundImage')}
      <View style={[styles.rectangle, {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        backgroundImage: 'url(https://static.res.qq.com/nav/3b202b2c44af478caf1319dece33fff2.png)',
      }]}
        accessible={true}
        accessibilityLabel={'背景图'}
        accessibilityRole={'image'}
        accessibilityState={{
          disabled: false,
          selected: true,
          checked: false,
          expanded: false,
          busy: true,
        }}
        accessibilityValue={{
          min: 1,
          max: 10,
          now: 5,
          text: 'middle',
        }}
      ><Text style={{ color: 'white' }}>背景图</Text></View>
      {renderTitle('backgroundImage linear-gradient')}
      <View style={[styles.rectangle, {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 2,
        backgroundImage: 'linear-gradient(30deg, blue 10%, yellow 40%, red 50%)',
      }]} ><Text style={{ color: 'white' }}>渐变色</Text></View>
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
    </ScrollView >
  );
}
