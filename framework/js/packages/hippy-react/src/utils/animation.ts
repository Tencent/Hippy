/* eslint-disable import/prefer-default-export */

function repeatCountDict(repeatCount: number | 'loop') {
  if (repeatCount === 'loop') {
    return -1;
  }
  return repeatCount;
}

export {
  repeatCountDict,
};
