# ECMAScript 与 Java 类型映射

当通过 Bridge 进行调用时，Bridge 编解码器会自动将【源类型】转换成为【目标类型】供业务模块使用。

> 如 JS 调用 Java 时，会将传入的 ECMAScript 对象转换成为 Java 的对应类型，反之亦然。

Hippy 在 Java 中提供了两套类型系统：

* Recommennd Type System: 全新设计的类型系统，可以双向表达所有 [HTML structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) 中支持的类型（推荐）。
* Compatible Type System: 旧类型系统，结构简单但无法完整（双向）表达类型，仅存量代码使用（不推荐）。

## 类型映射关系

| ECMAScript Type Category  | ECMAScript Type              | Recommennd(New) Type in Java       | Compatible(Old) Type in Java           |
|---------------------------|------------------------------|------------------------------------|----------------------------------------|
| Primitives                | true                         | true                               | true                                   |
|                           | false                        | false                              | false                                  |
|                           | null                         | (#1).JSOddball#Null                | null                                   |
|                           | undefined                    | (#1).JSOddball#Undefined           | (#2).ConstantValue#Undefined           |
|                           | number                       | int                                | int                                    |
|                           |                              | double                             | double                                 |
|                           | bigint                       | java.math.BigInteger               | java.math.BigInteger                   |
|                           | string                       | java.lang.String                   | java.lang.String                       |
| Primitive wrapper objects | Boolean                      | (#1).objects.JSBooleanObject#True  | true                                   |
|                           |                              | (#1).objects.JSBooleanObject#False | false                                  |
|                           | Number                       | (#1).objects.JSNumberObject        | double                                 |
|                           | BigInt                       | (#1).objects.JSBigintObject        | java.math.BigInteger                   |
|                           | String                       | (#1).objects.JSStringObject        | java.lang.String                       |
| Fundamental objects       | Object                       | (#1).JSObject                      | (#2).HippyMap                          |
| Indexed collections       | Array(dense)                 | (#1).JSDenseArray                  | (#2).HippyArray  (Not fully supported) |
|                           | Array(sparse)                | (#1).JSSparseArray                 | N/A                                    |
| Keyed collections         | Map                          | (#1).JSMap                         | (#2).HippyMap (Not fully supported)    |
|                           | Set                          | (#1).JSSet                         | (#2).HippyArray (Not fully supported)  |
| Structured data           | ArrayBuffer                  | (#1).JSArrayBuffer                 | N/A                                    |
|                           | SharedArrayBuffer            | (#1).JSSharedArrayBuffer           | N/A                                    |
|                           | ArrayBufferView              | (#1).JSDataView                    | N/A                                    |
| Dates                     | Date                         | java.util.Date                     | java.util.Date                         |
| Error objects             | Error                        | (#1).JSError                       | N/A                                    |
|                           | EvalError                    |                                    |                                        |
|                           | RangeError                   |                                    |                                        |
|                           | ReferenceError               |                                    |                                        |
|                           | SyntaxError                  |                                    |                                        |
|                           | TypeError                    |                                    |                                        |
|                           | URIError                     |                                    |                                        |
| Text processing           | RegExp                       | (#1).JSRegExp                      | N/A                                    |
| Array Holes               | undefined(hole)              | (#1).JSOddball#Hole                | (#2).ConstantValue#Hole                |
| Host Object               | Object(with internal fields) | java.lang.Object                   | N/A                                    |
| WebAssembly               | WebAssembly.Module           | (#1).wasm.WasmModule               | N/A                                    |
|                           | WebAssembly.Memory           | (#1).wasm.WasmMemory               | N/A                                    |

1. com.tencent.mtt.hippy.runtime.builtins
2. com.tencent.mtt.hippy.common

## 类型纠正

由于 ECMAScript 标准未定义 [number](https://262.ecma-international.org/#sec-ecmascript-language-types-number-type) 类型在 VM 内的存储（表达）方式，不同 VM 引擎实现对于相同值的存储实现有可能不同，从而引发类型偏差。

> 例如:
> 在 ECMAScript 的实现 v8 内，如整型值超过 Smi 可表达的最大大小，会使用 Heap Number 进行存储，导致其表达为 `double` 类型。

类型系统会自动完成类型纠正，还原用户原始类型。

> 例如:
> 当 `double` 类型可以表达为 `int` 类型时，系统会自动转换为 `int` 类型

## 新旧类型互转

新旧类型系统间的类型互转可通过调用下述方法实现：

* Recommennd(New) ---> Compatible(Old): `com.tencent.mtt.hippy.runtime.utils.ValueConverter#toHippyValue`
* Compatible(Old) ---> Recommennd(New): `com.tencent.mtt.hippy.runtime.utils.ValueConverter#toJSValue`

> 由于新类型系统所能表达的 ECMAScript 类型更加精细,
> 故从新类型系统（Recommennd）转换到旧类型系统（Compatible）时，可能会造成类型丢失

一般情况下，用户无需进行新旧类型系统间的互转。模块在注册到 Bridge 时，可以指定所需使用的类型系统。

## Recommennd(New) Type in Java

所有新类型系统中的类型，均定义在 `com.tencent.mtt.hippy.runtime.builtins` 这个包中。

### JSValue

所有类型均派生于 `JSValue` 基类，主要提供了：

* 对象实例类型判定：可调用 `is##Name()` 方法来确认实际类型。
* 原始对象取值：可调用 `to##Name()` 方法得到 (wrapped)Primitives 的实际值。

### JSArray

所有类型数组（包括密集 `JSDenseArray` 与稀疏 `JSSparseArray` 数组）均派生于 `JSAbstractArray`。

根据 ECMAScript 规范的定义，`JSAbstractArray` 重写了由父类 `JSObject` 继承的方法（包含：`entries()`、`keys()`、`values()`）：

1. 会优先枚举数组内值。
2. 再枚举其属性值。

如您仅想遍历获取数组内的值，可调用 `items()` 方法。

### JSRegExp

由于 `java.util.regex.Pattern` 与 ECMAScript `RegExp` 对象的差异，故不支持全局（`g`）标志位与粘性匹配（`y`）标志位，而 Unicode 字符（`u`）标志位则始终启用。

## 使用 Demo

以传输给前端 `ArrayBuffer` 为例：

```java
  JSObject jsObject = new JSObject();
  JSArrayBuffer jsArrayBuffer = new JSArrayBuffer(ByteBuffer.wrap(data));
  jsObject.set("body", jsArrayBuffer);
  Promise.resolve(jsObject);
```


