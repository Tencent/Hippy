# ECMAScript and Java Type Mapping

When called through Bridge, Bridge codec will automatically convert [source type] to [target type] for use by business modules.

> If JS calls Java, the incoming ECMAScript object will be converted to the corresponding type in Java and vice versa.

Hippy provides two type systems in Java.

* Recommend Type System: A newly designed type system that can express all [HTML structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) in both directions  (recommended).
* Compatible Type System: old type system, simple in structure but does not completely support bidirectional expression of types, used only by stock code (not recommended).

## Type Mapping Relationship

| ECMAScript Type Category  | ECMAScript Type              | Recommend(New) Type in Java       | Compatible(Old) Type in Java           |
|---------------------------|------------------------------|-----------------------------------|----------------------------------------|
| Primitives                | true                         | true                              | true                                   |
|                           | false                        | false                             | false                                  |
|                           | null                         | (#1).JSOddball#Null               | null                                   |
|                           | undefined                    | (#1).JSOddball#Undefined          | (#2).ConstantValue#Undefined           |
|                           | number                       | int                               | int                                    |
|                           |                              | double                            | double                                 |
|                           | bigint                       | java.math.BigInteger              | java.math.BigInteger                   |
|                           | string                       | java.lang.String                  | java.lang.String                       |
| Primitive wrapper objects | Boolean                      | (#1).objects.JSBooleanObject#True | true                                   |
|                           |                              | (#1).objects.JSBooleanObject#False | false                                  |
|                           | Number                       | (#1).objects.JSNumberObject       | double                                 |
|                           | BigInt                       | (#1).objects.JSBigintObject       | java.math.BigInteger                   |
|                           | String                       | (#1).objects.JSStringObject       | java.lang.String                       |
| Fundamental objects       | Object                       | (#1).JSObject                     | (#2).HippyMap                          |
| Indexed collections       | Array(dense)                 | (#1).JSDenseArray                 | (#2).HippyArray  (Not fully supported) |
|                           | Array(sparse)                | (#1).JSSparseArray                | N/A                                    |
| Keyed collections         | Map                          | (#1).JSMap                        | (#2).HippyMap (Not fully supported)    |
|                           | Set                          | (#1).JSSet                        | (#2).HippyArray (Not fully supported)  |
| Structured data           | ArrayBuffer                  | (#1).JSArrayBuffer                | N/A                                    |
|                           | SharedArrayBuffer            | (#1).JSSharedArrayBuffer          | N/A                                    |
|                           | ArrayBufferView              | (#1).JSDataView                   | N/A                                    |
| Dates                     | Date                         | java.util.Date                    | java.util.Date                         |
| Error objects             | Error                        | (#1).JSError                      | N/A                                    |
|                           | EvalError                    |                                   |                                        |
|                           | RangeError                   |                                   |                                        |
|                           | ReferenceError               |                                   |                                        |
|                           | SyntaxError                  |                                   |                                        |
|                           | TypeError                    |                                   |                                        |
|                           | URIError                     |                                   |                                        |
| Text processing           | RegExp                       | (#1).JSRegExp                     | N/A                                    |
| Array Holes               | undefined(hole)              | (#1).JSOddball#Hole               | (#2).ConstantValue#Hole                |
| Host Object               | Object(with internal fields) | java.lang.Object                  | N/A                                    |
| WebAssembly               | WebAssembly.Module           | (#1).wasm.WasmModule              | N/A                                    |
|                           | WebAssembly.Memory           | (#1).wasm.WasmMemory              | N/A                                    |

1. com.tencent.mtt.hippy.runtime.builtins
2. com.tencent.mtt.hippy.common

## Type Correction

Since the ECMAScript standard does not define how the [number](https://262.ecma-international.org/#sec-ecmascript-language-types-number-type) type is stored/expressed within the VM, different VM engine implementations may store the same value differently, leading to type deviations.

> For example:
> In ECMAScript implementation v8, integer values that exceed the maximum size that can be expressed by Smi are stored using Heap Number, resulting in an expression of type `double`.

The type system automatically completes type correction, restoring the user's original type.

> For example:
> When a `double` type can be expressed as an `int` type, the system will automatically convert to an `int` type

## Old and New Type Interchange

Bidirectional Type conversion between old and new type systems can be done by calling the following methods.

* Recommend(New) ---> Compatible(Old): `com.tencent.mtt.hippy.runtime.utils.ValueConverter#toHippyValue`
* Compatible(Old) ---> Recommend(New): `com.tencent.mtt.hippy.runtime.utils.ValueConverter#toJSValue`

> Since the new type system is more fine-grained in the types of ECMAScript it can express,
> Therefore, conversion from the new type system (Recommend) to the old type system (Compatible) may result in type loss

In general, users do not need to convert between the old and new type systems. When registering a module to Bridge, you can specify the type system you want to use.

## Recommend(New) Type in Java

All types in the new type system are defined in the package `com.tencent.mtt.hippy.runtime.builds`.

### JSValue

All types are derived from the `JSValue` base class, providing mainly:

* Object instance type determination: the `is##Name()` method can be called to confirm the actual type.
* Primitive object fetching: the `to##Name()` method can be called to get the actual value of the (wrapped)Primitives.

### JSArray

All type arrays (including dense `JSDenseArray` and sparse `JSSparseArray` arrays) are derived from `JSAbstractArray`.

As defined by the ECMAScript specification, `JSAbstractArray` overrides the methods inherited from the parent class `JSObject` (including: `entries()`, `keys()`, `values()`).

1. enumerate the values in the array first.
2. then enumerates the values of its attributes.

If you just want to iterate through the array, you can call the `items()` method.

### JSRegExp

Due to the difference between `java.util.regex.Pattern` and ECMAScript `RegExp` object, the global (`g`) and sticky match (`y`) flags are not supported, while the Unicode character (`u`) flags are always enabled.

## Demo

Take the example of transferring `ArrayBuffer` to the front-end:

```java
  JSObject jsObject = new JSObject();
  JSArrayBuffer jsArrayBuffer = new JSArrayBuffer(ByteBuffer.wrap(data));
  jsObject.set("body", jsArrayBuffer);
  Promise.resolve(jsObject);
```


