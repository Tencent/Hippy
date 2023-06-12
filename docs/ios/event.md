# 终端事件

当终端网络切换，或者横竖屏改变的时候，终端需要像前端发送一些全局的广播事件，这样前端可以根据不同的状态来控制业务状态。

Hippy中的事件分为两种类型：UI组件(component)事件与模块(module)事件

---

## UI组件事件

UI组件事件由Dom层负责处理，Native层需要先将事件封装为`DomEvent`类型，然后通过`DomNode::HandleEvent(const std::shared_ptr<DomEvent>& event)`方法发送。

### 终端构建UI事件

>Hippy UI事件流程符合W3C标准

1.首先构建出HippyValue对象

HippyValue是对Hippy事件数据的封装，包括以下类型：

- 整数类型
- 浮点数类型
- 字符串类型
- 布尔类型
- HippyValue的key-value类型
- HippyValue的数组类型

2.通过HippyValue构建出DomEvent对象。

DomEvent用于封装UI事件

```cpp

//DomEvent部分重要属性以及方法 
class DomEvent {
public:
    DomEvent(std::string type, std::weak_ptr<DomNode> target, bool can_capture, bool can_bubble, std::shared_ptr<HippyValue> value)
    : type_(std::move(type)),
        target_(target),
        current_target_(target),
        prevent_capture_(false),
        prevent_bubble_(false),
        can_capture_(can_capture),
        can_bubble_(can_bubble),
        value_(value) {}
  DomEvent(std::string type, std::weak_ptr<DomNode> target, bool can_capture = false, bool can_bubble = false)
      : DomEvent(std::move(type), target, can_capture, can_bubble, nullptr) {}
  DomEvent(std::string type, std::weak_ptr<DomNode> target, std::shared_ptr<HippyValue> value)
      : DomEvent(std::move(type), target, false, false, value) {}

 private:
    std::string type_;
    std::weak_ptr<DomNode> target_;
    std::weak_ptr<DomNode> current_target_;
    bool prevent_capture_;
    bool prevent_bubble_;
    bool can_capture_;
    bool can_bubble_;
    EventPhase event_phase_ = EventPhase::kNone;
    std::shared_ptr<HippyValue> value_;
};

```

`DomEvent`对象主要有以下属性：

- type_:事件类型，比如`click`,`longclick`,`touchstart`
- target_:事件绑定的dom对象
- current_target_:事件当前捕获/冒泡阶段对应的dom对象
- prevent_capture_:是否在捕获阶段提前结束事件传递流程
- prevent_bubble_:是否在冒泡阶段结束事件传递流程
- can_capture_:事件是否能被捕获
- can_bubble_:事件能否走冒泡流程

默认情况下，UI组件预定义了一下事件名称

```c++
constexpr char kClickEvent[] = "click";
constexpr char kLongClickEvent[] = "longclick";
constexpr char kTouchStartEvent[] = "touchstart";
constexpr char kTouchMoveEvent[] = "touchmove";
constexpr char kTouchEndEvent[] = "touchend";
constexpr char kPressIn[] = "pressin";
constexpr char kPressOut[] = "pressout";
constexpr char kTouchCancelEvent[] = "touchcancel";
constexpr char kLayoutEvent[] = "layout";
constexpr char kShowEvent[] = "show";
constexpr char kDismissEvent[] = "dismiss";
```

3.将事件发送给driver层

```cpp
auto event = std::make_shared<DomEvent>("click", node, false, false, hippyValue);
node->HandleEvent(event);
```

### 业务端注册与接收事件

业务端通过UI组件绑定事件即可向dom层注册UI事件

```jsx
//react
<View
    onClick={(event) => {
        console.log('click style outer', event.target.nodeId, event.currentTarget.nodeId);
        // return false means trigger bubble
        return false;
    }}>
</View>

//vue
<div class="toolbar" @click="onClickHandler">
</div>
```

## 模块事件

模块事件通过bridge层处理，直接发送给driver层

### 终端构建模块事件

终端在需要发送事件的地方调用代码：

```objectivec
// 也可以参考HippyEventObserverModule.m
[self sendEvent: @"rotate" params: @{@"foo":@"bar"}];
- (void)sendEvent:(NSString *)eventName params:(NSDictionary *)params
{
    HippyAssertParam(eventName);
    // 这里的"EventDispatcher"和"receiveNativeEvent"是常量，无需也不能更改
    [self.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" methodName:@"receiveNativeEvent" args:@{@"eventName": eventName, @"extra": params ? : @{}}];
}
```

### 业务端注册与处理

这里是向前端发送一个名叫rotate的事件里面有个参数是result，这样就发送到前端去了。然后在前端进行接收处理。

PS: 最新版 Hippy 的监听器添加方法由 `addEventListener` 改为了 `addListener`

```jsx
import { HippyEventEmitter } from '@hippy/react';

let hippyEventEmitter = new HippyEventEmitter();
this.call = hippyEventEmitter.addListener("rotate", (e) => {
    // log结果: { foo: 'bar' }
    console.log(e) ;
});
```
