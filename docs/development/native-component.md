# 自定义组件

App 开发中有可能使用到大量的UI组件，Hippy SDK 已包括其中常用的部分，如`View`、`Text`、`Image` 等，但这极有可能无法满足你的需求，这就需要对 UI 组件进行扩展封装。支持 Android、iOS、Ohos、Flutter、Web(同构) 等平台。

<br/>
<br/>
<br/>

# Android

---

## 组件扩展

我们将以`MyView`为例，从头介绍如何扩展组件。

扩展组件包括：

1. 扩展 `HippyViewController`。
2. 实现 `createViewImpl方法`、
3. 实现 `Props` 设置方法。
4. 手势事件处理。
5. 注册 `HippyViewController`。

`HippyViewController` 是一个视图管理的基类（如果是`ViewGroup`的组件，基类为 `HippyGroupController`）。
在这个例子中我们需要创建一个 `MyViewController` 类，它继承 `HippyViewController<MyView>`。`MyView` 是被管理的UI组件类型，它应该是一个 `Android View` 或者 `ViewGroup`。 `@HippyController` 注解用来定义导出给JS使用时的组件信息。

```java
@HippyController(name = "MyView")
public class MyViewController extends HippyViewController<MyView>
{
    ...
}
```

## 实现 createViewImpl 方法

当需要创建对视图时，引擎会调用 `createViewImpl` 方法。

```java
@Override
protected View createViewImpl(Context context)
{
    // context实际类型为HippyInstanceContext
    return new MyView(context);
}
```

## 实现属性 Props 方法

需要接收 JS 设置的属性，需要实现带有 `@HippyControllerProps` 注解的方法。

`@HippyControllerProps` 可用参数包括：

- `name`（必须）：导出给JS的属性名称。
- `defaultType`（必须）：默认的数据类型。取值包括 `HippyControllerProps.BOOLEAN`、`HippyControllerProps.NUMBER`、`HippyControllerProps.STRING`、`HippyControllerProps.DEFAULT`、`HippyControllerProps.ARRAY`、`HippyControllerProps.MAP`。
- `defaultBoolean`：当 defaultType 为 HippyControllerProps.BOOLEAN 时，设置后有效。
- `defaultNumber`：当 defaultType 为 HippyControllerProps.NUMBER 时，设置后有效。
- `defaultString`：当 defaultType 为 HippyControllerProps.STRING 时，设置后有效。

```java
@HippyControllerProps(name = "text", defaultType = HippyControllerProps.STRING, defaultString = "")
public void setText(MyView textView, String text)
{
    textView.setText(text);
}
```

## 手势事件处理

Hippy手势处理，复用了 Android 系统手势处理机制。扩展组件时，需要在控件的 `onTouchEvent` 添加部分代码，JS才能正常收到 `onTouchDown`、`onTouchMove`、`onTouchEnd` 事件。事件的详细介绍，参考 Hippy 事件机制。

```java
@Override
public NativeGestureDispatcher getGestureDispatcher()
{
    return mGestureDispatcher;
}

@Override
public void setGestureDispatcher(NativeGestureDispatcher dispatcher)
{
    mGestureDispatcher = dispatcher;
}

@Override
public boolean onTouchEvent(MotionEvent event)
{
    boolean result = super.onTouchEvent(event);
    if (mGestureDispatcher != null)
    {
        result |= mGestureDispatcher.handleTouchEvent(event);
    }
    return result;
}
```

## 注册 HippyViewController

需要在 `HippyPackage` 的 `getControllers` 方法中添加这个Controller，这样它才能在JS中被访问到。

```java
@Override
public List<Class<? extends HippyViewController>> getControllers()
{
    List<Class<? extends HippyViewController>> components = new ArrayList<>();
    components.add(MyViewController.class);
    return components;
}
```

## 更多特性

### 自定义组件挂载纯native view的适配

在Hippy框架中，会将前端节点映射为终端的natvie view，view的显示尺寸和位置由框架自带的排版引擎根据前端设置的css计算得出，不需要走系统默认的measure和layout流程，所以我们在HippyRootView中对onMeasure和onLayout两个回调做了拦截：

```java
@Override
protected void onLayout(boolean changed, int left, int top, int right, int bottom) 
{
    // No-op since UIManagerModule handles actually laying out children.
}

@Override
protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) 
{
    setMeasuredDimension(MeasureSpec.getSize(widthMeasureSpec), MeasureSpec.getSize(heightMeasureSpec));
}
```

但一些业务场景中，自定义组件需要挂载一些非前端节点映射的纯native view，常见的比如video view，lottie view等，由于我们拦截了onMeasure和onLayout，这些视图无法获取到正确的显示尺寸和位置，导致显示异常，所以需要开发者自己手动调用measure和layout来解决这个问题，可以参考以下示例：
在自定义组件的Controller中Override onBatchComplete接口，在非前端节点映射的纯native view的父容器调用measure和layout

