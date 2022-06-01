# Custom UI Components

App development may use a large number of UI components, Hippy SDK has included the commonly used parts, such as `View`, `Text`, `Image`, etc., but it is highly likely that they can not meet your needs, which requires to extend and encapsulate UI components.

# Component Extensions

We will take `MyView` as an example and introduce how to extend components from scratch.

To extend a component, you should:

1. extend `HippyViewController`,
2. implement the `createViewImpl` method
3. implement the `Props` setting method,
4. handle gesture events,
5. register `HippyViewController`.

`HippyViewController` is a base class for view management (if it is a `ViewGroup` component, the base class is `HippyGroupController`).
In this example we need to create a `MyViewController` class, which inherits `HippyViewController<MyView>`. `MyView` is the type of UI component being managed, and it should be an `Android View` or `ViewGroup`. The `@HippyController` annotation is used to define the component information when exported for use by JS.

```java
@HippyController(name = "MyView")
public class MyViewController extends HippyViewController<MyView>
{
    ...
}
```

## Implement the createViewImpl method

The engine calls the `createViewImpl` method when a pair of views needs to be created.

``` java
@Override
protected View createViewImpl(Context context)
{
    // context is actually of type HippyInstanceContext
    return new MyView(context);
}
```

## Implement the properties Props method

Need to receive properties set by JS, and implement the methods with `@HippyControllerProps` annotation.

`@HippyControllerProps` available parameters:

- `name` (required): the name of the property exported to JS.
- `defaultType` (required): the default data type. Values include `HippyControllerProps.BOOLEAN`, `HippyControllerProps.NUMBER`, `HippyControllerProps.STRING`, `HippyControllerProps.DEFAULT`, `HippyControllerProps.ARRAY`, `HippyControllerProps.MAP`.
- `defaultBoolean`: valid when defaultType is HippyControllerProps.BOOLEAN
- `defaultNumber`: valid when defaultType is HippyControllerProps.NUMBER
- ``defaultString``: valid when defaultType is HippyControllerProps.STRING

```java
@HippyControllerProps(name = "text", defaultType = HippyControllerProps.STRING, defaultString = "")
public void setText(MyView textView, String text)
{
    textView.setText(text);
}
```

# Gesture Event Handling

Hippy gesture handling  reuses the Android gesture handling mechanism. When extending a component, you need to add some code to the `onTouchEvent` of the component in order for JS to receive `onTouchDown`, `onTouchMove`, `onTouchEnd` events properly. For a detailed description of events, refer to Hippy event mechanism.

``` java
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

## Register HippyViewController

This Controller needs to be added to the `getControllers` method of the `HippyPackage` so that it can be accessed in JS.

``` java
@Override
public List<Class<? extends HippyViewController>> getControllers()
{
    List<Class<? extends HippyViewController>> components = new ArrayList<>();
    components.add(MyViewController.class);
    return components;
}
```

# More Features

## Handling component method calls

In some scenarios, JS needs to call some of the component's methods, such as `MyView`'s `changeColor`. This time you need to override the `dispatchFunction` method in `HippyViewController` to handle the JS method calls.

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

## Event Callbacks

Hippy SDK provides a base class `HippyViewEvent`, which encapsulates the logic of sending UI events. Just call the `send` method to send the event to the JS corresponding component. For example, if I want to send an event to the front-end components on `MyView`'s `onAttachedToWindow`.

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

## HippyViewController's callback function

- `onAfterUpdateProps`: Callback after the property update is complete.
- `onBatchComplete`: callback after an up-screen operation is completed (for ListView-like components, driving scenarios like Adapter refresh).
- `onViewDestroy`: callback before the view is deleted (for scenarios like global listeners that recycle view registrations, etc.).
- `onManageChildComplete`: Callback after `HippyGroupController` has finished adding or removing child views.

# Obfuscation Instructions

The `Controller` class name and property setting method name of the extended component cannot be obfuscated, but you can add obfuscation exceptions.

```java
-keep class * extends com.tencent.mtt.hippy.uimanager.HippyGroupController{ public *;}
-keep class * extends com.tencent.mtt.hippy.uimanager.HippyViewController{ public *;}
```
