// init global params, global is the top 'this'
require('../../global/Others.js');

// add global functions, do not change this order
require('../../global/Platform.js'); // Hippy.device.platform
require('../../bridge/android/js2native.js');
require('../../global/TimerModule.js'); // setTimeout clearTimeout setInterval clearInterval
require('../../global/ConsoleModule.js'); // console
require('../../global/UIManagerModule.js'); // Hippy.document
require('../../global/Network.js'); // Headers fetch Response
require('../../global/WebSocket.js'); // WebSocket
require('../../global/Storage.js'); // localStrorageAsync                                   to_do use jsbinding
require('../../global/android/Dimensions.js'); // Hippy.device.window Hippy.device.screen Hippy.device.pixelRatio
require('../../global/UtilsModule.js'); // Hippy.device.vibrate Hippy.device.cancelVibrate
require('../../global/android/global.js'); // __GLOBAL__
require('../../bridge/android/native2js.js');
require('../../global/android/requestAnimationFrame.js'); // requestAnimationFrame cancelAnimationFrame

// alias
global.localStorage = Hippy.asyncStorage;
