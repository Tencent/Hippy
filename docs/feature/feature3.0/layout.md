# Layout引擎

---

Hippy 3.0 默认采用 [Taitank](https://taitank.dev/) 布局引擎，提供轻量、高效、跨平台的布局能力。同时 Hippy 3.0 也支持 [Yoga](https://yogalayout.com/)。

## 布局引擎切换

1. `cd` to `dom/`.

2. 修改 CMakeLists.txt 文件

    ```camke
    if (NOT DEFINED LAYOUT_ENGINE)
      set(LAYOUT_ENGINE "Taitank")
    endif ()
    ```

    修改为

    ```cmake
    if (NOT DEFINED LAYOUT_ENGINE)
      set(LAYOUT_ENGINE "Yoga")
    endif ()
    ```

3. 重新编译工程
