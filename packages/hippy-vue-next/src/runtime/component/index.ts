/**
 * hippy模版组件处理模块
 *
 * 比如我们模版中会包含div/ul/hi-swiper等dom或hippy内置tag，这些tag都属于HippyNode，
 * 但是这些tag所对应的Native的类型是不同的，而且我们需要支持扩展Native类型。因此这些类型相关
 * 的定义和兼容处理不能定义在node或者element中，而且这些类型相关的标签某种意义上，类似于vue component，
 * 所以我们定义了component模块来统一处理，在这里进行tag to Native Type的统一注册，统一的默认参数，事件
 * 处理等等
 *
 * todo 组件信息是在节点内获取，还是使用的地方获取，这是一个问题，倾向于根节点一起，毕竟tag还是关联节点的
 *
 */
import { normalizeTagName } from '../../util';
import type { EventsUnionType, HippyEvent } from '../event/hippy-event';
import type { NativeNodeProps } from '../native/native-node';

/** tag所属组件信息的类型 */
export interface TagComponent {
  // Native实际渲染的组件的类型，如View，TextView等
  name: string;
  // 额外事件处理方法，如果存在的话，事件相应时需要调用
  processEventData?: (
    evtData: EventsUnionType,
    nativeEventParams: any,
  ) => HippyEvent;
  // 事件Map，比如我们Dom的touchStart，在native这边实际是onTouchDown事件
  eventNamesMap?: Map<string, string>;
  // 组件默认都需要加上的样式
  defaultNativeStyle?: NativeNodeProps;
  // 组件默认都需要加上的props
  defaultNativeProps?: NativeNodeProps;
  // Native节点的属性，优先级最高
  nativeProps?: NativeNodeProps;
  // 属性Map，对属性做map处理
  attributeMaps?: NativeNodeProps;
}

// 保存注册的tag信息
const tagMap = new Map();

/**
 * 给指定tag注册组件信息
 *
 * @param tagName - 标签名
 * @param component - 标签所属组件
 */
export function registerHippyTag(
  tagName: string,
  component: TagComponent,
): void {
  if (!tagName) {
    throw new Error('tagName can not be empty');
  }

  // 标准化标签名
  const normalizedTagName = normalizeTagName(tagName);

  // 已注册的无需再次注册
  if (!tagMap.has(normalizedTagName)) {
    // 合并组件默认信息 todo

    // 保存组件
    tagMap.set(normalizedTagName, component);
  }
}

/**
 * 获取指定tag的组件信息
 *
 * @param tagName - 标签名
 */
export function getTagComponent(tagName: string): TagComponent {
  return tagMap.get(tagName);
}
