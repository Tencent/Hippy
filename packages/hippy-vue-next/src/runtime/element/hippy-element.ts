import { toRaw } from '@vue/runtime-core';
import { isFunction, isString } from '@vue/shared';
import { type PropertiesMapType, parseBackgroundImage, PROPERTIES_MAP, translateColor } from '@next-css-loader/index';
import type { CallbackType } from '../../../global';
import { IS_PROD, NATIVE_COMPONENT_MAP } from '../../config';
import {
  capitalizeFirstLetter,
  convertImageLocalPath,
  setsAreEqual,
  tryConvertNumber,
  unicodeToChar,
  warn,
} from '../../util';
import { isRTL } from '../../util/i18n';
import { getHippyCachedInstance } from '../../util/instance';
import { parseRemStyle } from '../../util/rem';
import { getTagComponent, type TagComponent } from '../component';
import { eventIsKeyboardEvent, type HippyEvent } from '../event/hippy-event';
import type { EventListenerOptions } from '../event/hippy-event-target';
import { Native } from '../native';
import type { NativeNodeProps, NativeNode } from '../native/native-node';
import { HippyNode, NodeType } from '../node/hippy-node';
import { getCssMap } from '../style/css-map';
import { HippyText } from '../text/hippy-text';

interface OffsetMapType {
  textShadowOffsetX: string;
  textShadowOffsetY: string;
}

/**
 * parse text shadow offset
 *
 * @param property - 属性名
 * @param value - 属性值
 * @param rawStyle - 原样式
 *
 */
function parseTextShadowOffset(
  property: keyof OffsetMapType,
  value = 0,
  rawStyle: NativeNodeProps,
): (string | { [key: string]: number })[] {
  const style = rawStyle;
  const offsetMap: OffsetMapType = {
    textShadowOffsetX: 'width',
    textShadowOffsetY: 'height',
  };

  style.textShadowOffset = style.textShadowOffset ?? {};

  Object.assign(style.textShadowOffset, {
    [offsetMap[property]]: value,
  });

  return ['textShadowOffset', style.textShadowOffset];
}

/**
 * 对文本节点组件的特殊情况进行处理
 *
 * @param node - 节点
 * @param rawStyle - 原样式
 */
function parseTextInputComponent(
  node: HippyElement,
  rawStyle: NativeNodeProps,
) {
  const style = rawStyle;

  // 文本输入组件需要支持从右至左文字书写方式
  if (node.component.name === NATIVE_COMPONENT_MAP.TextInput) {
    if (isRTL()) {
      if (!style.textAlign) {
        style.textAlign = 'right';
      }
    }
  }
}

/**
 * 对view组件的特殊情况进行处理
 *
 * @param node - 节点
 * @param rawNativeNode - native 节点
 * @param rawStyle - 原样式
 */
// eslint-disable-next-line complexity
function parseViewComponent(
  node: HippyElement,
  rawNativeNode: Partial<NativeNode>,
  rawStyle: NativeNodeProps,
) {
  const nativeNode = rawNativeNode;
  const style = rawStyle;

  if (node.component.name === NATIVE_COMPONENT_MAP.View) {
    // 如果发现view组件的样式中包含了scroll属性，此时必须将其转换为ScrollView，View是不支持滚动的
    if (style.overflowX === 'scroll' && style.overflowY === 'scroll') {
      warn('overflow-x and overflow-y for View can not work together');
    }
    if (style.overflowY === 'scroll') {
      nativeNode.name = 'ScrollView';
    } else if (style.overflowX === 'scroll') {
      nativeNode.name = 'ScrollView';
      // Necessary for horizontal scrolling
      if (nativeNode.props) {
        nativeNode.props.horizontal = true;
      }
      // Change flexDirection to row-reverse if display direction is right to left.
      style.flexDirection = isRTL() ? 'row-reverse' : 'row';
    }
    // Change the ScrollView child collapsable attribute
    if (nativeNode.name === 'ScrollView') {
      if (node.childNodes.length !== 1) {
        warn('Only one child node is acceptable for View with overflow');
      }
      if (node.childNodes.length && node.nodeType === NodeType.ElementNode) {
        (node.childNodes[0] as HippyElement).setStyle('collapsable', false);
      }
    }
    // TODO backgroundImage would use local path if webpack file-loader active, which needs native support
    if (style.backgroundImage) {
      style.backgroundImage = convertImageLocalPath(style.backgroundImage as string);
    }
  }
}

