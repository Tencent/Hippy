global.hippyBridge = (_action, _callObj) => {
  let resp = 'success';

  let action = _action;
  let callObj = _callObj;

  if (action === 'pauseInstance') {
    action = 'callJsModule';
    callObj = {
      methodName: 'receiveNativeEvent',
      moduleName: 'EventDispatcher',
      params: ['@hippy:pauseInstance', null],
    };
  }

  if (action === 'resumeInstance') {
    action = 'callJsModule';
    callObj = {
      methodName: 'receiveNativeEvent',
      moduleName: 'EventDispatcher',
      params: ['@hippy:resumeInstance', null],
    };
  }

  switch (action) {
    case 'loadInstance': {
      if (__GLOBAL__.appRegister[callObj.name]) {
        Object.assign(callObj.params, {
          __instanceName__: callObj.name,
          __instanceId__: callObj.id,
        });

        Object.assign(__GLOBAL__.appRegister[callObj.name], {
          id: callObj.id,
          superProps: callObj.params,
        });

        const EventModule = __GLOBAL__.jsModuleList.EventDispatcher;
        if (EventModule && typeof EventModule.receiveNativeEvent === 'function') {
          const params = ['@hp:loadInstance', callObj.params];
          EventModule.receiveNativeEvent(params);
        }

        __GLOBAL__.appRegister[callObj.name].run(callObj.params);
      } else {
        resp = `error: ${callObj.name} is not regist in js`;
        throw Error(resp);
      }
      break;
    }
    case 'callBack': {
      if (callObj.result === 1) {
        resp = 'error: native no modules';
      } else if (callObj.callId && callObj.moduleName === 'AnimationFrameModule' && callObj.moduleFunc === 'requestAnimationFrame') {
        __GLOBAL__.canRequestAnimationFrame = true;

        if (__GLOBAL__.requestAnimationFrameQueue[callObj.callId]) {
          __GLOBAL__.requestAnimationFrameQueue[callObj.callId].forEach((cb) => {
            if (typeof cb === 'function') {
              cb(callObj.params);
            }
          });

          delete __GLOBAL__.requestAnimationFrameQueue[callObj.callId];
        }
      } else if (callObj.callId && __GLOBAL__.moduleCallList[callObj.callId]) {
        const callbackObj = __GLOBAL__.moduleCallList[callObj.callId];
        if (callObj.result !== 0 && typeof callbackObj.reject === 'function') {
          callbackObj.reject(callObj.params);
        } else {
          callbackObj.cb(callObj.params);
        }
        if (callbackObj.type === 0 || callbackObj.type === 1) {
          delete __GLOBAL__.moduleCallList[callObj.callId];
        }
      } else {
        resp = 'error: calljs id is not regist in js';
      }
      break;
    }
    case 'callJsModule': {
      if (!callObj || !callObj.moduleName || !callObj.methodName) {
        resp = 'error: callJsModule param invalid';
      } else {
        const targetModule = __GLOBAL__.jsModuleList[callObj.moduleName];
        if (!targetModule || typeof targetModule[callObj.methodName] !== 'function') {
          resp = 'error: callJsModule targetting an undefined module or method';
        } else {
          targetModule[callObj.methodName](callObj.params);
        }
      }
      break;
    }
    case 'destroyInstance': {
      global.Hippy.emit('destroyInstance', callObj);
      const renderId = Date.now().toString();
      Hippy.bridge.callNative('UIManagerModule', 'startBatch', renderId);
      Hippy.bridge.callNative('UIManagerModule', 'deleteNode', callObj, [{ id: callObj }]);
      Hippy.bridge.callNative('UIManagerModule', 'endBatch', renderId);
      delete __GLOBAL__.nodeIdCache[callObj];
      delete __GLOBAL__.nodeTreeCache[callObj];
      __GLOBAL__.destroyInstanceList[callObj] = true;
      break;
    }
    default: {
      resp = 'error: action not define';
      break;
    }
  }

  return resp;
};
