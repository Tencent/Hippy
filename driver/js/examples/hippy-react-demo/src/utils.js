import {
  Dimensions,
  PixelRatio,
  Platform,
} from '@hippy/react';

const Utils = {
  getScreenWidth() {
    const screenWidth = Dimensions.get('screen').width;
    const screenHeight = Dimensions.get('screen').height;
    const width = screenWidth > screenHeight ? screenHeight : screenWidth;
    return Math.floor(width);
  },
  uniqueArray(orgArr) {
    const ret = [];
    for (let i = 0; i < orgArr.length; i += 1) {
      if (ret.indexOf(orgArr[i]) === -1) {
        ret.push(orgArr[i]);
      }
    }
    return ret;
  },
  isiPhoneX() {
    let rst = false;
    if (Platform.OS === 'android') return rst;
    const { height } = Dimensions.get('window');
    if (height >= 812 && PixelRatio.get() >= 2) {
      rst = true;
    }
    return rst;
  },
};

export default Utils;