/**
 * HippyElement类型，派生自HippyNode类
 *
 * @public
 */
export class HippyElement extends HippyNode {
  /**
   * 对样式单位中的rem进行处理，返回实际大小值
   *
   * @param styleObject - 待处理样式
   */
  static parseRem(styleObject: NativeNodeProps): NativeNodeProps {
    let style: NativeNodeProps = {};
    const keys = Object.keys(styleObject);

    if (keys.length) {
      keys.forEach((key) => {
        style[key] = parseRemStyle(styleObject[key]);
      });
    } else {
      style = styleObject;
    }

    return style;
  }

  // 模版标签名，如div，ul，hi-swiper等
  public tagName: string;

  // 节点的id属性
  public id = '';

  // 节点的样式列表，如class="wrapper red" => ['wrapper', 'red']
  public classList: Set<string>;

  // 属性的集合
  public attributes: NativeNodeProps;

  // 内置样式
  public style: NativeNodeProps;

  // 文本元素事件的元素内容
  public value?: string;

  // 对Native事件进行polyFill
  protected polyFillNativeEvents?: (type: string) => string;

  constructor(tagName: string) {
    super(NodeType.ElementNode);

    // 模版中可能会有大写的tag name，需要转为小写
    this.tagName = tagName.toLowerCase();
    this.classList = new Set();
    this.attributes = {};
    this.style = {};
    // 对特殊问题进行 hack 处理
    this.hackSpecialIssue();
  }

  // 样式预处理器
  public beforeLoadStyle: CallbackType = val => val;

  /**
   * 获取节点所属tag的组件信息
   */
  public get component(): TagComponent {
    // 如果节点所属tag的组件信息存在则直接返回
    if (this.tagComponent) {
      return this.tagComponent;
    }

    // 否则去component里取并保存
    this.tagComponent = getTagComponent(this.tagName);

    return this.tagComponent;
  }

  public isRootNode(): boolean {
    const { rootContainer } = getHippyCachedInstance();
    return super.isRootNode() || this.id === rootContainer;
  }

  /**
   * 添加孩子节点
   *
   * @param child - 子节点
   */
  public appendChild(child: HippyNode): void {
    super.appendChild(child);

    // 如果节点类型是Text，则调用本实例的setText设置文本
    // 不像Dom中是会有一个新的Text节点
    // 节点可能是文本节点，就会有text属性
    if (child instanceof HippyText) {
      this.setText(child.text);
    }
  }

  /**
   * 在给定锚点前插入节点
   *
   * @param child - 要插入的子节点
   * @param anchor - 插入的锚点
   */
  public insertBefore(child: HippyNode, anchor: HippyNode): void {
    super.insertBefore(child, anchor);

    // 如果节点类型是Text，则调用本实例的setText设置文本
    // 不像Dom中是会有一个新的Text节点
    // 节点可能是文本节点，就会有text属性
    if (child instanceof HippyText) {
      this.setText(child.text);
    }
  }

  /**
   * 移动节点至给定锚点
   *
   * @param child - 要移动的子节点
   * @param anchor - 插入的锚点
   */
  public moveChild(child: HippyNode, anchor: HippyNode): void {
    super.moveChild(child, anchor);

    // 如果节点类型是Text，则调用本实例的setText设置文本
    // 不像Dom中是会有一个新的Text节点
    // 节点可能是文本节点，就会有text属性
    if (child instanceof HippyText) {
      this.setText(child.text);
    }
  }

  /**
   * 移动子节点
   *
   * @param child - 要移除的子节点
   */
  public removeChild(child: HippyNode): void {
    super.removeChild(child);

    // 如果节点类型是Text，则调用本实例的setText设置文本
    // 不像Dom中是会有一个新的Text节点
    // 节点可能是文本节点，就会有text属性
    if (child instanceof HippyText) {
      this.setText('');
    }
  }

  /**
   * 判断元素是否包含某个属性
   *
   * @param key - 属性名
   */
  public hasAttribute(key: string): boolean {
    return !!this.attributes[key];
  }