```java
private final Handler mHandler = new Handler(Looper.getMainLooper());

@Override
public void onBatchComplete(@NonNull View view) 
{
    super.onBatchComplete(view);
    mHandler.post(new Runnable() {
        @Override
        public void run() 
        {
            view.measure(View.MeasureSpec.makeMeasureSpec(view.getWidth(), View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(view.getHeight(), View.MeasureSpec.EXACTLY));
            view.layout(view.getLeft(), view.getTop(), view.getRight(), view.getBottom());
        }
    });
}
```

### 处理组件方法调用

在有些场景，JS需要调用组件的一些方法，比如 `MyView` 的 `changeColor`。这个时候需要在 `HippyViewController`重载 `dispatchFunction` 方法来处理JS的方法调用。

```java
public void dispatchFunction(MyView view, String functionName, HippyArray var)
{
    switch (functionName)
    {
        case "changeColor":
            String color = var.getString(0);
            view.setColor(Color.parseColor(color));
            break;
    }
    super.dispatchFunction(view, functionName, var);
}
```

### 事件回调

Hippy SDK 提供了一个基类 `HippyViewEvent`，其中封装了UI事件发送的逻辑，只需调用 `send` 方法即可发送事件到JS对应的组件上。比如我要在 `MyView` 的 `onAttachedToWindow` 的时候发送事件到前端的控件上面。
示例如下：

```java
@Override
protected void onAttachedToWindow() {
    super.onAttachedToWindow();

    // this is show how to send message to js ui
    HippyMap hippyMap = new HippyMap();
    hippyMap.pushString("test", "code");
    new HippyViewEvent(" onAttachedToWindow").send(this, hippyMap);
}
```

### HippyViewController 的回调函数

- `onAfterUpdateProps`：属性更新完成后回调。
- `onBatchComplete`：一次上屏操作完成后回调（适用于 ListView 类似的组件，驱动 Adapter刷新等场景）。
- `onViewDestroy`：视图被删除前回调（适用于类似回收视图注册的全局监听等场景）。
- `onManageChildComplete`：在 `HippyGroupController` 添加、删除子视图完成后回调。

## 混淆说明

扩展组件的 `Controller` 类名和属性设置方法名不能混淆，可以增加混淆例外。

```java
-keep class * extends com.tencent.mtt.hippy.uimanager.HippyGroupController{ public *;}
-keep class * extends com.tencent.mtt.hippy.uimanager.HippyViewController{ public *;}
```


# iOS

---

## 组件扩展概述

本文介绍如何在 iOS 端扩展自定义 UI 组件。我们以创建 `MyView` 为例，完整演示扩展流程。

> 注意：本文仅介绍 iOS 端工作，前端相关工作请查看对应的前端文档。

### 架构说明

Hippy iOS 组件系统包含三个核心部分：

```text
┌─────────────────────────────────────────────────────────┐
│                     组件架构                              │
└─────────────────────────────────────────────────────────┘

JavaScript (前端)
    ↓ (属性/方法调用)
ViewManager (管理器)
    ↓ 创建和管理
    ├─ ShadowView (布局计算) ← 可选，复杂布局时需要
    └─ UIView (实际显示)
```

- **ViewManager**：组件管理器，负责创建组件实例、处理属性设置、导出方法供 JS 调用
- **UIView**：实际显示的原生视图组件（必需）
- **ShadowView**：布局计算的虚拟视图，用于复杂布局（可选，大多数情况使用默认的 `HippyShadowView` 即可）

### 扩展步骤

扩展一个 UI 组件需要完成以下步骤：

1. **创建 ViewManager** - 继承 `HippyViewManager`
2. **创建 UIView** - 实现实际的视图组件
3. **注册组件** - 使用 `HIPPY_EXPORT_MODULE` 导出
4. **绑定属性** - 使用宏将 JS 属性映射到原生属性
5. **导出方法** - 使用宏导出供 JS 调用的方法
6. **创建 ShadowView**（可选）- 仅在需要自定义布局逻辑时

---

## 1. 创建 ViewManager

`ViewManager` 是组件的管理类，负责创建组件实例和处理 JS 与原生的通信。

### MyViewManager.h

```objectivec
#import <hippy/HippyViewManager.h>

@interface MyViewManager : HippyViewManager

@end
```

### MyViewManager.m

```objectivec
#import "MyViewManager.h"
#import "MyView.h"

@implementation MyViewManager

// 导出模块，JS 中使用 "MyView" 作为组件名
HIPPY_EXPORT_MODULE(MyView)

// 创建并返回实际的 UIView 实例
- (UIView *)view {
    return [[MyView alloc] init];
}

// 创建 ShadowView（可选）
// 大多数情况下返回默认的 HippyShadowView 即可
- (HippyShadowView *)shadowView {
    return [[HippyShadowView alloc] init];
}

@end
```

### 模块注册说明

**`HIPPY_EXPORT_MODULE(name)`**

