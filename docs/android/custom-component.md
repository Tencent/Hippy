# 自定义界面组件

App 开发中有可能使用到大量的UI组件，Hippy SDK已包括其中常用的部分，如`View`、`Text`、`Image`等，但这极有可能无法满足你的需求，这就需要对 UI 组件进行扩展封装。

# 组件扩展

我们将以MyView为例，从头介绍如果扩展组件。
扩展组件包括：

1. 扩展HippyViewController。
2. 实现createViewImpl方法、
3. 实现Props设置方法。
4. 手势事件处理。
5. 注册HippyViewController。

`HippyViewController`是一个视图管理的基类（如果是ViewGroup的组件，基类为`HippyGroupController`）。
在这个例子中我们需要创建一个`MyViewController`类，它继承`HippyViewController<MyView>`。`MyView`是被管理的UI组件类型，他应该是一个Android View或者ViewGroup。 `@HippyController`注解用来定义导出给JS使用时的组件信息。

```java
@HippyController(name = "MyView")
public class MyViewController extends HippyViewController<MyView>
{
    ...
}
```

## 实现 createViewImpl 方法

当需要创建对应试图时，引擎会调用`createViewImpl`方法。

```java
@Override
protected View createViewImpl(Context context)
{
    // context实际类型为HippyInstanceContext
    return new MyView(context);
}
```

## 实现属性 Props 方法

需要接收JS设置的属性，需要实现带有`@HippyControllerProps`注解的方法。
`@HippyControllerProps`可用参数包括：

- `name`（必须）：导出给JS的属性名称。
- `defaultType`（必须）：默认的数据类型。取值包括`HippyControllerProps.BOOLEAN`、`HippyControllerProps.NUMBER`、`HippyControllerProps.STRING`、`HippyControllerProps.DEFAULT`、`HippyControllerProps.ARRAY`、`HippyControllerProps.MAP`。
- `defaultBoolean`：当defaultType为HippyControllerProps.BOOLEAN时，设置后有效。
- `defaultNumber`：当defaultType为HippyControllerProps.NUMBER时，设置后有效。
- `defaultString`：当defaultType为HippyControllerProps.STRING时，设置后有效。

```java
@HippyControllerProps(name = "text", defaultType = HippyControllerProps.STRING, defaultString = "")
public void setText(MyView textView, String text)
{
    textView.setText(text);
}
```

# 手势事件处理

Hippy手势处理，复用了Android系统手势处理机制。扩展组件时，需要在控件的`onTouchEvent`添加部分代码，JS才能正常收到`onTouchDown`、`onTouchMove`、`onTouchEnd`事件。事件的详细介绍，参考Hippy事件机制。

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

需要在`HippyPackage`的`getControllers`方法中添加这个Controller，这样它才能在JS中被访问到。

```java
@Override
public List<Class<? extends HippyViewController>> getControllers()
{
    List<Class<? extends HippyViewController>> components = new ArrayList<>();
    components.add(MyViewController.class);
    return components;
}
```

# 更多特性

## 处理组件方法调用

在有些场景，JS需要调用组件的一些方法，比如`MyView`的`changeColor`。这个时候需要在`HippyViewController`重载`dispatchFunction`方法来处理JS的方法调用。

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

## 事件回调

Hippy SDK提供了一个基类 `HippyViewEvent`，其中封装了UI事件发送的逻辑，只需调用`send`方法即可发送事件到JS对应的组件上。比如我要在MyView的onAttachedToWindow的时候发送事件到前端的控件上面。
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

## HippyViewController 的回调函数

- `onAfterUpdateProps` ：属性更新完成后回调。
- `onBatchComplete` ：一次上屏操作完成后回调（适用于ListView类似的组件，驱动Adapter刷新等场景）。
- `onViewDestroy` ：试图被删除前回调（适用于类似回收试图注册的全局监听等场景）。
- `onManageChildComplete` ：在`HippyGroupController`添加、删除子试图完成后回调。

# 混淆说明

扩展组件的`Controller`类名和属性设置方法方法名不能混淆，可以增加混淆例外。

```java
-keep class * extends com.tencent.mtt.hippy.uimanager.HippyGroupController{ public *;}
-keep class * extends com.tencent.mtt.hippy.uimanager.HippyViewController{ public *;}
```
