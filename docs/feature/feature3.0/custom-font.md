<!-- markdownlint-disable no-duplicate-header -->

# 自定义字体

---

# 前端

前端使用自定义字体非常简单，和浏览器一样，使用 [font-family](https://www.w3schools.com/cssref/pr_font_font-family.asp) 样式即可。

有两个范例：[hippy-react-demo](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx#L49)、[hippy-vue-demo](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue#L41)

但是如果要使用操作系统自带以外的字体，需要单独整合一下，继续阅读下面内容。

# Ohos

## 整合字体文件

Ohos 只需要在静态资源 `resfile` 目录中建立 `fonts` 目录，然后把字体文件拷贝进去即可。
当然其它目录也可以，也可以下载字体文件到某个目录。

> 对于 `rawfile` 目录里的字体文件，因为鸿蒙提供的rawfile操作是一套非路径Api，无法获取文件路径，所以为了使用路径需要拷贝字体文件到一个临时目录，示例代码参考[EntryAbility.ets](https://github.com/Tencent/Hippy/blob/main/framework/examples/ohos-demo/src/main/ets/entryability/EntryAbility.ets)里。

需要注意的是，字体文件名需要和 FontFamily 一致，因为虽然也可以做字体文件名映射，但是字体和文件名一致无疑是最简单的办法。

> 官方 demo 的字体目录参考 [resfile/fonts](https://github.com/Tencent/Hippy/tree/main/framework/examples/ohos-demo/src/main/resources/resfile/fonts)

## 注册字体

```typescript
let fontPath = `${getContext().resourceDir}/fonts/TTTGB.otf`;
font.registerFont({
  familyName: 'TTTGB',
  familySrc: `file://${fontPath}`
})
```

具体代码可参考 Demo 里 [EntryAbility.ets](https://github.com/Tencent/Hippy/blob/main/framework/examples/ohos-demo/src/main/ets/entryability/EntryAbility.ets)

## 配置字体路径到 C 层

继承 `HippyFontAdapter` 接口并配置自定义字体 familyName 和文件路径：

```typescript
export class ExampleFontAdapter implements HippyFontAdapter {
  // 注册字体路径至hippy测量函数
  getCustomFontPathMap(): Map<string, string> | null {
    let map = new Map<string, string>();
    const fontFile = `${getContext().resourceDir}/fonts/TTTGB.otf`;
    map.set("TTTGB", fontFile);
    return map;
  }
}
```

具体代码可参考 Demo 里 [ExampleFontAdapter.ets](https://github.com/Tencent/Hippy/blob/main/framework/examples/ohos-demo/src/main/ets/hippy_extend/ExampleFontAdapter.ets)

配置 `ExampleFontAdapter` 到 `EngineInitParams` 参数:

```typescript
params.fontAdapter = new ExampleFontAdapter()
```
