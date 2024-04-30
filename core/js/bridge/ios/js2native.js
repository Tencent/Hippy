/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
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

/* eslint-disable no-undef */

const getModuleName = (originModuleName) => {
  if (originModuleName === 'UIManagerModule') {
    return 'UIManager';
  }
  if (originModuleName === 'StorageModule') {
    return 'AsyncStorage';
  }
  return originModuleName;
};

const getMethodName = (originMethodName, realMethodName) => {
  if (realMethodName) {
    return realMethodName;
  }
  if (originMethodName === 'createNode') {
    return 'insertChildren';
  }
  return originMethodName;
};

const getComponentName = (originComponentName) => {
  if (__GLOBAL__.NativeModules
      && __GLOBAL__.NativeModules.ListView
      && __GLOBAL__.NativeModules.ScrollView
      && __GLOBAL__.NativeModules.TextInput) {
    return originComponentName;
  }
};

const getParam = (moduleName, methodName, originParam) => {
  if (moduleName === 'UIManagerModule' && methodName === 'updateNode') {
    const newParam = [];
    newParam.push(originParam[1][0].id);
    newParam.push(getComponentName(originParam[1][0].name));
    const nativeProps = Object.assign(originParam[1][0].props, originParam[1][0].props.style);
    delete nativeProps.style;
    newParam.push(nativeProps);
    return newParam;
  }

  if (moduleName === 'UIManagerModule' && methodName === 'deleteNode') {
    const newParam = [];
    newParam.push(originParam[1][0].pId);
    newParam.push(undefined);
    newParam.push(undefined);
    newParam.push(undefined);
    newParam.push(undefined);
    const { pId, id } = originParam[1][0];
    const pNode = __GLOBAL__.IosNodeTree[pId];
    if (pNode) {
      const deleteIndex = pNode.indexOf(id);
      if (deleteIndex > -1) {
        newParam.push([deleteIndex]);
        __GLOBAL__.IosNodeTree[originParam[1][0].pId].splice(deleteIndex, 1);
        return newParam;
      }
      return 0;
    }
    return 0;
  }
  return originParam;
};

const needReject = (moduleName, methodName) => !(moduleName === 'StorageModule' || methodName === 'multiGet');

Hippy.bridge.callNative = (...callArguments) => {
  if (callArguments.length < 2) {
    throw new TypeError('callNative arguments length must be larger than 2');
  }

  const [nativeModuleName, nativeMethodName] = callArguments;

  if (callArguments.length === 2) {
    const NativeModule = __GLOBAL__.NativeModules[getModuleName(nativeModuleName)];
    if (NativeModule && NativeModule[getMethodName(nativeMethodName)]) {
      NativeModule[getMethodName(nativeMethodName)]();
      return;
    }
  } else if (nativeModuleName === 'UIManagerModule' && nativeMethodName === 'callUIFunction') {
    let moduleName = getComponentName(callArguments[2][0]);

    if (!__GLOBAL__.NativeModules[moduleName]) {
      moduleName += 'Manager';
    }

    if (!__GLOBAL__.NativeModules[moduleName]) {
      if (moduleName.indexOf('RCT') > -1) {
        [, moduleName] = moduleName.split('RCT');
      }
    }

    const methodName = callArguments[2][2];
    let param = [callArguments[2][1]];

    param = param.concat(callArguments[2][3]);

    const NativeModule = __GLOBAL__.NativeModules[moduleName];

    if (NativeModule && NativeModule[methodName]) {
      NativeModule[methodName](...param);
      return;
    }
  } else {
    let realNativeMethodName = '';
    if (nativeModuleName === 'UIManagerModule') {
      switch (nativeMethodName) {
        case 'createNode':
          realNativeMethodName = 'createView';
          break;
        case 'updateNode':
          realNativeMethodName = 'updateView';
          break;
        case 'deleteNode':
          realNativeMethodName = 'manageChildren';
          break;
      }
    }

    const NativeModule = __GLOBAL__.NativeModules[getModuleName(nativeModuleName)];
    const methodName = getMethodName(nativeMethodName, realNativeMethodName);
    if (NativeModule && NativeModule[methodName]) {
      const callModuleMethod = NativeModule[methodName];
      const param = [];
      for (let i = 2; i < callArguments.length; i += 1) {
        param.push(callArguments[i]);
      }
      const [rootId, nodes] = param;
      if (nativeModuleName === 'UIManagerModule' && nativeMethodName === 'createNode') {
        const uiList = [];

        nodes && nodes.forEach((uiItem) => {
          const nativeProps = Object.assign(uiItem.props, uiItem.props.style);
          delete nativeProps.style;
          const tagName = uiItem.tagName === undefined ? '' : uiItem.tagName;
          const uiParam = [uiItem.id, getComponentName(uiItem.name), rootId, tagName, nativeProps];
          // TODO: need using batched createView API in future
          callModuleMethod.apply(callModuleMethod, uiParam);
          uiList.push(uiItem);
        });

        while (uiList.length > 0) {
          const siblingList = [];
          const siblingPid = uiList[0].pId;
          const deleteIndexList = [];
          uiList.every((uiItem, index) => {
            if (uiItem.pId === siblingPid) {
              siblingList.push(uiItem);
              deleteIndexList.push(index);
            }
            // generate dom trees based on different parent id in sequence
            // when encountering bigger parent id, skip it and generate another tree next time
            return uiItem.pId <= siblingPid;
          });

          siblingList.sort((a, b) => a.index - b.index);
          const insertChildIds = siblingList.map(item => item.id);

          if (__GLOBAL__.IosNodeTree[siblingPid]
              && __GLOBAL__.IosNodeTree[siblingPid].length > 0) {
            const addChildIndexes = [];

            let offsetIndex = 0;
            if (siblingList[0].index > __GLOBAL__.IosNodeTree[siblingPid].length) {
              offsetIndex = siblingList[0].index - __GLOBAL__.IosNodeTree[siblingPid].length;
            }

            siblingList.forEach((item) => {
              addChildIndexes.push((item.index - offsetIndex));
              __GLOBAL__.IosNodeTree[siblingPid].splice(item.index, 0, item.id);
            });

            __GLOBAL__.NativeModules.UIManager.manageChildren(
              siblingPid, undefined, undefined,
              insertChildIds, addChildIndexes, undefined,
            );
          } else {
            const { setChildren } = __GLOBAL__.NativeModules.UIManager;
            // TODO: need using batched setChildren API in future
            setChildren(siblingPid, insertChildIds);
            const cacheIds = [...insertChildIds];

            if (__GLOBAL__.IosNodeTree[siblingPid]) {
              __GLOBAL__.IosNodeTree[siblingPid] = __GLOBAL__.IosNodeTree[siblingPid].concat(cacheIds);
            } else {
              __GLOBAL__.IosNodeTree[siblingPid] = cacheIds;
            }
          }
          deleteIndexList.forEach((idx, index) => {
            const deleteIndex = idx - index;
            uiList.splice(deleteIndex, 1);
          });
        }
      } else {
        const nativeParam = getParam(nativeModuleName, nativeMethodName, param);
        if (nativeModuleName !== 'UIManagerModule' || nativeMethodName !== 'deleteNode' || nativeParam) {
          callModuleMethod.apply(NativeModule, nativeParam);
        }
      }
      return;
    }
  }
  throw new ReferenceError(`callNative Native ${nativeModuleName}.${nativeMethodName}() not found`);
};

