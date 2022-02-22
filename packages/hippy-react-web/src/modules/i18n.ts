import { canUseDOM } from '../utils/execution-environment';

const directionLTR = 0;
const directionRTL = 1;

export const isRTL = () => {
  if (canUseDOM) {
    const { direction } = getComputedStyle(document.body);
    return direction === 'ltr';
  }
};

export const getDirection = () => {
  if (!canUseDOM) {
    return undefined;
  }
  if (isRTL()) {
    return directionLTR;
  }
  return directionRTL;
};
