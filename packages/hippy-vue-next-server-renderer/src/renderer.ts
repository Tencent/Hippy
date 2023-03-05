import type {
  NeedToTyped,
  SsrNode,
  SsrCommonParams,
  SsrNodeProps,
} from '@tencent/hippy-vue-next-shared';
import { unescapeHtml } from '@tencent/hippy-vue-next-shared';
import { getCurrentInstance, type App } from '@vue/runtime-core';
import { renderToString } from '@vue/server-renderer';

/**
 * Hippy Node 类型
 */
export type HippyNode = SsrNode;

/**
 * SSR Context 类型
 */
export interface SsrContext {
  rootContainer: string;
  hippyContext: SsrCommonParams;
  ssrOptions?: SsrCommonParams;
}

/**
 * 为 SSR Node Merge 对应节点类型的默认 props
 *
 * @param node - 需要 merge props 的 ssr node
 * @param nodeList - 待处理的 ssr node 列表
 * @param hippyContext - hippy 终端的 context
 */
function mergeDefaultNativeProps(
  node: SsrNode,
  nodeList: SsrNode[],
  hippyContext: SsrNodeProps,
): SsrNodeProps {
  const commonProps = { id: '', class: '' };
  let defaultNativeProps: SsrNodeProps = {};
  // 给 ul 添加默认 props
  if (node.name === 'ListView') {
    defaultNativeProps = {
      numberOfRows: nodeList.filter((v) => v.pId === node.id).length,
    }; // 计算子节点数量
    // polyFillNativeEvents
    if (node.props.onEndReached || node.props.onLoadMore) {
      defaultNativeProps.onEndReached = true;
      defaultNativeProps.onLoadMore = true;
    }
  }

  // 给 li 添加默认 polyFillNativeEvents
  if (node.name === 'ListViewItem') {
    if (
      node.props.onDisappear &&
      hippyContext?.device.platform.OS === 'android'
    ) {
      // eslint-disable-next-line no-param-reassign
      delete node.props.onDisappear;
      defaultNativeProps = { onDisAppear: true };
    }
  }

  // 给文本节点添加默认props，p,span,label
  if (node.name === 'Text') {
    defaultNativeProps = { text: '' };
  }

  // 给 swiper 添加默认 props
  if (node.name === 'ViewPager') {
    defaultNativeProps = { initialPage: node.props.current };
    const eventMap = {
      onDropped: 'onPageSelected',
      onDragging: 'onPageScroll',
      onStateChanged: 'onPageScrollStateChanged',
    };
    Object.keys(eventMap).forEach((v) => {
      if (Object.prototype.hasOwnProperty.call(node.props, v)) {
        defaultNativeProps[eventMap[v]] = node.props[v];
      }
    });
  }

  return Object.assign(commonProps, defaultNativeProps);
}

/**
 * 获取节点的 props，需要合并默认 props，以及额外 props
 *
 * @param node - 需要获取属性的 node
 * @param nodeList - 待处理的 node 列表
 * @param hippyContext - hippy 客户端 context
 */
function getNodeProps(
  node: SsrNode,
  nodeList: SsrNode[],
  hippyContext: SsrCommonParams,
): SsrNodeProps {
  let { props } = node;
  // 根据优先级，merge 节点的默认props、自身 props、mergedProps
  props = {
    ...mergeDefaultNativeProps(node, nodeList, hippyContext),
    ...props,
    ...props.mergedProps,
  };
  delete props.mergedProps;

  // 将节点 id 和 class 属性赋值给 attributes，用于样式匹配计算
  // fixme 这里应该只是开发环境需要给 attributes 增加 id 和 class 用于 element 调试，待了解清楚用处后改为仅 dev 模式添加
  props.attributes = {
    id: props.id,
    class: props.class,
  };
  // 移除客户端节点无需的 props
  delete props.id;
  delete props.class;
  delete props.hippyPid;
  delete props.attributes.style;
  delete props.attributes.text;

  // ios组件适配
  if (
    hippyContext?.device.platform.OS === 'ios' &&
    node.name === 'Image' &&
    props.src
  ) {
    props.source = [{ uri: props.src }];
    delete props.src;
  }

  // 对 text 内容进行 html 实体解码处理
  if (props.text) {
    props.text = unescapeHtml(props.text);
  }

  return props;
}

/**
 * 将 SSR Node List 转化为 Hippy Node List
 *
 * @param nodeList - 待转换的 ssr node list
 * @param options - hippy context
 */
function convertToHippyNodeList(
  nodeList: SsrNode[],
  options: SsrContext,
): HippyNode[] {
  // 样式匹配操作在客户端进行
  return nodeList.map((item) => {
    // 给 ssr 节点加上 hippy node 所需的 props
    const props = getNodeProps(item, nodeList, options.hippyContext);
    return {
      ...item,
      props,
    };
  });
}

/**
 * 将树结构的节点树拍平为列表结构
 *
 * @param parentNode - 树的父节点
 * @param nodeList - 拍平后的节点列表
 * @param pId - 父节点的 id
 * @param index - 当前节点在兄弟节点中的索引位置
 */
