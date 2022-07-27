/** 定义Hippy Instance 缓存的格式 */
import type { ComponentPublicInstance, App } from '@vue/runtime-core';

/**
 * @public
 *
 * Hippy 缓存实例的类型接口
 */
export interface HippyCachedInstanceType {
  // 业务方传入的root container id，通常是root
  rootContainer?: string;
  // Native初始化的root view的id
  rootViewId: number;
  // 项目初始化参数，由终端传入，类型未定
  superProps: any;
  // 保存当前所使用的Vue app 实例
  app: App;
  // 保存Vue app实例mount之后得到的ComponentPublicInstance
  instance?: ComponentPublicInstance;
  // 设计稿基准宽度
  ratioBaseWidth: number;
}

// 缓存hippy instance实例
let hippyCachedInstance: HippyCachedInstanceType;

/**
 * 获取保存的hippy实例
 */
export function getHippyCachedInstance(): HippyCachedInstanceType {
  return hippyCachedInstance;
}

/**
 * 缓存hippy实例
 *
 * @param instance - hippy app 实例
 */
export function setHippyCachedInstance(instance: HippyCachedInstanceType): void {
  hippyCachedInstance = instance;
}

/**
 * 缓存hippy实例的某个key，key的类型是string，value
 * 是HippyCachedInstance的类型之一
 *
 * @param key - hippy app 缓存实例的key
 * @param value - 缓存的值
 */
export function setHippyCachedInstanceParams<
  K extends keyof HippyCachedInstanceType,
>(key: K, value: HippyCachedInstanceType[K]): void {
  hippyCachedInstance[key] = value;
}
