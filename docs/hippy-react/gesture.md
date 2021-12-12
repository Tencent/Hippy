# 手势系统

Hippy 的手势系统使用起来相对更加便捷，主要区别就在不需要再依赖其它事件组件，所有组件，包括 View、Text、Image 或各种自定义控件等都可以设置点击、触屏事件监听；

## 点击事件

点击事件包括长按、点击、按下、抬手 4 种类型，分别由以下 4 种接口通知：

1. onClick：当控件被点击时，会回调此函数；
2. onPressIn：在长按或点击时，用户开始触屏（即用户按下手指时）该控件时，此函数会被调用；
3. onPressOut：在长按或点击时，用户结束触屏（即用户抬起手指时）该控件时，此函数会被调用；
4. onLongClick：当控件被长按时，此函数会被调用；

### 范例

通过配合使用 onPressIn 和 onPressOut 可以实现点击态的效果，例如下面的示例代码，实现了点击时背景变色的功能：

```jsx
render()
{
    let bgColor = "#FFFFFF"; //非点击状态下背景为白色
    if (this.state.pressedIn) {
        bgColor = "#000000"; //点击状态下背景为黑色
    }

    return (
        <View style={{backgroundColor: bgColor}}
              onPressIn={() => {
                  this.setState({pressedIn: true})
              }}
              onPressOut={() => {
                  this.setState({pressedIn: false})
              }}
        >
            点击按钮
        </View>
    );
}
```

## 触屏事件

触屏事件的处理与点击事件类似，可以再任何 React 组件上使用，touch 事件主要由以下几个回调函数组成：

1. onTouchDown(event)：当用户开始触屏控件时（即用户在该控件上按下手指时），将回调此函数，并将触屏点信息作为参数传递进来；
2. onTouchMove(event)：当用户在控件移动手指时，此函数会持续收到回调，并通过 event 参数告知控件的触屏点信息；
3. onTouchEnd(event)：当触屏操作结束，用户在该控件上抬起手指时，此函数将被回调，event 参数也会通知当前的触屏点信息；
4. onTouchCancel(event)：当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为 hidden），此函数会收到回调，触屏点信息也会通过 event 参数告知前端；

注意：若 onTouchCancel 被触发，则 onTouchEnd 不会被触发

以上回调函数均带有一个参数 event，该数据包含以下结构：

- name：该触屏事件的名称，分别对应为“onTouchDown“、“onTouchMove”、"onTouchEnd"、“onTouchCancel”；
- id：接收触屏事件的目标控件的 id，即触屏点所在控件的 id；
- page_x：触屏点相对于根元素的横坐标；
- page_y：触屏点相对于根元素的纵坐标；

以上结构中的 x 和 y 坐标已经经过转换，与屏幕分辨率无关的单位，例如 onTouchDonw 回调的 event 参数结构如下：

```json
{
  "name": "onTouchDown",
  "page_y": 172.27392578125,
  "id": 6574,
  "page_x": 532.6397094726562
}
```

## 事件冒泡