function treeToList(
  parentNode: SsrNode,
  nodeList: SsrNode[] = [],
  pId?: number,
  index?: number,
): SsrNode[] {
  // 首先保存父节点
  nodeList.push({
    id: parentNode.id,
    pId: parentNode.pId ?? pId ?? 0,
    index: index ?? 0,
    name: parentNode.name,
    props: parentNode.props,
    tagName: parentNode.tagName,
  });
  // 然后将子节点保存
  const { children } = parentNode;
  children?.forEach((v, i) => {
    // index 需要过滤掉终端不展示的节点
    let insertIndex = children.filter((c) => c.name !== 'comment').indexOf(v);
    // 记录评论节点 index 为当前可插入子节点的序号,方便重建 tree 结构
    if (v.name === 'comment') {
      insertIndex = children
        .slice(0, i)
        .filter((c) => c.name !== 'comment').length;
    }
    // 递归对所有子节点进行保存处理
    treeToList(v, nodeList, parentNode.id, insertIndex);
  });
  // 返回拍平后的节点列表
  return nodeList;
}

/**
 * 生成服务端节点树根节点
 *
 * @param rootContainer - 根节点的 id 标识
 * @param hippyContext - hippy 客户端的 context
 */
function createSSRRootNode(rootContainer: string, hippyContext): SsrNode {
  return {
    id: 1, // root 节点 id hardcode 为 1
    pId: hippyContext.superProps.__instanceId__,
    index: 0,
    name: 'View',
    props: {
      style: { flex: 1 },
      attributes: { id: rootContainer, class: '' },
    },
    tagName: 'div',
  };
}

/**
 * 服务端保存节点唯一 ID 的 key
 */
export const SSR_UNIQUE_ID_KEY = 'ssrUniqueIdKey';

/**
 * 生成唯一 ID，如果没有默认值，则从 2 开始，1 是作为 rootContainer 的 ID
 *
 * @param currentId - 当前请求已经生成的唯一 ID 的值
 */
function generateUniqueId(currentId?: number): number {
  let ssrUniqueId = currentId;
  if (!ssrUniqueId) ssrUniqueId = 1;
  ssrUniqueId += 1;

  // 被 10 整除的 id 是终端使用的，前端不使用
  if (ssrUniqueId % 10 === 0) {
    ssrUniqueId += 1;
  }

  return ssrUniqueId;
}

/**
 * 服务端获取新的 hippy native 唯一 ID
 */
export function ssrGetUniqueId(): number {
  // 首先获取当前请求上下文保存的唯一 ID 值
  const currentInstance = getCurrentInstance();
  const uniqueIdContext = currentInstance?.appContext?.provides[
    SSR_UNIQUE_ID_KEY
  ] as {
    ssrUniqueId?: number;
  };

  // 将当前请求作为默认值传入生成唯一 ID
  // 然后将唯一 ID 保存至当前请求的唯一 ID 标识，供全局使用
  uniqueIdContext.ssrUniqueId = generateUniqueId(uniqueIdContext?.ssrUniqueId);
  return uniqueIdContext.ssrUniqueId;
}

/**
 * 获取当前 Vue 实例所使用的 SSR 的唯一 ID 的值
 *
 * @param app - vue app 实例
 */
export function getCurrentUniqueId(app: App): number {
  return app._context.provides[SSR_UNIQUE_ID_KEY].ssrUniqueId;
}

/**
 * 将 hippy node list json string 转换组装为客户端可上屏的 native node tree
 *
 * @param app - vue ssr app
 * @param options - 渲染选项
 */
export async function renderToHippyList(
  app: App,
  options: SsrContext,
): Promise<HippyNode[] | null> {
  const startUniqueId = 1;
  const uniqueIdContext = { ssrUniqueId: startUniqueId };
  // 这里需要额外提供一个context 因为ssrContext是在render函数调用之后才被挂载,但是ssrGetUniqueId会在render函数里调用
  app.provide(SSR_UNIQUE_ID_KEY, uniqueIdContext);
  // 首先得到 vue component 渲染出来的 hippy native node list string
  // fixme 注意这里因为不同版本 vue 的类型问题，导致 App 类型不匹配，因此作为 NeedToTyped 传入
  const appContent = await renderToString(app as NeedToTyped, options);
  const parseStr = appContent
    .replaceAll(/,}/g, '}')
    .replace(/,]/g, ']')
    .replace(/,$/, '');
  const { rootContainer, hippyContext } = options;
  // 创建根节点，因为 ssr 渲染出来的默认是没有 rootContainer 节点的，因此需要我们自行创建
  // 客户端非注水模式下是由客户端创建 rootContainer 节点
  const rootNode = createSSRRootNode(rootContainer, hippyContext);
  let ssrNodeTree: NeedToTyped;
  try {
    // 将 json string 的 node list 转为 json
    ssrNodeTree = JSON.parse(
      parseStr.replace(/\n/g, '\\n').replace(/\r/g, '\\r'),
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('renderToString parseStr:', parseStr);
    // eslint-disable-next-line no-console
    console.log('renderToString parse error: ', e);
    return null;
  }
  // 组装好渲染树，将 ssr node list 作为 rootContainer 的子节点
  rootNode.children = [ssrNodeTree];
  // 将树结构拍平
  const nodeList = treeToList(rootNode);
  // 评论列表单独附在列表最后返回
  const commentList = nodeList.filter((v) => v.name === 'comment');
  // 将 ssr node list 转化为 hippy node list
  // 给 ssr node 添加 native props 和 style，并组合 comment 节点列表后一起返回
  return convertToHippyNodeList(
    nodeList.filter((v) => v.name !== 'comment'),
    options,
  ).concat(commentList);
}
