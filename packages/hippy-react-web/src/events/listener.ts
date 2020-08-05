import HippyEventEmitter from './emitter';

const ee = require('event-emitter');
const allOff = require('event-emitter/all-off');

interface HippyEventListener {
  eventName: string;
  evenInstance: any;
  nextIdForHandler: number;
  handlerContainer: Map<string, {
    id:number;
    eventHandler: Function;
    context: any;
  }>

}

function getKeyforHandler(id: number) {
  if (typeof id !== 'number') {
    throw new TypeError('Invalid arguments');
  }
  return `handler_${id}`;
}


class HippyEventListener  implements HippyEventListener {
  constructor(event: string) {
    this.eventName = event;
    this.evenInstance = ee();
    this.nextIdForHandler = 0;
    this.handlerContainer = new Map();
    // eslint-disable-next-line max-len
    // 将该listener实例绑定到emitter的类属性中，方便同步new HippyEventListener以及直接调用emitter的addListener两种方法创建的listener实例。
    HippyEventEmitter.AllHippyEventListeners.set(`eventEmitter_${event}`, this);
  }

  // 添加回调函数
  public addCallback(handleFunc: Function, callContext?: any) {
    if (typeof handleFunc !== 'function') {
      throw new TypeError('Invalid arguments');
    }
    // 存储这次回调函数的值
    const currId = this.nextIdForHandler;
    this.nextIdForHandler += 1;
    // test
    const callback = handleFunc.bind(callContext);
    this.handlerContainer.set(getKeyforHandler(currId), {
      id: currId,
      eventHandler: callback,
      context: callContext,
    });
    // 为该事件添加回调
    this.evenInstance.on(this.eventName, callback);
    // 返回用来获取回调函数的id
    return currId;
  }

  // 删除事件回调函数
  public removeCallback(callbackId: number) {
    if (typeof callbackId !== 'number') {
      throw new TypeError('Invalid arguments');
    }
    const handlerKey = getKeyforHandler(callbackId);
    const handler = this.handlerContainer.get(handlerKey);
    if (handler) {
      const { eventHandler } = handler;
      // console.log(typeof eventHandler, eventHandler);
      this.evenInstance.off(this.eventName, eventHandler);
      this.handlerContainer.delete(handlerKey);
    }
  }

  // 取消事件的注册
  public unregister() {
    // 直接清空回调函数
    allOff(this.evenInstance);
    // 初始化序列号
    this.nextIdForHandler = 0;
    // 清空回调函数
    // this.handlerContainer.forEach((value, key) => {
    //   this.handlerContainer.delete(key);
    // });
    this.handlerContainer.clear();
  }

  // 获取事件回调函数个数
  public getSize() {
    return this.handlerContainer.size;
  }
}

export default HippyEventListener;
