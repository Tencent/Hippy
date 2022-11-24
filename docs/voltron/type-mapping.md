# ECMAScript 与 Dart 类型映射

Voltron Renderer中，`JavaScript`和`Dart`是通过`JSON`数据格式通信，目前支持的类型如下

---

# 类型映射关系

| javascript Type              | Dart Type                         |
|------------------------------|-----------------------------------|
| boolean - true               | bool - true                       |
| boolean - false              | bool - false                      |
| null                         | null                              |
| undefined                    | null                              |
| number                       | int                               |
|                              | double                            ||
| string                       | String                            |
| Array                        | VoltronArray                      |
| Object                       | VoltronMap                        |

!> 其他类型暂不支持
