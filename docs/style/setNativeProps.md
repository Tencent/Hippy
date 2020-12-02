# setNativeProps

在做一些高频动画效果时由于需要经历JS层的多次重新渲染，会出现滞后卡顿的现象，`setNativeProps`提供了`ElementNode`下"简单粗暴"的方法直接修改终端原生组件的样式来优化性能。P.S. 可能产生的数据同步等逻辑上的副作用需要业务自行解决

## React

[[范例：SetNativeProps.jsx]](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/externals/SetNativeProps/index.jsx)

除了element component（如div）外，React 没有直接暴露 ElementNode 给业务使用，可以通过 [React.forwardRef](https://zh-hans.reactjs.org/docs/forwarding-refs.html) 转发，或者使用 Hippy 提供的 `UIManagerModule.getElementFromFiberRef` 方法（该方法会从当前节点逐个遍历子节点直到找到 `ElementNode` 元素并返回，有一定性能损耗） 获取第一个 `ElementNode`，使用 demo 如下：

```javascript
 class BusinessComponent extends React.Component {
    constructor(props) {
      super(props);
      this.customComRef = null;
    }
    componentDidMount() {
       const customElementDom = UIManagerModule.getElementFromFiberRef(this.customComRef);
       customElementDom.setNativeProps({
         height: 100
       })
    }
   render() {
      return <CustomComponent ref={ref => this.customComRef = ref} />
   }
 }

   ```

## Vue

[[范例：demo-set-native-props.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-set-native-props.vue)

Vue 如果是 HTML 元素，直接通过`$refs`可以获取到 DOM；如果是自定义组件，可以通过`$refs.x.$el` 获取，`setNativeProps`使用方法和 React 一致
