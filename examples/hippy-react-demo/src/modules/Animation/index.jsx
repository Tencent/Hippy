import React from 'react';
import {
  Animation,
  AnimationSet,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'hippy-react';

const SKIN_COLOR = {
  mainLight: '#4c9afa',
  otherLight: '#f44837',
  textWhite: '#fff',
};

// 样式填写
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  square: {
    width: 80,
    height: 80,
    backgroundColor: SKIN_COLOR.otherLight,
  },
  showArea: {
    height: 150,
    marginVertical: 10,
  },
  button: {
    borderColor: SKIN_COLOR.mainLight,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: 8,
    height: 50,
    marginTop: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 20,
    color: SKIN_COLOR.mainLight,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginTop: 8,
  },
});

export default class AnimationExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.horizonAnimation = new Animation({
      startValue: 150,            // 开始值
      toValue: 20,                // 动画结束值
      duration: 1000,             // 动画持续时长
      delay: 500,                 // 至动画真正开始的延迟时间
      mode: 'timing',             // 动画模式
      timingFunction: 'ease-in',  // 动画缓动函数
      repeatCount: 'loop',
    });
    this.verticalAnimation = new Animation({
      startValue: 80,             // 动画开始值
      toValue: 40,                // 动画结束值
      duration: 1000,             // 动画持续时长
      delay: 0,                   // 至动画真正开始的延迟时间
      mode: 'timing',             // 动画模式
      timingFunction: 'linear',   // 动画缓动函数,
      repeatCount: 'loop',
    });

    this.scaleAnimationSet = new AnimationSet({
      children: [
        {
          animation: new Animation({
            startValue: 1,
            toValue: 1.2,
            duration: 1000,
            delay: 0,
            mode: 'timing',
            timingFunction: 'linear',
          }),
          follow: false,   // 配置子动画的执行是否跟随执行
        },
        {
          animation: new Animation({
            startValue: 1.2,
            toValue: 0.2,
            duration: 1000,
            delay: 0,
            mode: 'timing',
            timingFunction: 'linear',
          }),
          follow: true,
        },
      ],
      repeatCount: 'loop',
    });
  }

  componentDidMount() {
    //  动画参数的设置（只有转换web情况需要调用setRef方法）
    if (Platform.OS === 'web') {
      this.verticalAnimation.setRef(this.verticalRef);
      this.horizonAnimation.setRef(this.horizonRef);
      this.scaleAnimationSet.setRef(this.scaleRef);
    }
    this.horizonAnimation.onHippyAnimationStart(() => {
      /* eslint-disable-next-line no-console */
      console.log('on animation start!!!');
    });
    this.horizonAnimation.onHippyAnimationEnd(() => {
      /* eslint-disable-next-line no-console */
      console.log('on animation end!!!');
    });
    this.horizonAnimation.onHippyAnimationCancel(() => {
      /* eslint-disable-next-line no-console */
      console.log('on animation cancel!!!');
    });
    this.horizonAnimation.onHippyAnimationRepeat(() => {
      /* eslint-disable-next-line no-console */
      console.log('on animation end!!!');
    });
  }

  componentWillUnmount() {  // 如果动画没有销毁，需要在此处保证销毁动画，以免动画后台运行耗电
    if (this.scaleAnimationSet) {
      this.scaleAnimationSet.destroy();
    }
    if (this.horizonAnimation) {
      this.horizonAnimation.destroy();
    }
    if (this.verticalAnimation) {
      this.verticalAnimation.destroy();
    }
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>水平位移动画</Text>
        <View style={styles.buttonContainer}>
          <View
            style={styles.button}
            onClick={() => {
              this.horizonAnimation.start();
            }}
          >
            <Text style={styles.buttonText}>开始</Text>
          </View>
          <View
            style={[styles.button]}
            onClick={() => {
              this.horizonAnimation.pause();
            }}
          >
            <Text style={styles.buttonText}>暂停</Text>
          </View>
          <View
            style={styles.button}
            onClick={() => {
              this.horizonAnimation.resume();
            }}
          >
            <Text style={styles.buttonText}>继续</Text>
          </View>
          <View
            style={styles.button}
            onClick={() => {
              this.horizonAnimation.updateAnimation({ startValue: 50, toValue: 100 });
            }}
          >
            <Text style={styles.buttonText}>更新</Text>
          </View>
        </View>
        <View style={styles.showArea}>
          <View
            ref={(ref) => { this.horizonRef = ref; }}
            style={[styles.square, {
              transform: [{
                translateX: this.horizonAnimation,
              }],
            }]}
          />
        </View>
        <Text style={styles.title}>垂直位移动画</Text>
        <View style={styles.buttonContainer}>
          <View
            style={styles.button}
            onClick={() => { this.verticalAnimation.start(); }}
          >
            <Text style={styles.buttonText}>开始</Text>
          </View>
          <View
            style={[styles.button]}
            onClick={() => { this.verticalAnimation.pause(); }}
          >
            <Text style={styles.buttonText}>暂停</Text>
          </View>
          <View
            style={styles.button}
            onClick={() => { this.verticalAnimation.resume(); }}
          >
            <Text style={styles.buttonText}>继续</Text>
          </View>
        </View>
        <View style={styles.showArea}>
          <View
            ref={(ref) => { this.verticalRef = ref; }}
            style={[styles.square, {
              height: this.verticalAnimation,
            }]}
          />
        </View>
        <Text style={styles.title}>组合形变动画</Text>
        <View style={styles.buttonContainer}>
          <View
            style={styles.button}
            onClick={() => { this.scaleAnimationSet.start(); }}
          >
            <Text style={styles.buttonText}>开始</Text>
          </View>
          <View
            style={[styles.button]}
            onClick={() => { this.scaleAnimationSet.pause(); }}
          >
            <Text style={styles.buttonText}>暂停</Text>
          </View>
          <View
            style={styles.button}
            onClick={() => { this.scaleAnimationSet.resume(); }}
          >
            <Text style={styles.buttonText}>继续</Text>
          </View>
        </View>
        <View style={[styles.showArea, { marginVertical: 20 }]}>
          <View
            ref={(ref) => { this.scaleRef = ref; }}
            style={[styles.square, {
              transform: [{
                scale: this.scaleAnimationSet,
              }],
            }]}
          />
        </View>
      </ScrollView>
    );
  }
}