- **作用**：将 ViewManager 注册到 Hippy 框架，使其可以被 JS 调用
- **参数**：`name` 是 JS 中使用的组件名称（可选）
  - 如果提供参数，JS 使用指定的名称：`HIPPY_EXPORT_MODULE(MyView)` → JS 中用 `<MyView />`
  - 如果不提供参数，自动使用类名去掉 "Manager" 后缀：`HIPPY_EXPORT_MODULE()` → `MyViewManager` → `<MyView />`

---

## 2. 创建 UIView

创建实际的原生视图组件。

### MyView.h

```objectivec
#import <UIKit/UIKit.h>

@interface MyView : UIView

// 自定义属性
@property (nonatomic, copy) NSString *text;
@property (nonatomic, strong) UIColor *textColor;
@property (nonatomic, assign) CGFloat fontSize;

@end
```

### MyView.m

```objectivec
#import "MyView.h"

@implementation MyView {
    UILabel *_label;
}

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        // 初始化 label
        _label = [[UILabel alloc] init];
        _label.textAlignment = NSTextAlignmentCenter;
        [self addSubview:_label];
        
        // 默认样式
        self.textColor = [UIColor blackColor];
        self.fontSize = 16.0;
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    _label.frame = self.bounds;
}

- (void)setText:(NSString *)text {
    _text = [text copy];
    _label.text = text;
}

- (void)setTextColor:(UIColor *)textColor {
    _textColor = textColor;
    _label.textColor = textColor;
}

- (void)setFontSize:(CGFloat)fontSize {
    _fontSize = fontSize;
    _label.font = [UIFont systemFontOfSize:fontSize];
}

@end
```

---

## 3. 属性导出

使用宏将 JS 属性映射到原生组件的属性。

### 3.1 基本属性导出

**`HIPPY_EXPORT_VIEW_PROPERTY(name, type)`**

直接将 JS 属性映射到同名的原生属性。

```objectivec
@implementation MyViewManager

HIPPY_EXPORT_MODULE(MyView)

// JS: <MyView text="Hello World" />
// → 自动调用 [myView setText:]
HIPPY_EXPORT_VIEW_PROPERTY(text, NSString)

// JS: <MyView textColor="#FF0000" />
// → 自动调用 [myView setTextColor:]
HIPPY_EXPORT_VIEW_PROPERTY(textColor, UIColor)

// JS: <MyView fontSize={18} />
// → 自动调用 [myView setFontSize:]
HIPPY_EXPORT_VIEW_PROPERTY(fontSize, CGFloat)

// JS: <MyView backgroundColor="#F0F0F0" />
HIPPY_EXPORT_VIEW_PROPERTY(backgroundColor, UIColor)

// 其他常用类型示例
HIPPY_EXPORT_VIEW_PROPERTY(enabled, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(placeholder, NSString)

- (UIView *)view {
    return [[MyView alloc] init];
}

@end
```

**支持的类型**：

- 基础类型：`BOOL`, `NSInteger`, `CGFloat`, `double` 等
- Objective-C 对象：`NSString`, `NSNumber`, `NSArray`, `NSDictionary` 等
- UIKit 类型：`UIColor`, `UIFont`, `UIImage` 等

### 3.2 属性名称映射

**`HIPPY_REMAP_VIEW_PROPERTY(jsName, nativeName, type)`**

当 JS 属性名与原生属性名不同时使用。

```objectivec
// JS 中使用 opacity，映射到原生的 alpha
// JS: <MyView opacity={0.5} />
// → 调用 [myView setAlpha:0.5]
HIPPY_REMAP_VIEW_PROPERTY(opacity, alpha, CGFloat)

// JS: <MyView color="#FF0000" />
// → 调用 [myView setTextColor:]
HIPPY_REMAP_VIEW_PROPERTY(color, textColor, UIColor)
```

**支持 KeyPath**：第二个参数可以使用 KeyPath 访问嵌套属性。

```objectivec
// JS: <MyView cornerRadius={10} />
// → 调用 [myView.layer setCornerRadius:10]
HIPPY_REMAP_VIEW_PROPERTY(cornerRadius, layer.cornerRadius, CGFloat)
```

### 3.3 自定义属性处理

**`HIPPY_CUSTOM_VIEW_PROPERTY(name, type, viewClass)`**

当需要自定义属性处理逻辑时使用。

```objectivec
// 自定义处理 fontWeight 属性
HIPPY_CUSTOM_VIEW_PROPERTY(fontWeight, NSString, MyView)
{
    // 隐藏参数：
    // - json: JS 传来的原始值
    // - view: 当前要设置的视图实例（类型为 viewClass）
    // - defaultView: 默认视图实例，用于获取默认值
    
    if (json) {
        // 有值时：解析并设置
        NSString *weight = [HippyConvert NSString:json];
        UIFont *currentFont = view.label.font;
        CGFloat fontSize = currentFont.pointSize;
        
        if ([weight isEqualToString:@"bold"]) {
            view.label.font = [UIFont boldSystemFontOfSize:fontSize];
        } else if ([weight isEqualToString:@"normal"]) {
            view.label.font = [UIFont systemFontOfSize:fontSize];
        }
    } else {
        // 无值时：使用默认值
        view.label.font = defaultView.label.font;
    }
}
```

