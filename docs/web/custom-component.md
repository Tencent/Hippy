# 自定义界面组件

使用 Hippy 开发过程中，当前的能力可能无法满足一些特定场景，这时候就需要对 UI 组件进行封装或者引入一些第三方的功能来完成需求。

---

# 组件扩展

扩展组件主要包括：

1. 扩展 `HippyView`
2. 实现构造方法
3. 实现设置自定义组件的 `tagName`
4. 实现构造自定义组件的 `dom`
5. 实现自定义组件的 `API 能力`
6. 实现自定义组件的属性

其中 `HippyView` 类，实现了一些 HippyBaseView 的接口和属性定义，在一个自定义组件中有几个比较重要的属性：

* id: 每一个实例化 component 的唯一标识，默认会赋值给组件 dom 的 id 属性
* pId: 每一个实例化 component 的父组件标识
* tagName: 是用来区分组件的类型，也是业务侧代码使用该组件时在 `nativeName` 属性上填写的值，用来关联自定义组件的 key
* dom: 真正挂载到document上的节点
* props: 承载了从业务侧传递过来的属性和style的记录

## 例子

下面这个例子中，我们创建了 `CustomView` 的自定义组件，用来显示一个视频

* 第一步，进行初始化

```javascript

import { HippyView, HippyWebEngine, HippyWebModule } from '@hippy/web-renderer';

// 继承自 `HippyView`
class CustomView extends HippyView {
  // 实现构造方法
  constructor(context, id, pId) {
    super(context, id, pId);
    // 设置自定义组件的 `tagName` 为 `CustomView`，
    // 这样 JS 业务使用的时候就可以设置 `nativeName="CustomView"` 进行关联。
    this.tagName = 'CustomView';
    // 构造自定义组件的 dom，我们创建了一个 video 节点并赋值给 dom 成员变量。注意 dom 成员变量在构造方法结束前一定要设置上
    this.dom = document.createElement('video'); 
  }
}

```

* 第二步，实现自定义组件的 API 能力和相关属性

    我们为 `CustomView` 实现了一个属性 `src`，当 JS 业务侧修改 src 属性时就会触发 `set src()` 方法并且获取到变更后的 value。 
  
    我们还实现了组件的两个方法 `play` 和 `pause`，当 JS 业务侧使用 `callUIFunction(this.instance, 'play'/'pause', []);` 的时就会调用到这两个方法。

    在 `pause()` 方法中，我们使用 `sendUiEvent` 向 JS 业务侧发送了一个 `onPause` 事件，属性上设置的回调就会被触发。

```javascript

import { HippyView, HippyWebEngine, HippyWebModule } from '@hippy/web-renderer';

class CustomView extends HippyView {
  
   set src(value) {
     this.dom.src = value;
   } 
   
   get src() {
    return this.props['src'];
   }
    
   play() {
    this.dom.play();
   }
   
   pause() {
    this.dom.pause();
    this.context.sendUiEvent(this.id, 'onPause', {});
   }
}

```

> 关于 `props`: `HippyWebRenderer` 底层默认会将业务侧传递过来的原始 `props` 存储到组件的 `props` 属性上，然后针对更新的 `prop` 项逐个调用与之对应 key 的 set 方法，让组件获得一个更新时机，从而执行一些行为。 `props` 里面有一个对象 `style`，承载了所有业务侧设置的样式。默认也是由 `HippyWebRenderer` 设置到自定义组件的 `dom` 上，中间会有一层转换，因为`style` 中的有一些值是 `hippy` 特有的，需要进行一次翻译才可以设置到 `dom` 的 `style` 上。

> 关于 `context`: 自定义组件被构造的时候会传入一个 `context`，它提供了一些关键的方法:

```javascript
export interface ComponentContext {
     sendEvent: (type: string, params: any) => void; // 向业务侧发送全局事件
     sendUiEvent: (id: number, type: string, params: any) => void; // 向某个组件实例发送事件
     sendGestureEvent: (e: HippyTransferData.NativeGestureEvent) => void; // 发送手势事件
     subscribe: (evt: string, callback: Function) => void; // 订阅某个事件
     getModuleByName: (moduleName: string) => any; // 获取模块实例，通过模块名
}
```


# 复杂组件

有的时候我们可能需要提供一个容器，用来装载一些已有的组件。而这个容器有一些特殊的形态或者行为，比如需要自己管理子节点插入和移除，或者修改样式和拦截属性等。那么这个时候就需要使用一些复杂的组件实现方式。

* 关于组件自己实现子节点的 dom 插入和删除，`HippyWebRender` 默认的组件 `dom` 插入和删除，是使用 Web 的方法：

```javascript
Node.insertBefore<T extends Node>(node: T, child: Node | null): T;
Node.removeChild<T extends Node>(child: T): T;
```

* 如果组件不希望以这种默认的形式来实现，可以自行通过 `insertChild` 和 `removeChild` 方法管理节点的插入和移除逻辑。

```javascript
class CustomView extends HippyView{
    insertChild (child: HippyBaseView, childPosition: number) {
      // ...
    }
    removeChild (child: HippyBaseView){
      // ...
   }
}
```

* 关于组件 `props` 更新的拦截，需要实现组件的 `updateProps` 方法。

> 例子中，`data` 是组件本次更新的 `props` 数据信息，`defaultProcess()` 是 `HippyWebRenderer` 默认处理 `props` 更新的方法，开发者可以在这里拦截修改更新的数据后，依然使用默认的 `props` 进行更新，也可以不用默认的方法自行进行属性更新的遍历操作。

```javascript
class CustomView extends HippyView{
    
    updateProps (data: UIProps, defaultProcess: (component: HippyBaseView, data: UIProps) => void) {
      // ...
    }
}
```