  /**
   * 获取元素的属性值
   *
   * @param key - 属性名
   */
  public getAttribute(key: string): NativeNodeProps {
    return this.attributes[key];
  }

  /**
   * 移除元素上的属性
   *
   * @param key - 属性名
   */
  public removeAttribute(key: string): void {
    delete this.attributes[key];
  }

  /**
   * 为元素设置属性值
   *
   * @param key - 属性名
   * @param rawValue - 属性值
   */
  // eslint-disable-next-line complexity
  public setAttribute(key: string, rawValue: any): void {
    let value = rawValue;

    try {
      // detect expandable attrs for boolean values
      // See https://vuejs.org/v2/guide/components-props.html#Passing-a-Boolean
      if (typeof this.attributes[key] === 'boolean' && value === '') {
        value = true;
      }
      if (key === undefined) {
        this.updateNativeNode();
        return;
      }
      switch (key) {
        case 'class': {
          const newClassList = new Set(value.split(' ').filter((x: string) => x.trim()) as string);

          // 如果 classList 没有变化则直接返回
          if (setsAreEqual(this.classList, newClassList)) {
            return;
          }

          this.classList = newClassList;

          // update current node and child nodes
          this.updateNativeNode(true);
          return;
        }
        case 'id':
          if (value === this.id) {
            return;
          }
          this.id = value;
          // update current node and child nodes
          this.updateNativeNode(true);
          return;
        // Convert text related to character for interface.
        case 'text':
        case 'value':
        case 'defaultValue':
        case 'placeholder': {
          if (typeof value !== 'string') {
            try {
              value = value.toString();
            } catch (error) {
              warn(`Property ${key} must be string：${(error as Error).message}`);
            }
          }
          value = value.trim().replace(/(&nbsp;|Â)/g, ' ');
          this.attributes[key] = unicodeToChar(value);
          break;
        }
        // FIXME: UpdateNode numberOfRows will makes Image flicker on Android.
        //        So make it working on iOS only.
        case 'numberOfRows':
          this.attributes[key] = value;
          if (!Native.isIOS()) {
            return;
          }
          break;
        case 'caretColor':
        case 'caret-color':
          this.attributes['caret-color'] = Native.parseColor(value);
          break;
        default:
          this.attributes[key] = value;
      }
      this.updateNativeNode();
    } catch (err) {
      // Throw error in development mode
      if (process.env.NODE_ENV !== 'production') {
        throw err;
      }
    }
  }

  /**
   * 设置节点的文本内容
   *
   * @param text - 文本内容
   */
  public setText(text: string): void {
    return this.setAttribute('text', text);
  }

  /**
   * 设置元素的样式内容
   *
   * @param property - 属性名
   * @param value - 属性值
   * @param isBatchUpdate - 是否批量更新
   */
  // eslint-disable-next-line complexity
  public setStyle(
    property: string,
    value: any,
    isBatchUpdate = false,
  ): void {
    if (value === undefined) {
      delete this.style[property];
      return;
    }
    // Preprocess the style
    let { property: styleProperty, value: styleValue } = this.beforeLoadStyle({
      property,
      value,
    });
    // Process the specific style value
    switch (styleProperty) {
      case 'fontWeight':
        if (typeof styleValue !== 'string') {
          styleValue = styleValue.toString();
        }
        break;
      case 'caretColor':
        this.attributes['caret-color'] = translateColor(styleValue);
        break;
      case 'backgroundImage': {
        [styleProperty, styleValue] = parseBackgroundImage(
          styleProperty,
          styleValue,
        );
        break;
      }
      case 'textShadowOffsetX':
      case 'textShadowOffsetY': {
        [styleProperty, styleValue] = parseTextShadowOffset(
          styleProperty,
          styleValue,
          this.style,
        );
        break;
      }
      case 'textShadowOffset': {
        const { x = 0, width = 0, y = 0, height = 0 } = styleValue ?? {};
        styleValue = { width: x || width, height: y || height };
        break;
      }
      default: {
        // Convert the property to W3C standard.
        if (
          Object.prototype.hasOwnProperty.call(PROPERTIES_MAP, styleProperty)
        ) {
          styleProperty = PROPERTIES_MAP[styleProperty as keyof PropertiesMapType];
        }
        // Convert the value
        if (typeof styleValue === 'string') {
          styleValue = styleValue.trim();
          // Convert inline color style to int
          if (styleProperty.toLowerCase().indexOf('color') >= 0) {
            styleValue = translateColor(styleValue, {
              platform: Native.platform,
            });
            // Convert inline length style, drop the px unit
          } else if (styleValue.endsWith('px')) {
            styleValue = parseFloat(styleValue.slice(0, styleValue.length - 2));
          } else {
            styleValue = tryConvertNumber(styleValue);
          }
        }
      }
    }

    // 样式值不存在或者与原值相等，则直接返回
    if (
      styleValue === undefined
      || styleValue === null
      || this.style[styleProperty] === styleValue
    ) {
      return;
    }

    // 赋值
    this.style[styleProperty] = styleValue;

    // 非批量更新时，直接更新Native节点
    if (!isBatchUpdate) {
      this.updateNativeNode();
    }
  }