**使用 `HippyConvert` 类型转换**：

```objectivec
#import <hippy/HippyConvert.h>

// 常用转换方法
UIColor *color = [HippyConvert UIColor:json];
CGFloat number = [HippyConvert CGFloat:json];
NSString *text = [HippyConvert NSString:json];
BOOL flag = [HippyConvert BOOL:json];
NSArray *array = [HippyConvert NSArray:json];
NSDictionary *dict = [HippyConvert NSDictionary:json];
```

### 3.4 Shadow 属性导出

对于影响布局的属性，使用 `HIPPY_EXPORT_SHADOW_PROPERTY` 导出到 ShadowView。

```objectivec
// 这些属性会传递给 ShadowView，参与布局计算
HIPPY_EXPORT_SHADOW_PROPERTY(numberOfLines, NSInteger)
HIPPY_EXPORT_SHADOW_PROPERTY(lineHeight, CGFloat)
```

---

## 4. 方法导出

使用 `HIPPY_EXPORT_METHOD` 导出供 JS 调用的方法。

### 4.1 基本方法导出

```objectivec
// 无返回值的方法
// JS: callNative('MyView', 'clear', componentId)
HIPPY_EXPORT_METHOD(clear:(nonnull NSNumber *)hippyTag) {
    // 注意：这里不在主线程执行
    // hippyTag 是组件的唯一标识
    
    // 需要在主线程操作 UI
    dispatch_async(dispatch_get_main_queue(), ^{
        MyView *view = (MyView *)[self.bridge.uiManager viewForHippyTag:hippyTag];
        view.text = @"";
    });
}
```

### 4.2 带回调的方法

```objectivec
// 带回调的方法
// JS: callNativeWithPromise('MyView', 'getText', componentId).then(result => ...)
HIPPY_EXPORT_METHOD(getText:(nonnull NSNumber *)hippyTag 
                    callback:(HippyPromiseResolveBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        MyView *view = (MyView *)[self.bridge.uiManager viewForHippyTag:hippyTag];
        
        // 返回结果给 JS
        NSDictionary *result = @{
            @"text": view.text ?: @"",
            @"length": @(view.text.length)
        };
        callback(result);
    });
}
```

### 4.3 推荐的 UI 操作方式

使用 `addUIBlock:` 在主线程安全地操作 UI。

```objectivec
HIPPY_EXPORT_METHOD(setText:(nonnull NSNumber *)hippyTag
                        text:(NSString *)text
                    animated:(BOOL)animated) {
    // 使用 UIBlock 确保在主线程执行
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, 
                                        NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        // viewRegistry 是 tag -> view 的映射
        MyView *view = (MyView *)viewRegistry[hippyTag];
        if ([view isKindOfClass:[MyView class]]) {
            if (animated) {
                [UIView transitionWithView:view
                                  duration:0.3
                                   options:UIViewAnimationOptionTransitionCrossDissolve
                                animations:^{
                                    view.text = text;
                                } completion:nil];
            } else {
                view.text = text;
            }
        }
    }];
}
```

### 4.4 JS 调用示例

```javascript
// 前端调用示例

// 无返回值
this.callNative('MyView', 'clear', this.myViewRef);

// 带参数
this.callNative('MyView', 'setText', this.myViewRef, 'New Text', true);

// 有返回值
const result = await this.callNativeWithPromise('MyView', 'getText', this.myViewRef);
console.log('Text content:', result.text, 'Length:', result.length);
```

---

## 5. 创建自定义 ShadowView（可选）

**何时需要自定义 ShadowView**：

- ✅ 需要自定义布局计算逻辑（如文本组件、列表组件）
- ✅ 需要在布局阶段处理特殊逻辑
- ❌ 普通视图使用默认的 `HippyShadowView` 即可

### MyShadowView.h

```objectivec
#import <hippy/HippyShadowView.h>

@interface MyShadowView : HippyShadowView

@property (nonatomic, assign) NSInteger numberOfLines;

@end
```

### MyShadowView.m

```objectivec
#import "MyShadowView.h"

@implementation MyShadowView

- (instancetype)init {
    if (self = [super init]) {
        _numberOfLines = 0;
    }
    return self;
}

// 重写布局方法，自定义布局逻辑
- (void)amendLayoutBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)blocks {
    [super amendLayoutBeforeMount:blocks];
    
    // 在这里可以根据 numberOfLines 等属性调整布局
    // ...
}

@end
```

### 在 ViewManager 中使用

