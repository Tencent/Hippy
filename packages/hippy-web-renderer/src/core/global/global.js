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

__GLOBAL__.appRegister = {};
__GLOBAL__.nodeIdCache = {};
__GLOBAL__.nodeTreeCache = {};
__GLOBAL__.nodeParamCache = {}; // Not necessary for Android, but need for clean.
__GLOBAL__.moduleCallId = 0;
__GLOBAL__.moduleCallList = {};
__GLOBAL__.DimensionsStore = {}; // TODO: Able to delete
__GLOBAL__.canRequestAnimationFrame = true;
__GLOBAL__.requestAnimationFrameId = 0;
__GLOBAL__.requestAnimationFrameQueue = {};
__GLOBAL__.const = {}; // TODO: Able to delete
__GLOBAL__.destroyInstanceList = {};
