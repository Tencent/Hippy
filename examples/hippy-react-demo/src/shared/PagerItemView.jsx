import React from 'react';
import { StyleSheet, Text, View } from '@hippy/react';


const styles = StyleSheet.create({
  pageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 20,
  },
  mainRec: {
    backgroundColor: '#4c9afaAA',
    width: 256,
    height: 48,
    marginBottom: 10,
    marginTop: 156,
  },
  title: {
    verticalAlign: 'middle',
    lineHeight: 48,
    height: 48,
    fontSize: 16,
    color: '#f44837',
    alignSelf: 'center',
  },
  shapeBase: {
    width: 128,
    height: 128,
    backgroundColor: '#4c9afa',
  },
  square: {},
  circle: {
    borderRadius: 64,
  },
  triangle: {
    borderTopWidth: 0,
    borderRightWidth: 70,
    borderBottomWidth: 128,
    borderLeftWidth: 70,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    borderBottomColor: '#4c9afa',
    backgroundColor: 'transparent',
    width: 140,
  },
});

const VIEW_NAME_MAP = {
  SquarePagerView: 'SquarePagerView',
  TrianglePagerView: 'TrianglePagerView',
  CirclePagerView: 'CirclePagerView',
};

function generateShapePagerView(shapeStyle, name) {
  const ShapePagerView = title => (
      <View style={styles.pageContainer} key={title}>
        <View style={[styles.shapeBase, shapeStyle]} />
        <View style={styles.mainRec}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
      </View>
  );
  ShapePagerView.displayName = name;
  return ShapePagerView;
}

export const SquarePagerView = generateShapePagerView(styles.square, VIEW_NAME_MAP.SquarePagerView);
export const TrianglePagerView = generateShapePagerView(styles.triangle, VIEW_NAME_MAP.TrianglePagerView);
export const CirclePagerView = generateShapePagerView(styles.circle, VIEW_NAME_MAP.CirclePagerView);
