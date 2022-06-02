## Hippy Web Renderer 自定义组件

Hippy开发过程中可能有很多场景使用当前的能力是无法满足的，这就需要对UI组件封转或者引入一些三方的功能来完成需求。就需要使用
自定义组件

### 组件的扩展

接下来将以CustomView为例，从头介绍如何扩展组件。

扩展组件包括：

*扩展 HippyView。

*实现 实现构造方法。

*实现 设置自定义组件的tagName。

*实现 构造自定义组件的dom。

*实现 自定义组件的api能力。

*实现 自定义组件的属性。

### 扩展 HippyView

HippyView类，实现了一些HippyBaseView的接口和属性定义。在一个自定义组件中有几个比较重要的属性：

* id:每一个实例化component的唯一标识，默认会赋值给组件的dom的id属性

* pId：每一个实例化component的父组件标识

* tagName：是用来区分组件的类型，也是业务侧代码使用该组件时在nativeName属性上填写的值,用来关联自定义组件的key

* dom：真正挂载到document上的节点

* props：承载了从业务侧传递过来的属性和style的记录

下面这个例子中，我们创建了CustomView自定义组件,用来显示一个视频

第一步：

继承自HippyView。

实现构造方法。

设置自定义组件的tagName为CustomView，这样业务侧使用的时候就可以设置nativeName="CustomView"。

构造自定义组件的dom，我们为创建了一个video节点给dom属性。注意dom属性在构造方法结束前一定要设置上。

```typescript

import { HippyView, HippyWebEngine, HippyWebModule } from '@hippy/web-renderer';

class CustomView extends HippyView {
  constructor(context,id,pId) {
    super(context,id,pId);
    this.tagName = 'CustomView'; 
    this.dom = document.createElement('video'); 
  }
}

```

第二步：

实现自定义组件的api能力

实现自定义组件的属性

```typescript

import { HippyView, HippyWebEngine, HippyWebModule } from '@hippy/web-renderer';

class CustomView extends HippyView {
  
   set src(value){
     this.dom.src = value;
   } 
   
   get src(){
    return this.props['src'];
   }
    
   play(){
    this.dom.play();
   }
   
   pause(){
    this.dom.pause();
    this.context.sendUiEvent(this.id,'onPause',{});
   }
}

```

上面这个例子中 ：

我们为CustomView实现了一个属性src,当业务侧修改src属性当时候就会触发这里当set src()方法，我们就可以进行一些行为。

我们还实现两个组件的方法play和pause，当业务侧使用 callUIFunction(this.instance, 'play'/'pause', []);时就可以掉用到这里的两个方法。

在pause()方法中,我们使用sendUiEvent向业务侧使用的CustomView组件发送了一个onPause事件，业务侧的CustomView属性上设置的onPause回调就会被触发

>关于props：

>>HippyWebRenderer底层默认会将业务侧传递过来的原始props存储到组件到props属性上，然后针对更新的prop项逐个调用与之对应的key的set方法，来让组件获得一个
更新时机，从而进行一些行为。

>>props里面有一个对象style，承载了所有业务侧设置的样式。默认也是由HippyWebRenderer设置到自定义组件到dom上，中间其实会有一层转换主要是style中的值有
一些是hippy特有的，需要进行一次翻译才可以设置到dom的style上。

>关于context:
>>自定义组件被构造的时候会传入一个context，用来提供了一些关键的方法：
>>
```typescript
export interface ComponentContext {
     sendEvent: (type: string, params: any) => void;//向业务侧发送全局事件
     sendUiEvent: (id: number, type: string, params: any) => void;//向某个组件实例发送事件
     sendGestureEvent: (e: HippyTransferData.NativeGestureEvent) => void;//发送手势事件
     subscribe: (evt: string, callback: Function) => void;//订阅某个事件
     getModuleByName: (moduleName: string) => any;//获取模块实例，通过模块名
}
```

### 复杂组件

有的时候我们可能需要提供一个容器，用来装载一些已有的组件。而这个容器有一些特殊的形态或者行为，比如需要自己管理子节点插入和移除，或者修改样式和拦截属性等。那么
这个时候就需要使用一些复杂的组件实现方式

>关于组件自己实现子节点的dom插入和删除
>>HippyWebRender默认的组件dom插入和删除，是使用Web的

```typescript
Node.insertBefore<T extends Node>(node: T, child: Node | null): T;
Node.removeChild<T extends Node>(child: T): T;
```

>>来将子组件的dom插入和删除的。如果组件不希望以这种默认的形式来实现就需要自己实现

```typescript
class CustomView extends HippyView{
    insertChild (child: HippyBaseView, childPosition: number){
        ...
    }
    removeChild (child: HippyBaseView){
        ...
   }
}
```

>>管理子组件的插入与删除逻辑并且记录要插入和删除的组件

>关于组件props更新的拦截
>>需要实现组件的updateProps方法

```typescript
class CustomView extends HippyView{
    
    updateProps (data: UIProps, defaultProcess: (component: HippyBaseView, data: UIProps) => void){
      ...
    }
}
```

>>上面的例子中，data是组件本次更新的props数据信息，defaultProcess()是HippyWebRenderer默认处理props更新的方法，开发者可以
>>在这里拦截修改更新的数据后，依然使用默认的props更新方法进行更新，也可以不用默认的方法自行进行属性更新的遍历和操作。
