# 介绍

# Hippy 2.x 架构

Hippy 2.x 架构主要分成三层，UI(JS) 层 `Hippy-React` 和 `Hippy-Vue` 负责驱动 UI 指令生成；中间层 [C++ HippyCore](structure/core.md) 负责抹平平台差异性和提供高性能模块；渲染层 `Android` 和 `iOS` 负责提供终端底层模块、组件，并与布局引擎通信

<br/>

![2.0架构](../assets/img/2.0-structure.png)

<br/>
<br/>
<br/>

# Hippy 3.x 架构

Hippy 正在进行 3.x 架构的升级，在 3.x 中业务与渲染层中的具体实现可根据用户实际场景进行切换：业务层上不再局限于 JS 驱动，还可选择（如：DSL/Dart/WASM 等）其它语言进行驱动；DOM Manager 从 Java/OC 下沉到 C++，作为中间枢纽，除了接收处理来自上层的消息进行 DOM Tree 的创建和维护外，还负责与不同渲染引擎，排版引擎和调试工具的对接通信；在渲染层中，渲染引擎除了支持现有原生（Native）渲染之外，还可以选择其他渲染 Renderer，如 Flutter(Voltron) 渲染。Hippy 3.x 能够弥补当前 Hippy 2.x 在性能，双端一致性以及组件支持方面的一些短板，敬请期待！

<br/>
<div style="display:flex;flex-direction:column;justify-content:flex-start;align-items: center;margin: 20px">
<img src="assets/img/3.0-structure.png" alt="3.0架构" width="55%"/>
</div>