Hippy.bridge.callNativeWithPromise = (...callArguments) => {
  if (callArguments.length < 2) {
    return Promise.reject(new TypeError('callNativeWithPromise arguments length must be larger than 2'));
  }

  const [nativeModuleName, nativeMethodName] = callArguments;
  const NativeModule = __GLOBAL__.NativeModules[getModuleName(nativeModuleName)];

  if (NativeModule && NativeModule[getMethodName(nativeMethodName)]) {
    const callModuleMethod = NativeModule[getMethodName(nativeMethodName)];
    const paramList = [];
    for (let i = 2; i < callArguments.length; i += 1) {
      paramList.push(callArguments[i]);
    }
    if (callModuleMethod.type === 'promise') {
      return callModuleMethod.apply(NativeModule, getParam(nativeModuleName, nativeMethodName, paramList));
    }
    return new Promise((resolve, reject) => {
      if (needReject(nativeModuleName, nativeMethodName)) {
        paramList.push(reject);
      }
      paramList.push(resolve);
      callModuleMethod.apply(NativeModule, getParam(nativeModuleName, nativeMethodName, paramList));
    });
  }
  return Promise.reject(new ReferenceError(`callNativeWithPromise Native ${nativeModuleName}.${nativeMethodName}() not found`));
};

Hippy.bridge.callNativeWithCallbackId = (...callArguments) => {
  if (callArguments.length < 3) {
    throw new TypeError('callNativeWithCallbackId arguments length must be larger than 3');
  }
  const [moduleName, methodName, autoDelete] = callArguments;
  if (callArguments.length === 3) {
    const NativeModule = __GLOBAL__.NativeModules[getModuleName(moduleName)];
    if (NativeModule && NativeModule[getMethodName(methodName)]) {
      if (autoDelete === false) {
        return NativeModule[getMethodName(methodName)]({
          notDelete: true,
        });
      }
      return NativeModule[getMethodName(methodName)]();
    }
  } else {
    const NativeModule = __GLOBAL__.NativeModules[getModuleName(moduleName)];
    if (NativeModule && NativeModule[getMethodName(methodName)]) {
      const callModuleMethod = NativeModule[getMethodName(methodName)];
      const param = [];
      for (let i = 3; i < callArguments.length; i += 1) {
        param.push(callArguments[i]);
      }
      const currentCallId = __GLOBAL__.moduleCallId;
      __GLOBAL__.moduleCallId += 1;
      let nativeParam = [];
      if (autoDelete === false) {
        nativeParam.push({
          notDelete: true,
        });
      }
      nativeParam.push(currentCallId);
      nativeParam = nativeParam.concat(param);

      callModuleMethod.apply(
        NativeModule,
        getParam(moduleName, methodName, nativeParam),
      );
      return currentCallId;
    }
  }
  throw new ReferenceError(`callNativeWithCallbackId Native ${moduleName}.${methodName}() not found`);
};

Hippy.bridge.removeNativeCallback = () => {};
