// init global params, global is the top 'this'
require('../../global/Others.js');

// add global functions, do not change this order
require('../../global/Platform.js'); // Hippy.device.platform


require('../../bridge/ios/js2native.js'); // Hippy.bridge
require('../../global/TimerModule.js'); // setTimeout clearTimeout setInterval clearInterval
require('../../global/ios/promise.js'); // add Promise when iosVersion < 9, to_do
require('../../global/ConsoleModule.js'); // console
require('../../global/UIManagerModule.js'); // document
require('../../global/Network.js'); // Headers fetch Response
require('../../global/Storage.js'); // localStrorageAsync
require('../../global/Event.js'); // dealloc event
require('../../global/ios/Dimensions.js'); // Hippy.device.window Hippy.device.screen Hippy.device.pixelRatio   to_do ios the same as android, __HIPPYNATIVEGLOBAL__.Dimensions下
require('../../global/UtilsModule.js'); // Hippy.device.vibrate Hippy.device.cancelVibrate                to_do ios the same as android
require('../../global/ios/global.js'); // __GLOBAL__
require('../../modules/ios/jsTimersExecution.js'); // ios module, for .h build
require('../../bridge/ios/native2js.js');
require('../../global/ios/requestAnimationFrame.js'); // requestAnimationFrame cancelAnimationFrame

// alias
global.localStorage = Hippy.asyncStorage;
