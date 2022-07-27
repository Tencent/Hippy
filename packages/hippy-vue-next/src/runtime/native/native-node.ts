/** Hippy Native Node Props 类型，包括属性，事件，样式等等 */
// type NativeNodeProps = NativeNodeNativeProps | NativeNodeEvent | NativeNodeStyle & NativeNodeDebugProps;
export interface NativeNodeProps {
  // 这里使用any的原因是props可能有任意类型，包括string，number，boolean，object，function，array等
  // todo 能否使用 unknown 能其他类型处理，需要研究
  [key: string]: any;
}

/** Hippy Native Node 类型 */
export interface NativeNode {
  // native节点唯一id
  id: number;
  // 父节点id
  pId: number;
  // 当前节点在兄弟节点中的位置
  index: number;
  // Native的View名称，如View，SwiperView等
  name?: string;
  // 节点标签名，如div，li等，用于inspector调试
  tagName?: string;
  // props属性，包括props，样式，事件
  props?: NativeNodeProps;
}
