import { getCurrentInstance, type App } from '@vue/runtime-core';
import { renderToString } from '@vue/server-renderer';
import { unescapeHtml, isIOS } from './util';
import type {
  NeedToTyped,
  SsrNode,
  SsrCommonParams,
  SsrNodeProps,
} from './index';

/**
 * SSR Context type
 */
export interface SsrContext {
  rootContainer: string;
  hippyContext: SsrCommonParams;
  ssrOptions?: SsrCommonParams;
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
  // add default props for ul
  if (node.name === 'ListView') {
    defaultNativeProps = {
      // calculate child nums
      numberOfRows: nodeList.filter(v => v.pId === node.id).length,
    };
    // polyFillNativeEvents
    if (node.props.onEndReached || node.props.onLoadMore) {
      defaultNativeProps.onEndReached = true;
      defaultNativeProps.onLoadMore = true;
    }
  }

  // add default props for text node
  if (node.name === 'Text') {
    defaultNativeProps = { text: '' };
  }

  // add default props for swiper
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
 * get node's props. merge all props need to merged
 *
 * @param node - ssr node
 * @param nodeList - ssr node list
 * @param hippyContext - hippy context
 */
function getNodeProps(
  node: SsrNode,
  nodeList: SsrNode[],
  hippyContext: SsrCommonParams,
): SsrNodeProps {
  let { props } = node;
  // merge all props
  props = {
    ...mergeDefaultNativeProps(node, nodeList),
    ...props,
    ...props.mergedProps,
  };
  delete props.mergedProps;
  // assign id and class to attribute props.
  props.attributes = {
    id: props.id,
    class: props.class,
  };
  // delete unnecessary props
  delete props.id;
  delete props.class;
  delete props.hippyPid;
  delete props.attributes.style;
  delete props.attributes.text;

  // compatible iOS image src
  if (
    isIOS(hippyContext)
    && node.name === 'Image'
    && props.src
  ) {
    props.source = [{ uri: props.src }];
    delete props.src;
  }
  // decode html entity. hippy does not recognize html entity.
  if (props.text) {
    props.text = unescapeHtml(props.text);
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
  options: SsrContext,
): SsrNode[] {
  return nodeList.map((item) => {
    // add props for every node
    const props = getNodeProps(item, nodeList, options.hippyContext);
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
 * @param hippyContext - hippy ssr context
 */
function createSSRRootNode(rootContainer: string, hippyContext): SsrNode {
  return {
    id: 1, // root node id hardcode to 1
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
  options: SsrContext,
): Promise<SsrNode[] | null> {
  const startUniqueId = 1;
  const uniqueIdContext = { ssrUniqueId: startUniqueId };
  // An additional context needs to be provided here because ssrContext is mounted after
  // the render function is called, but ssrGetUniqueId will be called in the render function
  app.provide(SSR_UNIQUE_ID_KEY, uniqueIdContext);
  // first, we get hippy native node list string generated by ssr
  const appContent = await renderToString(app, options);
  // remove unnecessary punctuation
  const parseStr = appContent
    .replaceAll(/,}/g, '}')
    .replace(/,]/g, ']')
    .replace(/,$/, '');
  const { rootContainer, hippyContext } = options;
  // second, create root node with rootContainer.
  // In the non-hydration mode of the client, the rootContainer node is created by the client
  const rootNode = createSSRRootNode(rootContainer, hippyContext);
  let ssrNodeTree: NeedToTyped;
  try {
    // parse json string to json object
    ssrNodeTree = JSON.parse(parseStr.replace(/\n/g, '\\n').replace(/\r/g, '\\r'));
  } catch (e) {
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