```objectivec
@implementation MyViewManager

HIPPY_EXPORT_MODULE(MyView)

- (HippyShadowView *)shadowView {
    return [[MyShadowView alloc] init];  // 返回自定义的 ShadowView
}

- (UIView *)view {
    return [[MyView alloc] init];
}

// 导出到 ShadowView 的属性
HIPPY_EXPORT_SHADOW_PROPERTY(numberOfLines, NSInteger)

@end
```

---

## 完整示例

以下是一个完整的自定义组件示例：

### MyViewManager.h

```objectivec
#import <hippy/HippyViewManager.h>

@interface MyViewManager : HippyViewManager
@end
```

### MyViewManager.m

```objectivec
#import "MyViewManager.h"
#import "MyView.h"

@implementation MyViewManager

HIPPY_EXPORT_MODULE(MyView)

// 属性导出
HIPPY_EXPORT_VIEW_PROPERTY(text, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(textColor, UIColor)
HIPPY_EXPORT_VIEW_PROPERTY(fontSize, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(backgroundColor, UIColor)
HIPPY_REMAP_VIEW_PROPERTY(opacity, alpha, CGFloat)

HIPPY_CUSTOM_VIEW_PROPERTY(fontWeight, NSString, MyView) {
    if (json) {
        NSString *weight = [HippyConvert NSString:json];
        UIFont *currentFont = view.label.font;
        CGFloat fontSize = currentFont.pointSize;
        
        if ([weight isEqualToString:@"bold"]) {
            view.label.font = [UIFont boldSystemFontOfSize:fontSize];
        } else {
            view.label.font = [UIFont systemFontOfSize:fontSize];
        }
    } else {
        view.label.font = defaultView.label.font;
    }
}

// 方法导出
HIPPY_EXPORT_METHOD(clear:(nonnull NSNumber *)hippyTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager,
                                        NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        MyView *view = (MyView *)viewRegistry[hippyTag];
        view.text = @"";
    }];
}

HIPPY_EXPORT_METHOD(getText:(nonnull NSNumber *)hippyTag
                   callback:(HippyPromiseResolveBlock)callback) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager,
                                        NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        MyView *view = (MyView *)viewRegistry[hippyTag];
        NSDictionary *result = @{
            @"text": view.text ?: @"",
            @"length": @(view.text.length)
        };
        callback(result);
    }];
}

// 创建视图
- (UIView *)view {
    return [[MyView alloc] init];
}

// 创建 ShadowView（使用默认）
- (HippyShadowView *)shadowView {
    return [[HippyShadowView alloc] init];
}

@end
```

### MyView.h

```objectivec
#import <UIKit/UIKit.h>

@interface MyView : UIView

@property (nonatomic, copy) NSString *text;
@property (nonatomic, strong) UIColor *textColor;
@property (nonatomic, assign) CGFloat fontSize;
@property (nonatomic, readonly) UILabel *label;

@end
```

### MyView.m

```objectivec
#import "MyView.h"

@implementation MyView

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        // 初始化 label
        _label = [[UILabel alloc] init];
        _label.textAlignment = NSTextAlignmentCenter;
        [self addSubview:_label];
        
        // 默认样式
        self.textColor = [UIColor blackColor];
        self.fontSize = 16.0;
        self.backgroundColor = [UIColor whiteColor];
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    _label.frame = self.bounds;
}

- (void)setText:(NSString *)text {
    _text = [text copy];
    _label.text = text;
}

- (void)setTextColor:(UIColor *)textColor {
    _textColor = textColor;
    _label.textColor = textColor;
}

- (void)setFontSize:(CGFloat)fontSize {
    _fontSize = fontSize;
    _label.font = [UIFont systemFontOfSize:fontSize];
}

@end
```

---

## 总结

扩展 Hippy iOS 组件的核心步骤：

1. **创建 ViewManager** 继承 `HippyViewManager`
2. **创建 UIView** 实现实际视图
3. **使用 `HIPPY_EXPORT_MODULE`** 注册组件
4. **使用属性导出宏** 绑定 JS 属性
5. **使用 `HIPPY_EXPORT_METHOD`** 导出方法
6. **必要时自定义 ShadowView** 处理复杂布局

完成以上步骤后，你的自定义组件就可以在 Hippy 前端中使用了！


# Ohos

---

## TS 组件扩展

我们将以`ExampleViewA`为例，从头介绍如何扩展组件。
详细代码参考 [Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/ohos-demo/src/main/ets/hippy_extend)

扩展组件包括：

1. 扩展 `HippyCustomComponentView`，实现组件View `ExampleViewA`，以及组件的属性处理函数 `setProp` 和方法调用函数 `call`
2. 实现组件 `ExampleComponentA`
3. 实现 `Builder` 函数关联组件View和组件，并配置到 `ModuleLoadParams` 参数
4. 注册组件View `ExampleViewA`

