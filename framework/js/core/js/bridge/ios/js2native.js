const getModuleName = (originModuleName) => {
  if (originModuleName === 'UIManagerModule') {
    return 'UIManager';
  }

  if (originModuleName === 'StorageModule') {
    return 'AsyncStorage';
  }

  return originModuleName;
};

const getMethodName = (originMethodName, setName) => {
  if (setName) {
    return setName;
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

const needReject = (moduleName, methodName) => {
  if (moduleName === 'StorageModule' || methodName === 'multiGet') {
    return false;
  }
  return true;
};

const needResolve = () => true;

Hippy.bridge.callNative = (...callArguments) => {
  if (callArguments.length < 2) {
    throw new TypeError('Arguments length must be larger than 2');
  }

  if (callArguments.length === 2) {
    const NativeModule = __GLOBAL__.NativeModules[getModuleName(callArguments[0])];
    if (NativeModule && NativeModule[getMethodName(callArguments[1])]) {
      NativeModule[getMethodName(callArguments[1])]();
      return;
    }
  } else if (callArguments[0] === 'UIManagerModule' && callArguments[1] === 'callUIFunction') {
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
    let setName = '';
    if (callArguments[0] === 'UIManagerModule' && callArguments[1] === 'createNode') {
      setName = 'createView';
    } else if (callArguments[0] === 'UIManagerModule' && callArguments[1] === 'updateNode') {
      setName = 'updateView';
    } else if (callArguments[0] === 'UIManagerModule' && callArguments[1] === 'deleteNode') {
      setName = 'manageChildren';
    }

    const NativeModule = __GLOBAL__.NativeModules[getModuleName(callArguments[0])];

    if (NativeModule && NativeModule[getMethodName(callArguments[1], setName)]) {
      const callModuleMethod = NativeModule[getMethodName(callArguments[1], setName)];
      const param = [];
      for (let i = 2; i < callArguments.length; i += 1) {
        param.push(callArguments[i]);
      }

      if (callArguments[0] === 'UIManagerModule' && callArguments[1] === 'createNode') {
        const { setChildren } = __GLOBAL__.NativeModules.UIManager;
        const uiList = [];

        param[1].forEach((uiItem) => {
          const nativeProps = Object.assign(uiItem.props, uiItem.props.style);
          delete nativeProps.style;

          const uiParam = [uiItem.id, getComponentName(uiItem.name), param[0], nativeProps];

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

            if (uiItem.pId > siblingPid) {
              return false;
            }
            return true;
          });

          siblingList.sort((a, b) => a.index - b.index);

          const insertChildIds = [];
          siblingList.forEach((item) => {
            insertChildIds.push(item.id);
          });

          if (__GLOBAL__.IosNodeTree[siblingPid]
              && __GLOBAL__.IosNodeTree[siblingPid].length > 0) {
            const addChildTags = [];
            const addChildIndexs = [];

            let offsetIndex = 0;
            if (siblingList[0].index > __GLOBAL__.IosNodeTree[siblingPid].length) {
              offsetIndex = siblingList[0].index - __GLOBAL__.IosNodeTree[siblingPid].length;
            }

            siblingList.forEach((item) => {
              addChildTags.push(item.id);
              addChildIndexs.push((item.index - offsetIndex));

              __GLOBAL__.IosNodeTree[siblingPid].splice(item.index, 0, item.id);
            });

            __GLOBAL__.NativeModules.UIManager.manageChildren(
              siblingPid, undefined, undefined,
              addChildTags, addChildIndexs, undefined,
            );
          } else {
            setChildren(siblingPid, insertChildIds);

            let cacheIds;
            try {
              cacheIds = JSON.parse(JSON.stringify(insertChildIds));
            } catch (e) {
              cacheIds = [];
              insertChildIds.forEach((id) => {
                cacheIds.push(id);
              });
            }

            if (__GLOBAL__.IosNodeTree[siblingPid]) {
              __GLOBAL__.IosNodeTree[siblingPid] = __GLOBAL__.IosNodeTree[
                siblingPid].concat(cacheIds);
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
        const nativeParam = getParam(callArguments[0], callArguments[1], param);

        if (callArguments[0] !== 'UIManagerModule' || callArguments[1] !== 'deleteNode' || nativeParam) {
          callModuleMethod.apply(NativeModule, nativeParam);
        }
      }

      return;
    }
  }

  throw new ReferenceError(`Native ${callArguments[0]}.${callArguments[1]}() not found`);
};

Hippy.bridge.callNativeWithPromise = (...callArguments) => {
  if (callArguments.length < 2) {
    throw new TypeError('Arguments length must be 2');
  }

  const NativeModule = __GLOBAL__.NativeModules[getModuleName(callArguments[0])];

  if (NativeModule && NativeModule[getMethodName(callArguments[1])]) {
    const callModuleMethod = NativeModule[getMethodName(callArguments[1])];
    const param = [];
    for (let i = 2; i < callArguments.length; i += 1) {
      param.push(callArguments[i]);
    }

    if (callModuleMethod.type === 'promise') {
      return callModuleMethod.apply(NativeModule, getParam(callArguments[0], callArguments[1], param));
    }

    return new Promise((resolve, reject) => {
      if (needReject(callArguments[0], callArguments[1])) {
        param.push(reject);
      }
      if (needResolve(callArguments[0], callArguments[1])) {
        param.push(resolve);
      }

      callModuleMethod.apply(NativeModule, getParam(callArguments[0], callArguments[1], param));
    });
  }

  return Promise.reject(new ReferenceError(`Native ${callArguments[0]}.${callArguments[1]}() not found`));
};

Hippy.bridge.callNativeWithCallbackId = (...callArguments) => {
  if (callArguments.length < 3) {
    throw new TypeError('Arguments length must be larger than 3');
  }

  if (callArguments.length === 3) {
    const NativeModule = __GLOBAL__.NativeModules[getModuleName(callArguments[0])];
    if (NativeModule && NativeModule[getMethodName(callArguments[1])]) {
      if (callArguments[2] === false) {
        return NativeModule[getMethodName(callArguments[1])]({
          notDelete: true,
        });
      }
      return NativeModule[getMethodName(callArguments[1])]();
    }
  } else {
    const NativeModule = __GLOBAL__.NativeModules[getModuleName(callArguments[0])];
    if (NativeModule && NativeModule[getMethodName(callArguments[1])]) {
      const callModuleMethod = NativeModule[getMethodName(callArguments[1])];
      const param = [];
      for (let i = 3; i < callArguments.length; i += 1) {
        param.push(callArguments[i]);
      }

      const currentCallId = __GLOBAL__.moduleCallId;
      __GLOBAL__.moduleCallId += 1;
      let nativeParam = [];
      if (callArguments[2] === false) {
        nativeParam.push({
          notDelete: true,
        });
      }
      nativeParam.push(currentCallId);
      nativeParam = nativeParam.concat(param);

      callModuleMethod.apply(
        NativeModule,
        getParam(callArguments[0], callArguments[1], nativeParam),
      );

      return currentCallId;
    }
  }

  throw new ReferenceError(`Native ${callArguments[0]}.${callArguments[1]}() not found`);
};

Hippy.bridge.removeNativeCallback = () => {};
