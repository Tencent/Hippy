import Style from '@localTypes/style';
import { Device } from '../native';

const ratio = Device.pixelRatio;
/* eslint-disable-next-line import/no-mutable-exports */
let hairlineWidth = Math.round(0.4 * ratio) / ratio;
if (hairlineWidth === 0) {
  hairlineWidth = 1 / ratio;
}

interface StyleObj {
  [key: string]: Style;
}

/**
 * Create new Stylesheet
 * @param {object} styleObj - The style object
 */
function create(styleObj: StyleObj): StyleObj {
  // TODO: validate the style key and value.
  // TODO: Convert the color and pixel unit at create.
  return styleObj;
}

export {
  hairlineWidth,
  create,
};