  /**
   * Scroll children to specific position.
   */
  public scrollToPosition(
    x = 0,
    y = 0,
    rawDuration: number | boolean = 1000,
  ): void {
    let duration = rawDuration;

    if (duration === false) {
      duration = 0;
    }

    Native.callUIFunction(this, 'scrollToWithOptions', [{ x, y, duration }]);
  }

  /**
   * Native implementation for the Chrome/Firefox Element.scrollTop method
   */
  public scrollTo(
    x:
    | number
    | {
      left: number;
      top: number;
      behavior: string;
      duration: number | boolean;
    },
    y?: number,
    duration?: number | boolean,
  ): void {
    if (typeof x === 'object') {
      const { left, top, behavior = 'auto', duration: animationDuration } = x;
      this.scrollToPosition(
        left,
        top,
        behavior === 'none' ? 0 : animationDuration,
      );
    } else {
      this.scrollToPosition(x, y, duration);
    }
  }

  /**
   * 添加元素事件监听器
   *
   * @param type - 事件类型
   * @param callback - 事件回调
   * @param options - 注册事件参数
   */
  public addEventListener(
    type: string,
    callback: CallbackType,
    options?: EventListenerOptions,
  ): void {
    // 调用父类方法注册事件
    super.addEventListener(type, callback, options);

    // 如果有事件polyfill，则进行polyfill，对需要polyfill的事件也绑定相应的事件回调
    if (this.polyFillNativeEvents) {
      const eventName = this.polyFillNativeEvents(type);

      if (eventName) {
        super.addEventListener(eventName, callback, options);
      }
    }
    // 更新节点
    this.updateNativeNode();
  }

  /**
   * 移除元素事件监听器
   *
   * @param type - 事件类型
   * @param callback - 事件回调
   * @param options - 注册事件参数
   */
  public removeEventListener(
    type: string,
    callback: CallbackType,
    options?: EventListenerOptions,
  ): void {
    // 如果有polyfill，则进行处理
    // 如果有事件polyfill，则进行polyfill，对需要polyfill的事件也绑定相应的事件回调
    if (this.polyFillNativeEvents) {
      const eventName = this.polyFillNativeEvents(type);

      if (eventName) {
        super.removeEventListener(eventName, callback, options);
      }
    }

    // 调用父类方法移除事件
    super.removeEventListener(type, callback, options);
  }

  /**
   * 分发事件
   *
   * @param rawEvent - 事件对象
   */
  public dispatchEvent(rawEvent: HippyEvent): void {
    const event = rawEvent;

    // 将事件当前触发对象赋值为自己
    event.currentTarget = this;

    // 如果事件触发对象为空，则当前是第一次链条，赋值
    if (!event.target) {
      event.target = this;

      // 如果事件值是文本，则将其赋值给节点的文本内容
      // TODO: 不一定覆盖了所有的终端事件，所以这里不能用instanceof，先简单绕过下
      if (eventIsKeyboardEvent(event)) {
        (event.target as HippyElement).value = event.value;
      }
    }

    // 触发事件
    this.emitEvent(event);

    // 冒泡
    if (this.parentNode && event.bubbles) {
      this.parentNode.dispatchEvent.call(this.parentNode, event);
    }
  }

