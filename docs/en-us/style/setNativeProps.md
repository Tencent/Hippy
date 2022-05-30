# SetNativeProps

When doing some high-frequency animation effects, due to the need to re-render the JS layer for many times, the phenomenon of lag jam will occur.`setNativeProps` provides a "simple and crude" method under `ElementNode` to directly modify the style of the native components to optimize performance. At present, this method can only modify the `style`, and other attributes are not supported temporarily. P.S. Logical side effects such as data synchronization that may occur need to be solved by the developer

## React

[[Example: SetNativeProps.jsx scenario](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/externals/SetNativeProps/index.jsx)

Except for element component (such as div), React does not directly expose ElementNode for developer use. You can use [React.forwardRef]（ https://zh-hans.reactjs.org/docs/forwarding-refs.html ）forward, or use the `UIManagerModule.getElementFromFiberRef` method provided by Hippy  (this method will traverse the child nodes one by one from the current node until the 'ElementNode' element is found and returned, with a certain performance loss) obtains the first 'ElementNode'. The demo is as follows:

```javascript
 class BusinessComponent extends React.Component {
    constructor(props) {
      super(props);
      this.customComRef = null;
    }
    componentDidMount() {
       const customElementDom = UIManagerModule.getElementFromFiberRef(this.customComRef);
       customElementDom.setNativeProps({
         style: { height: 100 }
       })
    }
   render() {
      return <CustomComponent ref={ref => this.customComRef = ref} />
   }
 }
```

## Vue

[[Example: demo-set-native-props.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-set-native-props.vue)

If Vue is an HTML element, you can get DOM directly through `$refs`. For custom components, you can use `$refs.x.$el` get. `setNativeProps` is used in the same way as React.
