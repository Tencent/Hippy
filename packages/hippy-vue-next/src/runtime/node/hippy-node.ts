import type { CallbackType } from '../../../global';
import { getUniqueId, DEFAULT_ROOT_ID } from '../../util';
import { getHippyCachedInstance } from '../../util/instance';
import type { TagComponent } from '../component';
import type { HippyEvent } from '../event/hippy-event';
import { HippyEventTarget } from '../event/hippy-event-target';
import type { NativeNode } from '../native/native-node';
import {
  renderInsertChildNativeNode,
  renderRemoveChildNativeNode,
  renderUpdateChildNativeNode,
} from '../render';

export enum NodeType {
  ElementNode = 1,
  TextNode,
  CommentNode,
  DocumentNode,
}

function needInsertToNative(nodeType: NodeType): boolean {
  return nodeType === NodeType.ElementNode;
}

/**
 * HippyNode节点基类，包含了构建树结构Node所需的基本的Node操作方法，属性
 * 继承自EventTarget类
 *
 * @public
 */
export class HippyNode extends HippyEventTarget {
  /**
   * 获取唯一节点id，用于终端Native节点唯一标识
   */
  private static getUniqueNodeId(): number {
    return getUniqueId();
  }

  // 节点是否需要插入Native
  public isNeedInsertToNative: boolean;

  // 节点是否已插入Native
  public isMounted = false;

  // 节点的终端id，需要在constructor中赋值
  public nodeId: number;

  // 节点类型
  public nodeType: NodeType;

  // 孩子节点
  public childNodes: HippyNode[] = [];

  // 父节点
  public parentNode: HippyNode | null = null;

  // 前兄弟节点
  public prevSibling: HippyNode | null = null;

  // 后兄弟节点
  public nextSibling: HippyNode | null = null;

  // 节点所属tag的Native组件信息
  protected tagComponent: TagComponent | null = null;

  constructor(nodeType: NodeType) {
    super();

    // 给节点唯一id，用于终端Native节点标识
    this.nodeId = HippyNode.getUniqueNodeId();

    this.nodeType = nodeType;

    // 节点是否需要插入Native，比如text节点、comment节点无需插入Native
    this.isNeedInsertToNative = needInsertToNative(nodeType);
  }

  /**
   * 获取第一个孩子节点
   */
  public get firstChild(): HippyNode | null {
    return this.childNodes.length ? this.childNodes[0] : null;
  }

  /**
   * 获取最后一个孩子节点
   */
  public get lastChild(): HippyNode | null {
    const len = this.childNodes.length;

    return len ? this.childNodes[len - 1] : null;
  }

  /**
   * 获取节点所属tag的组件信息
   */
  public get component(): TagComponent {
    return this.tagComponent as TagComponent;
  }

  /**
   * 获取本节点在兄弟节点中的索引，从零开始
   */
  public get index(): number {
    let index = 0;

    if (this.parentNode) {
      // 不需要插入Native的节点需要过滤掉
      const needInsertToNativeChildNodes: HippyNode[] = this.parentNode.childNodes
        .filter(node => node.isNeedInsertToNative);
      index = needInsertToNativeChildNodes.indexOf(this);
    }

    return index;
  }

  /**
   * 当前节点是否是根节点
   */
  public isRootNode(): boolean {
    // 节点nodeId等于根节点的nodeId 或者 节点的id等于根节点的id（即初始化传入的rootView）
    return this.nodeId === DEFAULT_ROOT_ID;
  }

  /**
   * 添加子节点
   *
   * @param rawChild - 需要添加的子节点
   */
  public appendChild(rawChild: HippyNode): void {
    const child = rawChild;

    if (!child) {
      throw new Error('No child to append');
    }

    if (child.parentNode && child.parentNode !== this) {
      // 在vue3的keep-alive实现中，会出现这里的问题 todo
      throw new Error('Can\'t append child, because the node already has a different parent');
    }

    // 如果节点已经存在，则先移除
    if (child.isMounted) {
      this.removeChild(child);
    }

    // 保存节点的parentNode
    child.parentNode = this;

    // 修改最后child的引用
    if (this.lastChild) {
      child.prevSibling = this.lastChild;
      this.lastChild.nextSibling = child;
    }

    // 添加子节点
    this.childNodes.push(child);

    // 调用native接口插入节点
    this.insertChildNativeNode(child);
  }