  public convertToNativeNodes(isIncludeChild: boolean): NativeNode[] {
    // 如果节点不需要插入native，则直接返回
    if (!this.isNeedInsertToNative) {
      return [];
    }

    if (isIncludeChild) {
      return super.convertToNativeNodes(true);
    }

    // 获取节点的样式
    const style: NativeNodeProps = this.getNativeStyles();

    const elementExtraAttributes: Partial<NativeNode> = {
      name: this.component.name,
      props: {
        // 节点属性
        ...this.getNativeProps(),
        // 事件属性
        ...this.getNativeEvents(),
        // 样式属性
        style,
      },
    };

    // 调试环境hack，增加属性用于chrome inspector调试
    if (!IS_PROD) {
      elementExtraAttributes.tagName = this.tagName;
      if (elementExtraAttributes.props) {
        elementExtraAttributes.props.attributes = this.getNodeAttributes();
      }
    }

    // 处理文本组件问题
    parseTextInputComponent(this, style);

    // 处理view组件问题
    parseViewComponent(this, elementExtraAttributes, style);

    return super.convertToNativeNodes(false, elementExtraAttributes);
  }

  /**
   * 当通过HMR或是动态加载时，使用最新的样式map重绘元素
   */
  public repaintWithChildren(): void {
    this.updateNativeNode(true);
  }

  /**
   * 获取hippyNode节点内联的样式
   */
  private getInlineStyle(): NativeNodeProps {
    const nodeStyle: NativeNodeProps = {};

    Object.keys(this.style).forEach((key) => {
      nodeStyle[key] = toRaw(this.style[key]);
    });

    return nodeStyle;
  }

  /**
   * 根据节点属性和全局样式表，得到节点的样式属性
   */
  private getNativeStyles(): NativeNodeProps {
    // 样式属性
    let style: NativeNodeProps = {};

    // 首先添加组件默认样式
    if (this.component.defaultNativeStyle) {
      style = { ...this.component.defaultNativeStyle };
    }

    // 然后从全局的CSS样式表中获取样式
    // 这里需要对rem进行处理
    const matchedSelectors = getCssMap().query(this);
    matchedSelectors.selectors.forEach((matchedSelector) => {
      if (matchedSelector.ruleSet?.declarations?.length) {
        matchedSelector.ruleSet.declarations.forEach((cssStyle) => {
          if (cssStyle) {
            style[cssStyle.property] = cssStyle.value;
          }
        });
      }
    });

    // 最后从节点的style属性中获取样式，并进行rem单位处理
    style = HippyElement.parseRem({ ...style, ...this.getInlineStyle() });

    return style;
  }

  /**
   * 生成Native Node的props时，有些额外逻辑需要hack处理
   *
   * @param rawProps - 原props属性
   */
  private hackNativeProps(rawProps: NativeNodeProps) {
    const props = rawProps;

    // hack 解决iOS的image的src props的问题，应该后续需要native修复
    if (this.tagName === 'img' && Native.isIOS()) {
      props.source = [
        {
          uri: props.src,
        },
      ];

      props.src = undefined;
    }
  }

  /**
   * 获取节点的属性，并转换为Native节点所需的属性格式，属性包括节点的属性以及节点所属组件的默认属性等
   */
  private getNativeProps(): NativeNodeProps {
    const props: NativeNodeProps = {};
    const { defaultNativeProps } = this.component;

    // 如果节点所属组件有默认属性，则首先加上，比如native的dialog节点，默认就是透明的，transparent是true，等等
    if (defaultNativeProps) {
      Object.keys(defaultNativeProps).forEach((key) => {
        // 如果节点已经定义了属性，则不设置
        if (this.getAttribute(key) === undefined) {
          const prop = defaultNativeProps[key];

          // 如果默认属性是函数，则执行，否则直接赋值
          props[key] = isFunction(prop) ? prop(this) : prop;
        }
      });
    }

    // 然后转换节点自身的attributes
    Object.keys(this.attributes).forEach((key) => {
      // 获取节点属性值
      let value = toRaw(this.getAttribute(key));

      // 如果没有定义属性map或者map中没有该key，则直接赋值
      if (!this.component.attributeMaps || !this.component.attributeMaps[key]) {
        props[key] = value;
        return;
      }

      // 对于属性map中已有属性，如果定义的map是string，则将map作为key
      // 这里也是类似事件别名的方式，vue模版使用的属性和native使用的属性名不一致，因此进行map转换
      const map = this.component.attributeMaps[key];
      if (isString(map)) {
        props[map] = value;
        return;
      }

      // 如果是方法，则将value作为参数入餐执行方法
      if (isFunction(map)) {
        props[key] = map(value);
        return;
      }

      // 如果map和value都定义了
      const { name: propsKey, propsValue, jointKey } = map;
      if (isFunction(propsValue)) {
        value = propsValue(value);
      }
      // 如果jointKey有设置，多个属性会被写入相同的的jointKey对象
      if (jointKey) {
        props[jointKey] = props[jointKey] ?? {};

        Object.assign(props[jointKey], {
          [propsKey]: value,
        });
      } else {
        props[propsKey] = value;
      }
    });

    const { nativeProps } = this.component;
    if (nativeProps) {
      // 然后处理配置的nativeProps，这里的优先级最高，有设置则覆盖其他
      Object.keys(nativeProps).forEach((key) => {
        props[key] = nativeProps[key];
      });
    }

    // 最后处理hack逻辑
    this.hackNativeProps(props);

    return props;
  }