因为鸿蒙ArkUI是声明式组装组件的，`ExampleViewA` 相当于组件的数据模型，`ExampleComponentA` 是实际的声明式组件，通过 `Builder` 函数来构建组件，通过`@ObjectLink` 装饰器来绑定数据。

## 实现组件View

```typescript
@Observed
export class ExampleViewA extends HippyCustomComponentView {
  constructor(ctx: NativeRenderContext) {
    super(ctx)
  }

  setProp(propKey: string, propValue: HippyAny): boolean {
    return super.setProp(propKey, propValue)
  }

  call(method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {

  }
}
```

## 实现组件

```typescript
@Component
export struct ExampleComponentA {
  @ObjectLink renderView: ExampleViewA
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  build() {
    Stack() {
      Text("This is a custom component A.")
      ForEach(this.children, (item: HippyRenderBaseView) => {
        buildHippyRenderView(item, null)
      }, (item: HippyRenderBaseView) => item.tag + '')
    }
    .applyRenderViewBaseAttr(this.renderView)
  }
}

```

## 实现 `Builder` 函数并配置

实现：

```typescript
@Builder
export function buildCustomRenderView($$: HippyRenderBaseView) {
  if ($$ instanceof ExampleViewA) {
    ExampleComponentA({ renderView: $$ as ExampleViewA, children: $$.children })
  }
}
```

配置：

```typescript
loadParams.wrappedCustomRenderViewBuilder = wrapBuilder(buildCustomRenderView)
```

## 注册组件View

继承 `HippyAPIProvider` 接口并注册自定义组件View：

```typescript
export class ExampleAPIProvider extends HippyAPIProvider {
  getCustomRenderViewCreatorMap(): Map<string, HRRenderViewCreator> | null {
    let registerMap: Map<string, HRRenderViewCreator> =
      new Map()
    registerMap.set("ExampleViewA",
      (ctx): HippyRenderBaseView => new ExampleViewA(ctx))
    return registerMap
  }
}
```

配置 `ExampleAPIProvider` 到 `EngineInitParams` 参数:

```typescript
params.providers = new Array(new ExampleAPIProvider())
```

## C 组件扩展

详细代码参考 [Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/ohos-demo/src/main/cpp/hippy_extend)


# Voltron

---

## 组件扩展

实际应用开发中，我们经常会遇到需要展示二维码的场景，所以我们这里就以 `QrImage` 为例，从头介绍如何扩展组件。

> 本文主要介绍flutter侧工作，前端工作请查看对应的文档。

扩展一个 UI 组件需要包括以下工作：

1. 创建对应的 `Controller`，
2. 创建对应的 `ViewModel`
3. 创建对应的 `Widget`
4. 终端注册组件
5. 前端注册组件及使用

## 创建对应的 `Controller`

```dart
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

class QrController extends BaseViewController<QrRenderViewModel> {
  static const String kClassName = "QrImage";

  // 提供创建对应 Widget 的方法
  @override
  Widget createWidget(BuildContext context, QrRenderViewModel viewModel) {
    return QrWidget(viewModel);
  }

  // 创建创建对应 ViewModel 的方法
  @override
  QrRenderViewModel createRenderViewModel(
    RenderNode node,
    RenderContext context,
  ) {
    return QrRenderViewModel(
      node.id,
      node.rootId,
      node.name,
      context,
    );
  }

  // 组件属性设置，将前端的 Props 对应设置到 ViewModel 中，可类比 Native Renderer 中的 View
  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    // 这里注意默认值的类型
    extraMap[NodeProps.kText] = ControllerMethodProp<QrRenderViewModel, String>(setText, '');
    extraMap[NodeProps.kLevel] = ControllerMethodProp<QrRenderViewModel, String>(setLevel, enumValueToString(QrErrorCorrectLevel.L));
    return extraMap;
  }

  // 给 ViewModel 设置对应属性
  @ControllerProps(NodeProps.kText)
  void setText(QrRenderViewModel viewModel, String text) {
    viewModel.text = text;
  }

  // 给 ViewModel 设置对应属性
  @ControllerProps(NodeProps.kLevel)
  void setLevel(QrRenderViewModel viewModel, String level) {
    switch (level) {
      case 'l':
        viewModel.level = QrErrorCorrectLevel.L;
        break;
      case 'm':
        viewModel.level = QrErrorCorrectLevel.M;
        break;
      case 'q':
        viewModel.level = QrErrorCorrectLevel.Q;
        break;
      case 'h':
        viewModel.level = QrErrorCorrectLevel.H;
        break;
      default:
        viewModel.level = QrErrorCorrectLevel.L;
    }
  }

  // 处理 UI 事件，类似于 this.$refs.input.focus(); 这里可以参考 TextInput 设计
  @override
  void dispatchFunction(
    QrRenderViewModel viewModel,
    String functionName,
    VoltronArray array, {
    Promise? promise,
  }) {
    super.dispatchFunction(viewModel, functionName, array, promise: promise);
  }

  @override
  String get name => kClassName;
}
```

