[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/renderer/index"](_packages_hippy_react_src_renderer_index_.md)

# External module: "packages/hippy-react/src/renderer/index"

## Index

### Variables

* [hippyReconciler](_packages_hippy_react_src_renderer_index_.md#const-hippyreconciler)

## Variables

### `Const` hippyReconciler

• **hippyReconciler**: *any* =  reactReconciler({
  ...hostConfigs,
  clearTimeout,
  setTimeout,
  isPrimaryRenderer: true,
  noTimeout: -1,
  supportsMutation: true,
  supportsHydration: false,
  supportsPersistence: false,
  now: Date.now,
  scheduleDeferredCallback: () => {},
  cancelDeferredCallback: () => {},
})

*Defined in [packages/hippy-react/src/renderer/index.ts:4](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/index.ts#L4)*