  /**
   * 获取目标节点的attributes，用于chrome inspector
   */
  private getNodeAttributes() {
    try {
      const nodeAttributes = JSON.parse(JSON.stringify(this.attributes));
      const classInfo = Array.from(this.classList ?? []).join(' ');
      const attributes = {
        id: this.id,
        class: classInfo,
        ...nodeAttributes,
      };

      // 移除不需要使用的属性
      delete attributes.text;
      delete attributes.value;

      return attributes;
    } catch (error) {
      return {};
    }
  }

  /**
   * 获取节点绑定的事件列表，并转换为native节点事件属性所需列表
   *
   */
  private getNativeEvents(): NativeNodeProps {
    const events: NativeNodeProps = {};
    const eventList = this.getEventListenerList();
    // 这里取出来的事件key都是vue注册的事件，是去除了on开头前缀的事件名
    const eventKeys = Object.keys(eventList);

    // 有绑定事件
    if (eventKeys.length) {
      const { eventNamesMap } = this.component;

      // 如果节点属于自定义组件，有自定义事件map，则使用自定义事件map
      // 例如节点注册了事件appear,但是终端这个事件名叫做onWidgetShow，那么
      // native这里传入的事件名就应该是onWidgetShow，这里应该是因为有些终端
      // 事件名不易理解，不直观，所以做了map
      if (eventNamesMap) {
        eventKeys.forEach((eventKey) => {
          const nativeEventName = eventNamesMap.get(eventKey);

          // 组件有终端适配事件名的情况下，直接使用适配的终端事件名即可
          if (nativeEventName) {
            events[nativeEventName] = true;
          } else {
            // 否则与其他vue事件一样，首字母大写并加上on前缀
            events[`on${capitalizeFirstLetter(eventKey)}`] = true;
          }
        });
      } else {
        // 没有自定义事件则使用保存的事件名，给终端的事件名必须是onXXX
        eventKeys.forEach((eventKey) => {
          events[`on${capitalizeFirstLetter(eventKey)}`] = true;
        });
      }
    }

    return events;
  }

  /**
   * 统一调用需要特殊处理的逻辑
   */
  private hackSpecialIssue() {
    // 对节点的属性做特殊处理
    this.fixVShowDirectiveIssue();
  }

  /**
   * 修复 vShow 指令不生效的问题
   *
   */
  private fixVShowDirectiveIssue(): void {
    let display;
    // 监听 this.style.display，如果发现修改了 display 属性的时候，就 fix vue 传入的 display 值
    // fixme 需要注意的是，如果这里用户主动通过 setStyle 的方式设置 display，则可能会触发多一次 updateNode，这里看看如何处理
    Object.defineProperty(this.style, 'display', {
      enumerable: true,
      configurable: true,
      get() {
        return display;
      },
      set: (newValue: string) => {
        // hippy 中 display 属性默认是 flex，才能正常显示，web 中为空即可显示
        display = newValue === undefined ? 'flex' : newValue;
        // 调用更新节点
        this.updateNativeNode();
      },
    });
  }
}