## 创建对应的 `ViewModel`

这里重点关注对于属性的设置，类似于 `text` 和 `level` ， `text` 指的是二维码对应的数据，`level` 则可以参考 [https://pub.dev/packages/qr_flutter](https://pub.dev/packages/qr_flutter) 

!> 千万注意要重写相等操作符，Voltron 底层使用了 Provider 来做状态管理，我们会根据 ViewModel 是否相等来判断当前 Widget 是否需要更新

```dart
import 'package:qr_flutter/qr_flutter.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

class QrRenderViewModel extends GroupViewModel {
  String? text;
  int level = QrErrorCorrectLevel.L;

  QrRenderViewModel(
    int id,
    int instanceId,
    String className,
    RenderContext context,
  ) : super(id, instanceId, className, context);

  QrRenderViewModel.copy(
      int id,
      int instanceId,
      String className,
      RenderContext context,
      QrRenderViewModel viewModel,
      ) : super.copy(id, instanceId, className, context, viewModel) {
    text = viewModel.text;
    level = viewModel.level;
  }

  @override
  bool operator ==(Object other) {
    return other is QrRenderViewModel &&
        text == other.text &&
        level == other.level;
  }

  @override
  int get hashCode =>
      text.hashCode |
      level.hashCode |
      super.hashCode;
}
```

## 创建对应的 `Widget`

这里需要注意，如果你的组件需要参与 `css` 位置计算，那么需要包裹在 `PositionedWidget` 中（大部分的组件均是如此，例如 `TextInput`，`View` 等），如果只需要参与 `css` 宽高计算，则需要包裹在 `BoxWidget` 中（例如可以参考 `ListView` 中的 `ListItem` ），还有一部分不需要实际存在的组件，则可以自行定制（例如 `Modal` 组件，本身并不需要实际存在，打开之后是新的蒙层）。

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

class QrWidget extends FRStatefulWidget {
  final QrRenderViewModel _viewModel;

  QrWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _QrWidgetState();
  }
}

class _QrWidgetState extends FRState<QrWidget> {
  @override
  Widget build(BuildContext context) {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build qr widget",
    );
    // 这里注意一定要使用 Provider，以实现数据变更驱动视图变更
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Consumer<QrRenderViewModel>(
        builder: (context, viewModel, widget) {
          return PositionWidget(
            viewModel,
            child: qrView(viewModel),
          );
        },
      ),
    );
  }

  Widget qrView(QrRenderViewModel viewModel) {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build qr inner widget",
    );
    var text = viewModel.text;
    if (text != null && text.isNotEmpty) {
      return QrImage(
        data: text,
        errorCorrectionLevel: viewModel.level,
        padding: const EdgeInsets.all(0),
      );
    } else {
      return Container();
    }
  }
}
```

## 注册组件

上面的工作做完后，我们需要把组件注册进入 Voltron 应用，还记得初始化时的 `MyAPIProvider` 吗，这里我们要传入

```dart
class MyAPIProvider implements APIProvider {

  // 这个是模块扩展
  @override
  List<ModuleGenerator> get nativeModuleGeneratorList => [];

  // 这里是 JavaScript 模块生成器
  @override
  List<JavaScriptModuleGenerator> get javaScriptModuleGeneratorList => [];

  // 这里是组件扩展，将我们扩展的组件按照对应格式写进即可，注意这里的 KClassName 要与前端注册保持一致
  @override
  List<ViewControllerGenerator> get controllerGeneratorList => [
      ViewControllerGenerator(
        QrController.kClassName,
        (object) => QrController(),
      )
    ];
}
```

在引擎初始化的时候传入即可

```dart
// ...
initParams.providers = [
  MyAPIProvider(),
];
// ...
```

## 前端使用

### 如果您使用的是`hippy-vue`

可以参考 [hippy-vue/customize](api/hippy-vue/customize)

### 如果您是用的是`hippy-react`

可以参考 [hippy-react/customize](api/hippy-react/customize)

## 手势事件处理

Voltron 手势处理集成在 `PositionWidget` 或者 `BoxWidget` 中，无需用户手动处理，只要外层包裹在上述两种Widget下，则默认自带 `onClick` , `onLongclick` , `onTouchDown`, `onTouchMove` , `onTouchEnd` 等等一系列手势事件

## 更多特性

## 处理组件方法调用

在有些场景，JavaScript 需要调用组件的一些方法，比如 `QrView` 的 `changeText`。这个时候需要在 `QrController`重载 `dispatchFunction` 方法来处理JS的方法调用。对应的前端调用文档 [hippy-react/customize](api/hippy-react/customize)

```dart
@override
void dispatchFunction(
  QrRenderViewModel viewModel,
  String functionName,
  VoltronArray array, {
  Promise? promise,
}) {
  super.dispatchFunction(viewModel, functionName, array, promise: promise);
  if (functionName == "changeText") {}
  switch (functionName) {
    case "changeText":
      String? text = array.get<String>(0);
      if (text != null) {
        viewModel.text = text;
        // 需要注意，如果在调用事件时涉及到界面更新，则需要调用 ViewModel 的 update 方法来触发更新，如果是类似于 input 的 focus()，不涉及 UI 更新，则不需要
        viewModel.update();
      }
      break;
  }
}
```

## 事件回调

Voltron SDK 提供了 `context.bridgeManager.sendComponentEvent(rootId, id, eventName, params);`方法，封装了 UI 事件发送的逻辑，在任意地方找到 `RenderContext` 调用即可发送事件到 JavaScript 对应的组件上。比如我要在 `QrView` 的 `build` 的时候发送事件到前端的控件上面。
示例如下：

```dart
@override
Widget build(BuildContext context) {
  var params = VoltronMap();
  params.push("test", "code");
  widget._viewModel.context.bridgeManager.sendComponentEvent(
    widget._viewModel.rootId,
    widget._viewModel.id,
    "eventName",
    params,
  );
  // return SomeWidget();
}

