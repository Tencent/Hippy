import { Device } from '../native';

const ratio = Device.screen.scale;
let onePixel = Math.round(0.4 * ratio) / ratio;
if (onePixel === 0) {
  onePixel = 1 / ratio;
}

const StyleSheet = {
  create: styleObj => styleObj,
  hairlineWidth: onePixel,
};

export default StyleSheet;
