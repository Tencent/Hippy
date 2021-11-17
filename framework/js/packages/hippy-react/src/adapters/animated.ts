import Animation from '../modules/animation';
import View from '../components/view';
import Text from '../components/text';
import Image from '../components/image';

interface TimingConfig {
  toValue: number;
  duration: number;
  easing?: 'linear' | 'ease' | 'in' | 'ease-in' | 'out' | 'ease-out' | 'inOut' | 'ease-in-out' | 'cubic-bezier';
}

class Animated {
  static View = View;

  static Text = Text;

  static Image = Image;

  static Value(val: any) {
    return val;
  }

  static timing(value: number, config: TimingConfig) {
    return new Animation({
      mode: 'timing',
      delay: 0,
      startValue: value,
      toValue: config.toValue,
      duration: config.duration,
      timingFunction: config.easing || 'linear',
    });
  }

  Value = Animated.Value;
}

export default Animated;