  /**
   * 将子节点插入到指定节点之前
   *
   * @param rawChild - 需要插入的孩子节点
   * @param rawAnchor - 需要插入的节点的参照物节点
   */
  public insertBefore(rawChild: HippyNode, rawAnchor: HippyNode | null): void {
    const child = rawChild;
    const anchor = rawAnchor;

    if (!child) {
      throw new Error('No child to insert');
    }

    // 无锚点则插入到最后
    if (!anchor) {
      this.appendChild(child);
      return;
    }

    if (child.parentNode !== null && child.parentNode !== this) {
      // 要插入的子节点已经有父节点了，不予插入
      throw new Error('Can not insert child, because the child node is already has a different parent');
    }

    // 需要插入child的父节点
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let parentNode: HippyNode = this;
    if (anchor.parentNode !== this) {
      // 插入到父节点为其他节点的锚点
      parentNode = anchor.parentNode as HippyNode;
    }

    // anchor在子节点中的位置
    const index = parentNode.childNodes.indexOf(anchor);

    // 保存父节点
    child.parentNode = parentNode;
    // 保存兄弟节点
    child.nextSibling = anchor;
    child.prevSibling = parentNode.childNodes[index - 1];

    // 如果前一个兄弟节点存在，则将前一个节点的下一个兄弟节点设为child
    if (parentNode.childNodes[index - 1]) {
      parentNode.childNodes[index - 1].nextSibling = child;
    }

    // 锚点的前一个兄弟节点为child
    anchor.prevSibling = child;

    // 往要插入节点的父节点的子节点列表中插入child
    parentNode.childNodes.splice(index, 0, child);

    // 将节点插入native
    this.insertChildNativeNode(child);
  }

  /**
   * 移动子节点到指定节点之前
   *
   * @param rawChild - 需要移动的孩子节点
   * @param rawAnchor - 需要移动的节点的参照物节点
   */
  // eslint-disable-next-line complexity
  public moveChild(rawChild: HippyNode, rawAnchor: HippyNode | null): void {
    const child = rawChild;
    const anchor = rawAnchor;

    if (!child) {
      throw new Error('No child to move');
    }

    // 无锚点则插入到最后
    if (!anchor) {
      this.appendChild(child);
      return;
    }

    if (child.parentNode !== null && child.parentNode !== this) {
      // 要插入的子节点已经有父节点了，不予玉栋
      throw new Error('Can not move child, because the child node is already has a different parent');
    }

    if (child.parentNode && child.parentNode !== this) {
      throw new Error('Can\'t move child, because it already has a different parent');
    }

    const oldIndex = this.childNodes.indexOf(child);
    const newIndex = this.childNodes.indexOf(anchor);

    // 位置一样，无需移动
    if (newIndex === oldIndex) {
      return;
    }

    // 重新设置兄弟节点关系
    child.nextSibling = anchor;
    child.prevSibling = anchor.prevSibling;
    anchor.prevSibling = child;

    // 新位置兄弟节点关系更新
    if (this.childNodes[newIndex - 1]) {
      this.childNodes[newIndex - 1].nextSibling = child;
    }
    if (this.childNodes[newIndex + 1]) {
      this.childNodes[newIndex + 1].prevSibling = child;
    }

    // 旧位置兄弟节点关系更新
    if (this.childNodes[oldIndex - 1]) {
      this.childNodes[oldIndex - 1].nextSibling = this.childNodes[oldIndex + 1];
    }
    if (this.childNodes[oldIndex + 1]) {
      this.childNodes[oldIndex + 1].prevSibling = this.childNodes[oldIndex - 1];
    }

    // 调用Native接口移除native中的旧元素 todo
    // removeChild(this, child);

    // 在实例中插入新元素
    this.childNodes.splice(newIndex, 0, child);
    // 在实例中移除旧元素，如果新位置大，则从oldIndex开始，如果新位置小，因为已经插入了一个新元素，因此从oldIndex + 1开始
    this.childNodes.splice(oldIndex + (newIndex < oldIndex ? 1 : 0), 1);

    // 调用Native接口插入节点
    this.insertChildNativeNode(child);
  }

  /**
   * 移除子节点
   *
   * @param rawChild - 需要移除的孩子节点
   */
  public removeChild(rawChild: HippyNode): void {
    const child = rawChild;

    if (!child) {
      throw new Error('Can\'t remove child.');
    }

    if (!child.parentNode) {
      throw new Error('Can\'t remove child, because it has no parent.');
    }

    if (child.parentNode !== this) {
      // 在vue3的keep-alive实现中，会出现这里的问题
      throw new Error('Can\'t remove child, because it has a different parent.');
    }

    if (!child.isNeedInsertToNative) {
      return;
    }

    // 修正实例中兄弟节点的关系
    if (child.prevSibling) {
      child.prevSibling.nextSibling = child.nextSibling;
    }
    if (child.nextSibling) {
      child.nextSibling.prevSibling = child.prevSibling;
    }

    // 理论上应当移除孩子节点的父节点，但这样会导致重复插入节点
    // child.parentNode = null;

    // 切断child与其他节点的关系
    child.prevSibling = null;
    child.nextSibling = null;

    // 找到child节点的位置
    const index = this.childNodes.indexOf(child);
    // 移除child节点
    this.childNodes.splice(index, 1);

    // 调用Native接口移除Native元素
    this.removeChildNativeNode(child);
  }

