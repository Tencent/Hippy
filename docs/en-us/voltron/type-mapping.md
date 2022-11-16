# ECMAScript & Dart type-Mapping

In Voltron Renderer, `JavaScript` and `Dart` communicate through `JSON` data format. The currently supported types are as follows

---

# Type mapping

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

!> Other types are not currently supported
