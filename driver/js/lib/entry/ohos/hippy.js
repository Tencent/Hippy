/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// init global params, global is the top 'this'
require('../../global/Others.js');

// add global functions, do not change this order
require('../../global/DynamicLoad.js');
require('../../global/Platform.js'); // Hippy.device.platform
require('../../global/UIManagerModule.js'); // Hippy.document
require('../../global/TimerModule.js'); // setTimeout clearTimeout setInterval clearInterval
require('../../global/ConsoleModule.js'); // console
require('../../global/Network.js'); // Headers fetch Response
require('../../global/Storage.js'); // localStorageAsync
require('../../global/Dimensions.js'); // Hippy.device.window Hippy.device.screen Hippy.device.pixelRatio
require('../../global/UtilsModule.js'); // Hippy.device.vibrate Hippy.device.cancelVibrate
require('../../global/ohos/global.js'); // set __GLOBAL__ object
require('../../global/Event.js'); // register global events callback
require('../../global/AnimationFrameModule.js'); // requestAnimationFrame cancelAnimationFrame
require('../../global/ohos/Turbo.js'); // turbo

// add bridge functions
require('../../bridge/ohos/js2native.js');
require('../../bridge/ohos/native2js.js');

// alias
global.localStorage = Hippy.asyncStorage;
global.turboPromise = Hippy.turboPromise;