```

<br/>
<br/>
<br/>

# Web

## 组件扩展

扩展组件主要包括：

1. 扩展 `HippyWebView`
2. 实现构造方法
3. 实现设置自定义组件的 `tagName`
4. 实现构造自定义组件的 `dom`
5. 实现自定义组件的 `API 能力`
6. 实现自定义组件的属性

其中 `HippyWebView` 类，实现了一些 HippyBaseView 的接口和属性定义，在一个自定义组件中有几个比较重要的属性：

- id: 每一个实例化 component 的唯一标识，默认会赋值给组件 dom 的 id 属性
- pId: 每一个实例化 component 的父组件标识
- tagName: 是用来区分组件的类型，也是业务侧代码使用该组件时在 `nativeName` 属性上填写的值，用来关联自定义组件的 key
- dom: 真正挂载到document上的节点
- props: 承载了从业务侧传递过来的属性和style的记录

注: tagName 用来和 React/Vue 注册的自定义组件的 nativeName 关联，可参考:

### 如果您使用的是`hippy-vue`

可以参考 [hippy-vue/customize](api/hippy-vue/customize)

### 如果您是用的是`hippy-react`

可以参考 [hippy-react/customize](api/hippy-react/customize)

### 例子

下面这个例子中，我们创建了 `CustomView` 的自定义组件，用来显示一个视频

- 第一步，进行初始化

```javascript

import { HippyWebView, HippyWebEngine, HippyWebModule } from '@hippy/web-renderer';

// 继承自 `HippyWebView`
class CustomView extends HippyWebView {
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

- 第二步，实现自定义组件的 API 能力和相关属性

    我们为 `CustomView` 实现了一个属性 `src`，当 JS 业务侧修改 src 属性时就会触发 `set src()` 方法并且获取到变更后的 value。 
  
    我们还实现了组件的两个方法 `play` 和 `pause`，当 JS 业务侧使用 `callUIFunction(this.instance, 'play'/'pause', []);` 的时就会调用到这两个方法。

    在 `pause()` 方法中，我们使用 `sendUiEvent` 向 JS 业务侧发送了一个 `onPause` 事件，属性上设置的回调就会被触发。

```javascript

import { HippyWebView, HippyWebEngine, HippyWebModule } from '@hippy/web-renderer';

class CustomView extends HippyWebView {
  
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


## 复杂组件

有的时候我们可能需要提供一个容器，用来装载一些已有的组件。而这个容器有一些特殊的形态或者行为，比如需要自己管理子节点插入和移除，或者修改样式和拦截属性等。那么这个时候就需要使用一些复杂的组件实现方式。

- 关于组件自己实现子节点的 dom 插入和删除，`HippyWebRender` 默认的组件 `dom` 插入和删除，是使用 Web 的方法：

```javascript
Node.insertBefore<T extends Node>(node: T, child: Node | null): T;
Node.removeChild<T extends Node>(child: T): T;
```

- 如果组件不希望以这种默认的形式来实现，可以自行通过 `insertChild` 和 `removeChild` 方法管理节点的插入和移除逻辑。

```javascript
class CustomView extends HippyWebView{
    insertChild (child: HippyBaseView, childPosition: number) {
      // ...
    }
    removeChild (child: HippyBaseView){
      // ...
   }
}
```

- 关于组件 `props` 更新的拦截，需要实现组件的 `updateProps` 方法。

> 例子中，`data` 是组件本次更新的 `props` 数据信息，`defaultProcess()` 是 `HippyWebRenderer` 默认处理 `props` 更新的方法，开发者可以在这里拦截修改更新的数据后，依然使用默认的 `props` 进行更新，也可以不用默认的方法自行进行属性更新的遍历操作。

```javascript
class CustomView extends HippyWebView{
    
    updateProps (data: UIProps, defaultProcess: (component: HippyBaseView, data: UIProps) => void) {
      // ...
    }
}
```

