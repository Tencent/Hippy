// init global params, global is the top 'this'
require('../../global/Others.js');

// add global functions, do not change this order
require('../../global/DynamicLoad.js');
require('../../global/Platform.js'); // Hippy.device.platform
require('../../bridge/android/js2native.js');
require('../../global/TimerModule.js'); // setTimeout clearTimeout setInterval clearInterval
require('../../global/ConsoleModule.js'); // console
require('../../global/UIManagerModule.js'); // Hippy.document
require('../../global/Network.js'); // Headers fetch Response
require('../../global/Storage.js'); // localStorageAsync
require('../../global/Event.js'); // dealloc event
require('../../global/flutter/Dimensions.js'); // Hippy.device.window Hippy.device.screen Hippy.device.pixelRatio
require('../../global/UtilsModule.js'); // Hippy.device.vibrate Hippy.device.cancelVibrate
require('../../global/flutter/global.js'); // __GLOBAL__
require('../../bridge/flutter/native2js.js');
require('../../global/flutter/requestAnimationFrame.js'); // requestAnimationFrame cancelAnimationFrame
// require('../../global/flutter/Turbo.js'); // turbo

// alias
global.localStorage = Hippy.asyncStorage;
// global.turboPromise = Hippy.turboPromise;
