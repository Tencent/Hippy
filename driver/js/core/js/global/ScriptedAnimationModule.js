/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */

const scriptedAnimationModule = internalBinding('ScriptedAnimationModule');

const startTime = new Date();

global.requestAnimationFrame = function(cb) {
  return scriptedAnimationModule.RequestAnimationFrame(() => {
    cb(new Date() - startTime);
  });
}

global.cancelAnimationFrame = function(id) {
  return scriptedAnimationModule.CancelAnimationFrame(id);
}
