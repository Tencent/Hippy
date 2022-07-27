// eslint-disable-next-line max-classes-per-file
import type { HippyEventTarget } from './hippy-event-target';

/**
 * Hippy Event 类定义，因为终端事件参数众多，因此event类不能囊括所有
 * 额外的参数，比如native-component中，可以自行扩展HippyEvent的属性
 *
 * @public
 */
export class HippyEvent {
  // 事件触发时间
  public timeStamp: number;

  // 事件类型，即事件名
  public type: string;

  // 触发事件的对象。原始目标
  public target: HippyEventTarget | null = null;

  // 触发事件的当前对象，随着事件冒泡，这块应该是在变动的
  public currentTarget: HippyEventTarget | null = null;

  // 事件是否可以冒泡，默认为true
  public bubbles = true;

  // 事件的默认行为是否可以被取消，默认为true
  protected cancelable = true;

  // 表示事件流处理到了哪个阶段，暂无用处
  protected eventPhase = false;

  // 事件是否已取消
  private isCanceled = false;

  constructor(eventName: string, targetNode: HippyEventTarget) {
    // 保存事件类型
    this.type = eventName;
    // 保存事件触发的时间戳
    this.timeStamp = Date.now();
    // 设置事件触发的原始目标对象
    this.target = targetNode;
  }

  get canceled(): boolean {
    return this.isCanceled;
  }

  /**
   * 阻止事件继续往上冒泡
   */
  stopPropagation(): void {
    this.bubbles = false;
  }

  /**
   * 阻止事件的默认行为
   */
  preventDefault(): void {
    if (this.cancelable) {
      if (this.isCanceled) {
        return;
      }

      this.isCanceled = true;
    }
  }
}

export class HippyTouchEvent extends HippyEvent {
  // 事件发生的X方向offset
  public offsetX?: number;

  // 事件发生的Y方向offset
  public offsetY?: number;

  // touch事件相关位置信息
  public touches?: {
    [key: number]: {
      // 距离客户端左方距离
      clientX: number;
      // 距离客户端上方距离
      clientY: number;
    };
    length: number;
  };

  // 内容偏移量
  public contentOffset?:
  | {
    x: number;
    y: number;
  }
  | number;

  // 滚动事件内容区域的实际高度，包括非可视区域
  public scrollHeight?: number;

  // 滚动事件内容区域的实际宽度，包括非可视区域
  public scrollWidth?: number;
}

export class HippyLayoutEvent extends HippyEvent {
  // Layout事件的距离顶部距离
  public top?: number;

  // Layout事件的距离左边距离
  public left?: number;

  // Layout事件的距离底部距离
  public bottom?: number;

  // Layout事件的距离右边距离
  public right?: number;

  // Layout的元素宽度
  public width?: number;

  // Layout事件的元素高度
  public height?: number;
}

export class HippyLoadResourceEvent extends HippyEvent {
  // url加载事件的url
  public url?: string;
}

export class HippyKeyboardEvent extends HippyEvent {
  // 文本元素事件的元素内容
  public value?: string;

  // 输入框选择的文本的起始位置
  public start?: number;

  // 输入框选择的文本的结束位置
  public end?: number;

  // 键盘的高度值
  public keyboardHeight?: number;

  // 按键的状态码
  public keyCode?: number;
}

export class ContentSizeEvent extends HippyEvent {
  public width?: number;

  public height?: number;
}

export class FocusEvent extends HippyEvent {
  // 当前输入框是否获得了焦点
  public isFocused?: boolean;
}

export class ViewPagerEvent extends HippyEvent {
  // swiper当前item索引
  public currentSlide?: number;

  // swiper下一元素索引
  public nextSlide?: number;

  // 事件状态
  public state?: string;

  // 组件偏移
  public offset?: number;
}

export class ExposureEvent extends HippyEvent {
  // 事件曝光信息
  public exposureInfo?: {
    [key: string]: any;
  };
}

export class ListViewEvent extends HippyEvent {
  // onDelete事件，节点所属index
  public index?: number;
}

export function eventIsKeyboardEvent(event: HippyEvent): event is HippyKeyboardEvent {
  return typeof (event as HippyKeyboardEvent).value === 'string';
}

export interface HippyGlobalEventHandlersEventMap {
  onScroll: HippyTouchEvent;
  onScrollBeginDrag: HippyTouchEvent;
  onScrollEndDrag: HippyTouchEvent;
  onTouchDown: HippyTouchEvent;
  onTouchMove: HippyTouchEvent;
  onTouchEnd: HippyTouchEvent;
  onTouchCancel: HippyTouchEvent;
  onFocus: FocusEvent;
  onDelete: ListViewEvent;
  onChangeText: HippyKeyboardEvent;
  onEndEditing: HippyKeyboardEvent;
  onSelectionChange: HippyKeyboardEvent;
  onKeyboardWillShow: HippyKeyboardEvent;
  onContentSizeChange: ContentSizeEvent;
  onLoad: HippyLoadResourceEvent;
  onLoadStart: HippyLoadResourceEvent;
  onLoadEnd: HippyLoadResourceEvent;
  onExposureReport: ExposureEvent;
  onPageSelected: ViewPagerEvent;
  onPageScroll: ViewPagerEvent;
  onPageScrollStateChanged: ViewPagerEvent;
  onHeaderPulling: HippyTouchEvent;
  onFooterPulling: HippyTouchEvent;
  onLayout: HippyLayoutEvent;
}

// 把map转成union，这样可以用4.6的特性在switch case做narrowing，参考
// https://devblogs.microsoft.com/typescript/announcing-typescript-4-6/#control-flow-analysis-for-destructured-discriminated-unions
// 为什么要这么做？因为由于TS的限制，在泛型函数的声明中，没有办法根据A参数的类型去推断B参数的类型，所以processEventData的类型声明比较难搞
// 可以参考https://stackoverflow.com/questions/59075083/
type MapToUnion<I> = { [k in keyof I]: { __evt: k; handler: I[k] } }[keyof I];
export type EventsUnionType = MapToUnion<HippyGlobalEventHandlersEventMap>;
