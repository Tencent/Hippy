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
    backgroundColor: 'green',
  },
  text: {
    width: 100,
    height: 100,
    lineHeight: 100,
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'middle',
  },
  buttonContainer: {
    alignItem: 'center',
  },
  button: {
    width: 250,
    height: 50,
    borderColor: '#4c9afa',
    borderWidth: 2,
    borderRadius: 8,
  },
  buttonText: {
    height: 50,
    fontSize: 20,
    color: '#4c9afa',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  row: {
    flexDirection: 'row',
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
    const window = Dimensions.get('window');
    ({ width: windowWidth, height: windowHeight } = window);
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
    const left = getRandomInt(0, windowWidth);
    const top = getRandomInt(0, windowHeight - 300);
    const size = getRandomInt(50, 120);
    setPosition({
      left,
      top,
      width: size,
      height: size,
    });
  };

  /**
   * Get the box position from UIManagerModule.measureInWindow()
   */
  const getBoxPosition = async () => {
    try {
      const response = await UIManagerModule.measureInWindow(box.current);
      setMeasuredPosition(response);
    } catch (err) {
      // pass
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
          <Text style={styles.text}>I am the box</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <View onClick={setRandomPosition} style={styles.button}>
          <Text style={styles.buttonText}>Move the random position</Text>
        </View>
        <View onClick={getBoxPosition} style={styles.button}>
          <Text style={styles.buttonText}>Measure box in window</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.full}>
          <Text>Box style:</Text>
          <Text>{`Width: ${boxStyle.width}`}</Text>
          <Text>{`Height: ${boxStyle.height}`}</Text>
          <Text>{`Left: ${boxStyle.left}`}</Text>
          <Text>{`Top: ${boxStyle.top}`}</Text>
        </View>
        <View style={styles.full}>
          <Text>measureInWindow output:</Text>
          <Text>{`Width: ${measuredPosition.width}`}</Text>
          <Text>{`Height: ${measuredPosition.height}`}</Text>
          <Text>{`X: ${measuredPosition.x}`}</Text>
          <Text>{`Y: ${measuredPosition.y}`}</Text>
        </View>
      </View>
    </View>
  );
};

export default UIManagerModuleDemo;
