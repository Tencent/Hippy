import React from 'react';
import { StyleSheet, View } from '@hippy/react';
import ViewPagerCommon from './ViewPagerCommon';
import ViewPagerExtension from './ViewPagerExtension';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  swiper: {
    flex: 1,
  },
});


const PagerExample = () => (
  <View style={styles.container}>
    <ViewPagerCommon />
    <ViewPagerExtension />
  </View>
);

export default PagerExample;
