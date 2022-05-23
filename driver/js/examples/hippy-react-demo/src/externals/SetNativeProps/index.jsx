import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  UIManagerModule,
  Dimensions,
} from '@hippy/react';

const { width: screenWidth } = Dimensions.get('window');
const styleObj = StyleSheet.create({
  setNativePropsDemo: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  nativeDemo1Drag: {
    height: 80,
    width: screenWidth,
    backgroundColor: '#4c9afa',
    position: 'relative',
    marginTop: 10,
  },
  nativeDemo1Point: {
    height: 80,
    width: 80,
    color: '#4cccfa',
    backgroundColor: '#4cccfa',
    position: 'absolute',
    left: 0,
  },
  nativeDemo2Drag: {
    height: 80,
    width: screenWidth,
    backgroundColor: '#4c9afa',
    position: 'relative',
    marginTop: 10,
  },
  nativeDemo2Point: {
    height: 80,
    width: 80,
    color: '#4cccfa',
    backgroundColor: '#4cccfa',
    position: 'absolute',
    left: 0,
  },
  splitter: {
    marginTop: 50,
  },
});

export default class SetNativePropsDemo extends React.Component {
  constructor(props) {
    super(props);
    this.demon1Point = React.createRef();
    this.demo1PointDom = null;
    this.state = {
      demo2Left: 0,
    };
    this.isDemon1Layouted = false;
    this.idDemon2Layouted = false;
    this.onTouchDown1 = this.onTouchDown1.bind(this);
    this.onDemon1Layout = this.onDemon1Layout.bind(this);
    this.onTouchMove1 = this.onTouchMove1.bind(this);
    this.onTouchDown2 = this.onTouchDown2.bind(this);
    this.onTouchMove2 = this.onTouchMove2.bind(this);
  }

  componentDidMount() {}

  onDemon1Layout() {
    if (!this.isDemon1Layouted) {
      this.isDemon1Layouted = true;
      this.demo1PointDom = UIManagerModule.getElementFromFiberRef(this.demon1Point.current);
    }
  }

  onTouchDown1(e) {
    const { page_x: pageX } = e;
    const position = pageX - 40;
    console.log('touchdown x', pageX, position, screenWidth);
    if (this.demo1PointDom) {
      this.demo1PointDom.setNativeProps({
        style: {
          left: position,
        },
      });
    }
  }

  onTouchMove1(e) {
    const { page_x: pageX } = e;
    const position = pageX - 40;
    console.log('touchmove x', pageX, position, screenWidth);
    if (this.demo1PointDom) {
      this.demo1PointDom.setNativeProps({
        style: {
          left: position,
        },
      });
    }
  }

  onTouchDown2(e) {
    const { page_x: pageX } = e;
    const position = pageX - 40;
    console.log('touchdown x', pageX, position, screenWidth);
    this.setState({
      demo2Left: position,
    });
  }

  onTouchMove2(e) {
    const { page_x: pageX } = e;
    const position = pageX - 40;
    console.log('touchmove x', pageX, position, screenWidth);
    this.setState({
      demo2Left: position,
    });
  }

  render() {
    const { demo2Left } = this.state;
    return (
      <View style={styleObj.setNativePropsDemo}>
        <Text>
          setNativeProps实现拖动效果
        </Text>
        <View
          style={styleObj.nativeDemo1Drag}
          onTouchDown={this.onTouchDown1}
          onTouchMove={this.onTouchMove1}
        >
          <View
            onLayout={this.onDemon1Layout}
            style={styleObj.nativeDemo1Point}
            ref={this.demon1Point}
          />
        </View>
        <View style={styleObj.splitter} />
        <Text>普通渲染实现拖动效果</Text>
        <View
          style={styleObj.nativeDemo2Drag}
          onTouchDown={this.onTouchDown2}
          onTouchMove={this.onTouchMove2}
        >
          <View style={[styleObj.nativeDemo2Point, { left: demo2Left }]} />
        </View>
      </View>
    );
  }
}
