import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  UIManagerModule,
} from '@hippy/react';

/**
 * Set the component styles
 */
const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  demoContent: {
    flex: 1,
    height: 500,
  },
  box: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: '#4c9afa',
    justifyContent: 'center',
    alignItem: 'center',
    borderRadius: 5,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'middle',
  },
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 5,
  },
  button: {
    height: 55,
    borderColor: '#4c9afa',
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 8,
    justifyContent: 'center',
    alignItem: 'center',
    flexShrink: 1,
    marginHorizontal: 4,
    paddingHorizontal: 1,
  },
  buttonText: {
    fontSize: 14,
    color: '#4c9afa',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 5,
  },
  black: {
    color: 'black',
  },
});

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
const getRandomInt = function getRandomInt(min, max) {
  const newMin = Math.ceil(min);
  const newMax = Math.floor(max);
  return Math.floor(Math.random() * (newMax - newMin + 1)) + newMin;
};

/**
 * The UIManagerModuleDemo component
 */
const UIManagerModuleDemo = function UIManagerModuleDemo() {
  const box = useRef(null);
  let windowWidth;
  let windowHeight;

  // Get the window size after component attached to DOM
  useEffect(() => {
    const screen = Dimensions.get('screen');
    ({ width: windowWidth, height: windowHeight } = screen);
  });

  // Initial the states
  const [position, setPosition] = useState({
    width: 100,
    height: 100,
    top: 10,
    left: 10,
  });
  const [measuredPosition, setMeasuredPosition] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  /**
   * Set a random position to box
   */
  const setRandomPosition = () => {
    const left = getRandomInt(0, windowWidth - 100);
    const top = getRandomInt(0, windowHeight - 450);
    const size = getRandomInt(80, 120);
    setPosition({
      left,
      top,
      width: size,
      height: size,
    });
  };

  /**
   * Get the box position from UIManagerModule.getBoundingClientRect()
   */
  const getBoxPosition = async (isRelToContainer = false) => {
    try {
      /**
       * Demo:
       * UIManagerModule.getBoundingClientRect(box.current)
       */
      const response = await UIManagerModule.getBoundingClientRect(box.current, { relToContainer: isRelToContainer });
      setMeasuredPosition(response);
    } catch (err) {
      console.error('getBoxPosition error', err);
    }
  };

  // Set the box style
  const boxStyle = {
    ...styles.box,
    ...position,
  };

  return (
    <View style={styles.full}>
      <View style={styles.demoContent}>
        <View ref={box} style={boxStyle}>
          <Text style={styles.text} numberOfLines={2}>I am the box</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <View onClick={setRandomPosition} style={styles.button}>
          <Text style={styles.buttonText}>Move position</Text>
        </View>
        <View onClick={() => getBoxPosition(false)} style={styles.button}>
          <Text style={styles.buttonText}>Measure in App Window</Text>
        </View>
        <View onClick={() => getBoxPosition(true)} style={styles.button}>
          <Text style={styles.buttonText}>Measure in Container(RootView)</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View>
          <Text>Box style:</Text>
          <Text style={styles.black}>{`Width: ${boxStyle.width}`}</Text>
          <Text style={styles.black}>{`Height: ${boxStyle.height}`}</Text>
          <Text style={styles.black}>{`Left: ${boxStyle.left}`}</Text>
          <Text style={styles.black}>{`Top: ${boxStyle.top}`}</Text>
        </View>
        <View>
          <Text>getBoundingClientRect output:</Text>
          <Text style={styles.black}>{`Width: ${measuredPosition.width}`}</Text>
          <Text style={styles.black}>{`Height: ${measuredPosition.height}`}</Text>
          <Text style={styles.black}>{`X: ${measuredPosition.x}`}</Text>
          <Text style={styles.black}>{`Y: ${measuredPosition.y}`}</Text>
        </View>
      </View>
    </View>
  );
};

export default UIManagerModuleDemo;