  /**
   * 查找符合给定条件的子节点
   *
   * @param condition - 需要执行的条件回调函数
   */
  public findChild(condition: CallbackType): HippyNode | null {
    // 判断当前节点是否符合条件
    const yes = condition(this);

    if (yes) {
      return this;
    }

    if (this.childNodes.length) {
      for (const childNode of this.childNodes) {
        const targetChild = this.findChild.call(childNode, condition);
        if (targetChild) {
          return targetChild;
        }
      }
    }

    return null;
  }

  /**
   * 遍历所有子节点，执行传入的callback
   *
   * @param callback - 需要执行的回调函数
   */
  public eachNode(callback: CallbackType): void {
    // 先对节点自身进行回调
    if (callback) {
      callback(this);
    }

    // 对子节点遍历执行回调
    if (this.childNodes.length) {
      this.childNodes.forEach((child) => {
        this.eachNode.call(child, callback);
      });
    }
  }

  /**
   * 传入触发的事件对象，分发事件执行
   *
   * @param rawEvent - 接收到的事件对象
   */
  public dispatchEvent(rawEvent: HippyEvent): void {
    const event = rawEvent;
    const { type: eventName } = event;

    // 取当前事件注册的事件回调列表
    const listeners = this.listeners[eventName];

    // 无回调则返回
    if (!listeners) {
      return;
    }

    // 将事件的当前对象设为当前节点
    event.currentTarget = this;

    // 从后往前，循环执行事件回调方法
    for (let i = listeners.length - 1; i >= 0; i -= 1) {
      const listener = listeners[i];
      // 对于once方法，执行一次后即移除
      if (listener?.options?.once) {
        listeners.splice(i, 1);
      }

      // 如果回调内指定了this上下文，则使用apply传入this上下文执行回调
      if (listener?.options?.thisArg) {
        listener.callback.apply(listener.options.thisArg, [event]);
      } else {
        listener.callback(event);
      }
    }
  }

  /**
   * 插入子NativeNode
   *
   * @param child - 子 native 节点
   */
  public insertChildNativeNode(child: HippyNode): void {
    if (!child.isNeedInsertToNative) return;

    if (this.isRootNode() && !this.isMounted) {
      // 如果根节点没有上屏渲染，则先从根节点开始进行渲染
      renderInsertChildNativeNode(this.convertToNativeNodes(true));
      // 打标记
      this.eachNode((rawNode: HippyNode) => {
        const node = rawNode;

        if (!node.isMounted) {
          node.isMounted = true;
        }
      });
    } else if (this.isMounted && !child.isMounted) {
      // 子节点未渲染则渲染子节点
      renderInsertChildNativeNode(child.convertToNativeNodes(true));
      // 打标记
      child.eachNode((rawNode: HippyNode) => {
        const node = rawNode;

        if (!node.isMounted) {
          node.isMounted = true;
        }
      });
    }
  }

  /**
   * 移除子NativeNode
   *
   * @param child - 子native节点
   */
  // eslint-disable-next-line class-methods-use-this
  public removeChildNativeNode(child: HippyNode): void {
    const toRemoveNode = child;
    // 将节点设置为未插入
    toRemoveNode.isMounted = false;

    renderRemoveChildNativeNode(toRemoveNode.convertToNativeNodes(false));
  }

  /**
   * 更新节点的NativeNode
   *
   * @param isIncludeChildren - 是否同时更新所有后代节点
   */
  public updateNativeNode(isIncludeChildren = false): void {
    // 未插入Native的节点无需处理
    if (!this.isMounted) {
      return;
    }

    // 将节点转成Native格式
    const updateNodes: NativeNode[] = this.convertToNativeNodes(isIncludeChildren);
    renderUpdateChildNativeNode(updateNodes);
  }

  public convertToNativeNodes(
    isIncludeChild: boolean,
    extraAttributes?: Partial<NativeNode>,
  ): NativeNode[] {
    // 如果节点不需要插入native，则直接返回
    if (!this.isNeedInsertToNative) {
      return [];
    }

    if (isIncludeChild) {
      const nativeNodes: NativeNode[] = [];
      // 递归将每个节点都进行转换
      this.eachNode((targetNode: HippyNode) => {
        const nativeChildNodes = targetNode.convertToNativeNodes(false);

        if (nativeChildNodes.length) {
          nativeNodes.push(...nativeChildNodes);
        }
      });

      return nativeNodes;
    }

    // 如果节点没有component属性，则说明本组件还没有注册，需要抛出错误
    if (!this.component) {
      throw new Error('tagName is not supported yet');
    }

    const { rootViewId } = getHippyCachedInstance();
    const attributes = extraAttributes ?? {};

    // 转换Hippy Node，得到Native Node
    return [
      {
        id: this.nodeId,
        pId: this.parentNode?.nodeId ?? rootViewId,
        index: this.index,
        ...attributes,
      },
    ];
  }
}
