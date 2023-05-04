import React from 'react';
import {
  Animation,
  AnimationSet,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from '@hippy/react';

const SKIN_COLOR = {
  mainLight: '#4c9afa',
  otherLight: '#f44837',
  textWhite: '#fff',
};

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
    borderStyle: 'solid',
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
  colorText: {
    fontSize: 14,
    color: 'white',
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
      startValue: 150, // 开始值
      toValue: 20, // 动画结束值
      duration: 1000, // 动画持续时长
      delay: 500, // 至动画真正开始的延迟时间
      mode: 'timing', // 动画模式
      timingFunction: 'linear', // 动画缓动函数
      repeatCount: 'loop',
    });
    this.verticalAnimation = new Animation({
      startValue: 80, // 动画开始值
      toValue: 40, // 动画结束值
      duration: 1000, // 动画持续时长
      delay: 0, // 至动画真正开始的延迟时间
      mode: 'timing', // 动画模式
      timingFunction: 'linear', // 动画缓动函数,
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
          follow: false, // 配置子动画的执行是否跟随执行
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
    this.rotateAnimationSet = new AnimationSet({
      children: [
        {
          animation: new Animation({
            startValue: 0,
            toValue: 180,
            duration: 2000,
            delay: 0,
            valueType: 'deg',
            mode: 'timing',
            timingFunction: 'linear',
          }),
          follow: false, // 配置子动画的执行是否跟随执行
        },
        {
          animation: new Animation({
            startValue: 180,
            toValue: 360,
            duration: 2000,
            delay: 0,
            valueType: 'deg',
            mode: 'timing',
            timingFunction: 'linear',
          }),
          follow: true,
        },
      ],
      repeatCount: 'loop',
    });
    // iOS support skew animation after 2.14.1
    this.skewXAnimationSet = new AnimationSet({
      children: [
        {
          animation: new Animation({
            startValue: 0,
            toValue: 20,
            duration: 2000,
            delay: 0,
            mode: 'timing',
            timingFunction: 'linear',
          }),
          follow: false, // 配置子动画的执行是否跟随执行
        },
        {
          animation: new Animation({
            startValue: 20,
            toValue: 0,
            duration: 2000,
            delay: 0,
            mode: 'timing',
            timingFunction: 'linear',
          }),
          follow: true,
        },
      ],
      repeatCount: 'loop',
    });
    // iOS support skew animation after 2.14.1
    this.skewYAnimationSet = new AnimationSet({
      children: [
        {
          animation: new Animation({
            startValue: 0,
            toValue: 20,
            duration: 2000,
            delay: 0,
            mode: 'timing',
            timingFunction: 'linear',
          }),
          follow: false, // 配置子动画的执行是否跟随执行
        },
        {
          animation: new Animation({
            startValue: 20,
            toValue: 0,
            duration: 2000,
            delay: 0,
            mode: 'timing',
            timingFunction: 'linear',
          }),
          follow: true,
        },
      ],
      repeatCount: 'loop',
    });

    this.bgColorAnimationSet = new AnimationSet({
      children: [
        {
          animation: new Animation({
            startValue: 'red',
            toValue: 'yellow',
            valueType: 'color', // 颜色动画需显式指定color单位
            duration: 1000,
            delay: 0,
            mode: 'timing',
            timingFunction: 'linear',
          }),
          follow: false, // 配置子动画的执行是否跟随执行
        },
        {
          animation: new Animation({
            startValue: 'yellow',
            toValue: 'blue',
            duration: 1000,
            valueType: 'color',
            delay: 0,
            mode: 'timing',
            timingFunction: 'linear',
          }),
          follow: true,
        },
      ],
      repeatCount: 'loop',
    });
    // TODO iOS暂不支持文字颜色渐变动画
    this.txtColorAnimationSet = new AnimationSet({
      children: [
        {
          animation: new Animation({
            startValue: 'white',
            toValue: 'yellow',
            valueType: 'color', // 颜色动画需显式指定color单位
            duration: 1000,
            delay: 0,
            mode: 'timing',
            timingFunction: 'linear',
          }),
          follow: false, // 配置子动画的执行是否跟随执行
        },
        {
          animation: new Animation({
            startValue: 'yellow',
            toValue: 'white',
            duration: 1000,
            valueType: 'color',
            delay: 0,
            mode: 'timing',
            timingFunction: 'linear',
          }),
          follow: true,
        },
      ],
      repeatCount: 'loop',
    });

    // timingFunction cubic-bezier 范例
    this.cubicBezierScaleAnimationSet = new AnimationSet({
      children: [
        {
          animation: new Animation({
            startValue: 0,
            toValue: 1,
            duration: 1000,
            delay: 0,
            mode: 'timing',
            timingFunction: 'cubic-bezier(.45,2.84,.38,.5)',
          }),
          follow: false,
        },
        {
          animation: new Animation({
            startValue: 1,
            toValue: 0,
            duration: 1000,
            mode: 'timing',
            timingFunction: 'cubic-bezier(.17,1.45,.78,.14)',
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
      this.bgColorAnimationSet.setRef(this.bgColorRef);
      this.txtColorAnimationSet.setRef(this.textColorRef);
      this.txtColorAnimationSet.setRef(this.textColorRef);
      this.cubicBezierScaleAnimationSet.setRef(this.cubicBezierScaleRef);
      this.rotateAnimationSet.setRef(this.rotateRef);
      this.skewXAnimationSet.setRef(this.skewRef);
      this.skewYAnimationSet.setRef(this.skewRef);
    }
    this.horizonAnimation.onAnimationStart(() => {
      /* eslint-disable-next-line no-console */
      console.log('on animation start!!!');
    });
    this.horizonAnimation.onAnimationEnd(() => {
      /* eslint-disable-next-line no-console */
      console.log('on animation end!!!');
    });
    this.horizonAnimation.onAnimationCancel(() => {
      /* eslint-disable-next-line no-console */
      console.log('on animation cancel!!!');
    });
    this.horizonAnimation.onAnimationRepeat(() => {
      /* eslint-disable-next-line no-console */
      console.log('on animation repeat!!!');
    });
  }

  componentWillUnmount() { // 如果动画没有销毁，需要在此处保证销毁动画，以免动画后台运行耗电
    if (this.horizonAnimation) {
      this.horizonAnimation.destroy();
    }
    if (this.verticalAnimation) {
      this.verticalAnimation.destroy();
    }
    if (this.scaleAnimationSet) {
      this.scaleAnimationSet.destroy();
    }
    if (this.bgColorAnimationSet) {
      this.bgColorAnimationSet.destroy();
    }
    if (this.txtColorAnimationSet) {
      this.txtColorAnimationSet.destroy();
    }
    if (this.cubicBezierScaleAnimationSet) {
      this.cubicBezierScaleAnimationSet.destroy();
    }
    if (this.rotateAnimationSet) {
      this.rotateAnimationSet.destroy();
    }
    if (this.skewXAnimationSet) {
      this.skewXAnimationSet.destroy();
    }
    if (this.skewYAnimationSet) {
      this.skewYAnimationSet.destroy();
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
            ref={(ref) => {
              this.horizonRef = ref;
            }}
            style={[styles.square, {
              transform: [{
                translateX: this.horizonAnimation,
              }],
            }]}
          />
        </View>
        <Text style={styles.title}>高度形变动画</Text>
        <View style={styles.buttonContainer}>
          <View
            style={styles.button}
            onClick={() => {
              this.verticalAnimation.start();
            }}
          >
            <Text style={styles.buttonText}>开始</Text>
          </View>
          <View
            style={[styles.button]}
            onClick={() => {
              this.verticalAnimation.pause();
            }}
          >
            <Text style={styles.buttonText}>暂停</Text>
          </View>
          <View
            style={styles.button}
            onClick={() => {
              this.verticalAnimation.resume();
            }}
          >
            <Text style={styles.buttonText}>继续</Text>
          </View>
        </View>
        <View style={styles.showArea}>
          <View
            ref={(ref) => {
              this.verticalRef = ref;
            }}
            style={[styles.square, {
              height: this.verticalAnimation,
            }]}
          />
        </View>
        <Text style={styles.title}>旋转动画</Text>
        <View style={styles.buttonContainer}>
          <View
            style={styles.button}
            onClick={() => {
              this.rotateAnimationSet.start();
            }}
          >
            <Text style={styles.buttonText}>开始</Text>
          </View>
          <View
            style={[styles.button]}
            onClick={() => {
              this.rotateAnimationSet.pause();
            }}
          >
            <Text style={styles.buttonText}>暂停</Text>
          </View>
          <View
            style={styles.button}
            onClick={() => {
              this.rotateAnimationSet.resume();
            }}
          >
            <Text style={styles.buttonText}>继续</Text>
          </View>
        </View>
        <View style={styles.showArea}>
          <View
            ref={(ref) => {
              this.rotateRef = ref;
            }}
            style={[styles.square, {
              transform: [{
                rotate: this.rotateAnimationSet,
              }],
            }]}
          />
        </View>
        <Text style={styles.title}>倾斜动画</Text>
        <View style={styles.buttonContainer}>
          <View
            style={styles.button}
            onClick={() => {
              this.skewXAnimationSet.start();
              this.skewYAnimationSet.start();
            }}
          >
            <Text style={styles.buttonText}>开始</Text>
          </View>
          <View
            style={[styles.button]}
            onClick={() => {
              this.skewXAnimationSet.pause();
              this.skewYAnimationSet.pause();
            }}
          >
            <Text style={styles.buttonText}>暂停</Text>
          </View>
          <View
            style={styles.button}
            onClick={() => {
              this.skewXAnimationSet.resume();
              this.skewYAnimationSet.resume();
            }}
          >
            <Text style={styles.buttonText}>继续</Text>
          </View>
        </View>
        <View style={styles.showArea}>
          <View
            ref={(ref) => {
              this.skewRef = ref;
            }}
            style={[styles.square, {
              transform: [{
                skewX: this.skewXAnimationSet,
              }, {
                skewY: this.skewYAnimationSet,
              }],
            }]}
          />
        </View>
        <Text style={styles.title}>缩放动画</Text>
        <View style={styles.buttonContainer}>
          <View
            style={styles.button}
            onClick={() => {
              this.scaleAnimationSet.start();
            }}
          >
            <Text style={styles.buttonText}>开始</Text>
          </View>
          <View
            style={[styles.button]}
            onClick={() => {
              this.scaleAnimationSet.pause();
            }}
          >
            <Text style={styles.buttonText}>暂停</Text>
          </View>
          <View
            style={styles.button}
            onClick={() => {
              this.scaleAnimationSet.resume();
            }}
          >
            <Text style={styles.buttonText}>继续</Text>
          </View>
        </View>
        <View style={[styles.showArea, { marginVertical: 20 }]}>
          <View
            ref={(ref) => {
              this.scaleRef = ref;
            }}
            style={[styles.square, {
              transform: [{
                scale: this.scaleAnimationSet,
              }],
            }]}
          />
        </View>
        <Text style={styles.title}>颜色渐变动画（文字渐变仅Android支持）</Text>
        <View style={styles.buttonContainer}>
          <View
              style={styles.button}
              onClick={() => {
                this.bgColorAnimationSet.start();
                this.txtColorAnimationSet.start();
              }}
          >
            <Text style={styles.buttonText}>开始</Text>
          </View>
          <View
              style={[styles.button]}
              onClick={() => {
                this.bgColorAnimationSet.pause();
                this.txtColorAnimationSet.pause();
              }}
          >
            <Text style={styles.buttonText}>暂停</Text>
          </View>
          <View
              style={styles.button}
              onClick={() => {
                this.bgColorAnimationSet.resume();
                this.txtColorAnimationSet.resume();
              }}
          >
            <Text style={styles.buttonText}>继续</Text>
          </View>
        </View>
        <View style={[styles.showArea, { marginVertical: 20 }]}>
          <View
              ref={(ref) => {
                this.bgColorRef = ref;
              }}
              style={[styles.square, {
                justifyContent: 'center',
                alignItems: 'center',
              },
              {
                backgroundColor: this.bgColorAnimationSet,
              }]}

          ><Text ref={(ref) => {
            this.textColorRef = ref;
          }} style={[styles.colorText, {
            // TODO iOS暂不支持文字颜色渐变动画
            color: Platform.OS === 'android' ? this.txtColorAnimationSet : 'white',
          }]}>颜色渐变背景和文字</Text></View>
        </View>

        <Text style={styles.title}>贝塞尔曲线动画</Text>
        <View style={styles.buttonContainer}>
          <View
              style={styles.button}
              onClick={() => {
                this.cubicBezierScaleAnimationSet.start();
              }}
          >
            <Text style={styles.buttonText}>开始</Text>
          </View>
          <View
              style={[styles.button]}
              onClick={() => {
                this.cubicBezierScaleAnimationSet.pause();
              }}
          >
            <Text style={styles.buttonText}>暂停</Text>
          </View>
          <View
              style={styles.button}
              onClick={() => {
                this.cubicBezierScaleAnimationSet.resume();
              }}
          >
            <Text style={styles.buttonText}>继续</Text>
          </View>
        </View>
        <View style={[styles.showArea, { marginVertical: 20 }]}>
          <View
            ref={(ref) => {
              this.cubicBezierScaleRef = ref;
            }}
            style={[styles.square, {
              transform: [{
                scale: this.cubicBezierScaleAnimationSet,
              }],
            }]}
          />
        </View>
      </ScrollView>
    );
  }
}