[[事件冒泡范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ListView)

点击事件和触屏事件均可以在回调函数中定义是否需要冒泡该事件到上层组件，点击或触屏事件发生时，终端会寻找该触屏点下声明了要处理该事件的最小控件：

!> HippyReact 默认不冒泡

1. 返回 `true` 或 `没有返回值`：控件处理完事件后，将不再继续冒泡，整个手势事件处理结束；
2. 返回 `false`：控件处理完事件后，事件将继续往上一层冒泡，如果找到某个父控件也设置了对应事件处理函数，则会调用改该回调函数，并再次根据其返回值决定是否继续冒泡。如果再向上冒泡的过程中达到了根节点，则事件冒泡结束；

`2.11.2 版本` 开始，系统 `onClick` 、`onTouchEvent` 事件回调函数添加了 `Event` 实例参数，包含了 `target` 属性（事件的真正发出节点）、`currentTarget`
属性（监听事件的节点）、`stopPropagation` 方法。`stopPropagation` 在开启全局冒泡后能阻止冒泡，优先级高于回调函数 `return 返回值`，`return 返回值` 后面逐渐废弃。

我们通过以下示例进一步说明事件冒泡的机制：

```js
render()
{
    return (
        <View style={{width: 300, height: 200, backgroundColor: "#FFFFFF"}}
              onClick={() => {
                  console.log("根节点 点击");
              }}
        >
            <Text style={{width: 150, height: 100, backgroundColor: "#FF0000"}}
                  onClick={() => console.log("按钮1 点击")}
            >
                点击按钮1
            </Text>
            <View style={{width: 150, height: 100, backgroundColor: "#00FF00"}}
                  onClick={() => {
                      console.log("父控件 点击");
                      // 不再向上冒泡到跟节点
                      return true;
                  }}
            >
                <Text style={{width: 80, height: 50, backgroundColor: "#0000FF"}}
                      onClick={() => {
                          console.log("按钮2 点击");
                          // 向上冒泡到父控件
                          return false;
                      }}
                >
                    点击按钮2
                </Text>
                <Text style={{width: 80, height: 50, backgroundColor: "#0000FF"}}
                      onClick={(event) => {
                          console.log("按钮2 点击", event.target.nodeId, event.currentTarget.nodeId);
                          event.stopPropagation();
                          // 调用了 stopPropagation 后，即使 return false，按钮2点击事件也不会向上冒泡到父节点
                          return false;
                      }}
                >
                    点击按钮3
                </Text>
            </View>
        </View>
    );
}
```

> 2.10.1 版本开始支持在 Hippy 初始化时通过 `bubbles` 参数设置默认冒泡（即事件处理return没有返回值，也会向上传递事件），默认 `false`

```js
new Hippy({
    appName: 'Demo',
    entryPage: App,
    // set bubbles, default is false
    bubbles: true,
}).start();
````

## 事件捕获

> 最低支持版本 2.11.5

[[事件捕获范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ListView)

点击事件和触屏事件支持事件捕获，如需注册捕获阶段的事件处理函数，则应在目标元素事件名添加 `Capture` 后缀，如 `onClickCapture`、`onTouchDownCapture`。

Hippy为了做更好的性能优化，如果目标元素没有 `Capture` 事件处理函数，默认不开启捕获，全局冒泡配置 `bubbles: false` 不会影响捕获开启。事件捕获设计与 Web 标准一致，当在任意一个捕获函数内调用 `stopPropagation` 时，会同时阻止剩余的捕获阶段、目标节点阶段和冒泡阶段执行。 

!> 事件捕获会有一定性能损耗，如非必要尽量不开启。

例子如下：

```js
render()
{
    return (
        <View style={{width: 300, height: 200, backgroundColor: "#FFFFFF"}}
              onClick={() => {
                  console.log("根节点 点击");
              }}
              onClickCapture={(event) => {
                  // 如果根节点调用 stopPropagation，则按钮2的 onClickCapture 和按钮1的 onClick 都不会触发
                  // event.stopPropagation();
                  console.log("根节点 捕获点击")
              }}
        >
            <Text style={{width: 150, height: 100, backgroundColor: "#FF0000"}}
                  onClick={() => {
                      // 点击按钮1不会触发根节点捕获点击
                      console.log("按钮1 点击")
                  }}
            >
                点击按钮1
            </Text>
            <View style={{width: 150, height: 100, backgroundColor: "#00FF00"}}>
                <Text style={{width: 80, height: 50, backgroundColor: "#0000FF"}}
                      onClickCapture={() => {
                          // 点击按钮2会触发根节点捕获点击
                          console.log("按钮2 点击");
                      }}
                >
                    点击按钮2
                </Text>
            </View>
        </View>
    );
}
```

## 事件的拦截

某些场景下，父控件又需要优先拦截到子控件的手势事件，因此 Hippy 也提供了手势事件拦截机制，手势拦截由父控件的两个属性控制 `onInterceptTouchEvent` 和`onInterceptPullUpEvent`
，这两个属性仅对能容纳子控件的组件生效，如 `<Image/>` 这种控件就不支持这两个属性：

- onInterceptTouchEvent：父控件是否拦截所有子控件的手势事件，true 为拦截，false 为不拦截（默认为 false）。当父控件设置该属性为 true 时，所有其子控件将无法收到任何 touch
  事件和点击事件的回调，不管是否有设置事件处理函数，在该父控件区域内按下、移动、抬起手指以及点击和长按发生时，终端将默认把事件发送给该父控件进行处理。如果父控件在设置 onInterceptTouchEvent 为 true
  之前，子控件已经在处理 touch 事件，那么子控件将收到一次 onTouchCancel 回调（如果子控件有注册该函数）；
- onInterceptPullUpEvent：该属性的作用与 onInterceptTouchEvent 类似，只是决定父控件是否拦截的条件稍有不同。为 true
  时，如果用户在当前父控件区域内发生了手指上滑的动作，后续所有的触屏事件将被该父控件拦截处理，所有其子控件将无法收到任何 touch 事件回调，不管是否有设置 touch 事件处理函数；如果拦截生效之前子控件已经在处理 touch
  事件，子控件将收到一次 onTouchCancel 回调。为 false 时，父控件将不会拦截事件，默认为 false；

注意，由于这两种标记拦截条件不同，onInterceptTouchEvent 标记设置为 true 之后，子控件的所有触屏事件都将失效，而 onInterceptPullUpEvent 则不会影响子控件的点击事件。

还是以代码为例：

```js
render()
{
    return (
        <View style={{width: 300, height: 200, backgroundColor: "#FFFFFF"}}
              onTouchMove={(event) => {
                  console.log("根节点 TouchMove：" + JSON.stringify(event));
              }}
        >
            <View style={{width: 150, height: 100, backgroundColor: "#FF0000"}}
                  onTouchMove={evt => console.log("红色区域 TouchMove：" + JSON.stringify(event))}
                  onTouchDown={(event) => {
                      console.log("红色区域 onTouchDown：" + JSON.stringify(event));
                  }}/>
            <View style={{width: 150, height: 100, backgroundColor: "#00FF00"}}
                  onTouchMove={(event) => {
                      console.log("绿色区域 TouchMove：" + JSON.stringify(event));
                      return false;
                  }}
                  onInterceptTouchEvent={true}
            >
                <View style={{width: 80, height: 50, backgroundColor: "#0000FF"}}
                      onTouchMove={(event) => {
                          console.log("蓝色区域 TouchMove：" + JSON.stringify(event));
                          return false;
                      }}/>
            </View>
        </View>
    );
}
```
