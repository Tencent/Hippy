// init global params, global is the top 'this'
require('../../global/Others.js');

// add global functions, do not change this order
require('../../global/DynamicLoad.js');
require('../../global/Platform.js'); // Hippy.device.platform
require('../../global/UIManagerModule.js'); // Hippy.document
require('../../bridge/ios/js2native.js'); // Hippy.bridge
require('../../global/TimerModule.js'); // setTimeout clearTimeout setInterval clearInterval
require('../../global/ios/promise.js'); // add Promise when iosVersion < 9, to_do
require('../../global/ConsoleModule.js'); // console
require('../../global/Network.js'); // Headers fetch Response
require('../../global/Storage.js'); // localStorageAsync
require('../../global/Dimensions.js'); // Hippy.device.window Hippy.device.screen Hippy.device.pixelRatio
require('../../global/UtilsModule.js'); // Hippy.device.vibrate Hippy.device.cancelVibrate
require('../../global/ios/global.js'); // set __GLOBAL__ object
require('../../modules/ios/jsTimersExecution.js'); // ios module for .h build
require('../../bridge/ios/native2js.js');
require('../../global/Event.js'); // register global events callback
require('../../global/ScriptedAnimationModule.js'); // requestAnimationFrame cancelAnimationFrame
require('../../global/ios/Turbo.js'); // turbo
// alias
global.localStorage = Hippy.asyncStorage;
global.turboPromise = Hippy.turboPromise;
