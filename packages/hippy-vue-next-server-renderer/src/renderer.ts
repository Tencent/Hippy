/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import { getCurrentInstance, type App } from '@vue/runtime-core';
import { renderToString } from '@vue/server-renderer';
import type { HippyAppOptions } from '@hippy-vue-next/index';
import { getObjectNodeList } from './util';
import type {
  SsrNode,
  SsrNodeProps,
} from './index';

/**
 * SSR Request context type
 *
 * @public
 */
export interface SsrRequestContext {
  isIOS?: boolean;
  dimensions?: {
    screen: {
      width: number;
      height: number;
      statusBarHeight: number;
    }
  }
}

/**
 * SSR render options type
 */
interface SsrRenderOption {
  rootContainer: string;
  ssrOptions?: HippyAppOptions;
  context?: SsrRequestContext;
}

/**
 * merge default props to ssr node. some native node should have default props, so we need to add
 * to prop. the same logic with client runtime
 *
 * @param node - ssrNode
 * @param nodeList - ssrNodeList
 */
function mergeDefaultNativeProps(
  node: SsrNode,
  nodeList: SsrNode[],
): SsrNodeProps {
  const commonProps = { id: '', class: '' };
  let defaultNativeProps: SsrNodeProps = {};
  let eventMap;
  switch (node.name) {
    case 'ListView':
      defaultNativeProps = {
        // calculate child nums
        numberOfRows: nodeList.filter(v => v.pId === node.id).length,
      };
      // polyFillNativeEvents
      if (node.props.onEndReached || node.props.onLoadMore) {
        defaultNativeProps.onEndReached = true;
        defaultNativeProps.onLoadMore = true;
      }
      break;
    case 'Text':
      defaultNativeProps = { text: '' };
      break;
    case 'TextInput':
      defaultNativeProps = { underlineColorAndroid: 0 };
      if (node.tagName === 'textarea') {
        defaultNativeProps.numberOfLines = 5;
      }
      break;
    case 'ViewPager':
      defaultNativeProps = { initialPage: node.props.current };
      eventMap = {
        onDropped: 'onPageSelected',
        onDragging: 'onPageScroll',
        onStateChanged: 'onPageScrollStateChanged',
      };
      Object.keys(eventMap).forEach((v) => {
        if (Object.prototype.hasOwnProperty.call(node.props, v)) {
          defaultNativeProps[eventMap[v]] = node.props[v];
        }
      });
      break;
    case 'WebView':
      defaultNativeProps = {
        method: 'get',
        userAgent: '',
      };
      break;
    case 'Modal':
      defaultNativeProps = {
        transparent: true,
        immersionStatusBar: true,
        collapsable: false,
      };
      break;
    case 'Image':
      defaultNativeProps = {
        backgroundColor: 0,
      };
      break;
    default:
      break;
  }
  return Object.assign(commonProps, defaultNativeProps);
}

/**
 * get node's props. merge all props need to merged
 *
 * @param node - ssr node
 * @param nodeList - ssr node list
 * @param isIOS - client is iOS or not
 */
function getNodeProps(
  node: SsrNode,
  nodeList: SsrNode[],
  isIOS?: boolean,
): SsrNodeProps {
  let { props } = node;
  // merge all props
  props = {
    ...mergeDefaultNativeProps(node, nodeList),
    ...props,
    ...props.mergedProps,
  };
  delete props.mergedProps;
  // assign id and class to attribute props. id & class should use for devtools at client side
  // and use for ssr
  props.attributes = {
    id: props?.attributes?.id ?? props.id,
    class: props?.attributes?.class ?? props.class,
  };
  // delete unnecessary props
  delete props.id;
  delete props.class;
  delete props.attributes.style;
  delete props.attributes.text;

  // compatible iOS image src
  if (
    isIOS
    && node.name === 'Image'
    && props.src
  ) {
    props.source = [{ uri: props.src }];
    delete props.src;
  }

  return props;
}

/**
 * convert ssr node list to hippy node list, add props for every node
 *
 * @param nodeList - ssr node list
 * @param options - hippy context
 */
function convertToHippyNodeList(
  nodeList: SsrNode[],
  options: SsrRenderOption,
): SsrNode[] {
  return nodeList.map((item) => {
    // add props for every node
    const props = getNodeProps(item, nodeList, options?.context?.isIOS);
    return {
      ...item,
      props,
    };
  });
}

/**
 * flat hippy node tree to list structure
 *
 * @param parentNode - parent node
 * @param nodeList - flatted node list
 * @param pId - parent id
 * @param index - the index position of the current node among sibling nodes
 */
function treeToList(
  parentNode: SsrNode,
  nodeList: SsrNode[] = [],
  pId?: number,
  index?: number,
): SsrNode[] {
  // parent node
  nodeList.push({
    id: parentNode.id,
    pId: parentNode.pId ?? pId ?? 0,
    index: index ?? 0,
    name: parentNode.name,
    props: parentNode.props,
    tagName: parentNode.tagName,
  });
  // child node
  const { children } = parentNode;
  children?.forEach((v, i) => {
    // filter native do not display node
    let insertIndex = children.filter(c => c.name !== 'comment').indexOf(v);
    // record the comment node index as the serial number of the current
    // insertable child node, which is convenient for rebuilding the tree structure
    if (v.name === 'comment') {
      insertIndex = children
        .slice(0, i)
        .filter(c => c.name !== 'comment').length;
    }
    // handle all list
    treeToList(v, nodeList, parentNode.id, insertIndex);
  });

  return nodeList;
}

/**
 * create ssr root node
 *
 * @param rootContainer - id of root node
 */
function createSSRRootNode(rootContainer: string): SsrNode {
  return {
    id: 1, // root node id hardcode to 1
    pId: 0, // root node's parent id set to 0, reset at client side
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
 * key of ssr unique id
 */
export const SSR_UNIQUE_ID_KEY = 'ssrUniqueIdKey';

/**
 * generate unique id base on currentId. if no currentId provide. 1 will be the default value
 *
 * @param currentId - current used unique Id
 */
function generateUniqueId(currentId?: number): number {
  let ssrUniqueId = currentId;
  if (!ssrUniqueId) ssrUniqueId = 1;
  ssrUniqueId += 1;

  // ids divisible by 10 are used by the native
  if (ssrUniqueId % 10 === 0) {
    ssrUniqueId += 1;
  }

  return ssrUniqueId;
}

/**
 * generate hippy unique id at ssr. this is ssr helper
 *
 * @public
 */
export function ssrGetUniqueId(): number {
  const currentInstance = getCurrentInstance();
  const uniqueIdContext = currentInstance?.appContext?.provides[
    SSR_UNIQUE_ID_KEY
  ] as {
    ssrUniqueId?: number;
  };

  // generate unique id, and save in global context
  // unique id generated by current unique id
  uniqueIdContext.ssrUniqueId = generateUniqueId(uniqueIdContext?.ssrUniqueId);
  return uniqueIdContext.ssrUniqueId;
}

/**
 * get unique id at current vue app instance
 *
 * @param app - vue app instance
 *
 * @public
 */
export function getCurrentUniqueId(app: App): number {
  return app._context.provides[SSR_UNIQUE_ID_KEY].ssrUniqueId;
}

/**
 * convert hippy node list json string to hippy native node tree
 *
 * @param app - vue ssr app
 * @param options - ssr options
 *
 * @public
 */
export async function renderToHippyList(
  app: App,
  options: SsrRenderOption,
): Promise<SsrNode[] | null> {
  const startUniqueId = 1;
  const uniqueIdContext = { ssrUniqueId: startUniqueId };
  // An additional context needs to be provided here because ssrContext is mounted after
  // the render function is called, but ssrGetUniqueId will be called in the render function
  app.provide(SSR_UNIQUE_ID_KEY, uniqueIdContext);
  const { rootContainer } = options;
  // first, create root node with rootContainer.
  // In the non-hydration mode of the client, the rootContainer node is created by the client
  const rootNode = createSSRRootNode(rootContainer);
  // second, we get hippy native node list string generated by ssr
  const appContent = await renderToString(app, options);
  const ssrNodeTree = getObjectNodeList([appContent]);
  // render failure, return null
  if (!ssrNodeTree) {
    return null;
  }
  // third, make ssr node list as children of rootContainer
  rootNode.children = [ssrNodeTree];
  // flat node tree to array list
  const nodeList = treeToList(rootNode);
  // comment list append at the end
  const commentList = nodeList.filter(v => v.name === 'comment');
  // last, convert ssr node list to hippy node list, we add node props and return with comment list
  return convertToHippyNodeList(
    nodeList.filter(v => v.name !== 'comment'),
    options,
  ).concat(commentList);
}
