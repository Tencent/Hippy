# Hippy AI 编程指引

## 概述

本文档为 Hippy 开发者提供 AI 编程工具的使用指南，包含多种 AI 工具的配置方法和最佳实践。

### 适用场景

- **代码开发**: 使用 AI 辅助 Hippy 项目开发
- **问题排查**: 通过 AI 分析代码问题和异常
- **文档查询**: 快速获取 Hippy 框架相关信息
- **UI 还原**: 基于设计稿生成 Hippy 代码

下面分几个场景介绍 Hippy AI 使用指引：

### 可用资源

Hippy 团队为 AI 提供以下知识来源：

| 资源类型 | 内容 | 访问方式 | 适用场景 |
|----------|------|----------|----------|
| **团队文档** | iwiki文档、Oncall单 | IDE：CodeBuddy导入知识库 | 快速问题解答 |
| **框架源码** | Hippy 框架源码 | IDE：Cursor/CodeBuddy <br/>源码索引、Deepwiki MCP | 深度代码分析 |
| **组合方案** | 文档 + 源码 RAG | 网页：Knot智能体<br/>IDE：源码索引、Hippy MCP | 综合问题解决 |

### 效果对比

- **纯文档方案**: 可以解决 Hippy 团队记录过的问题，但覆盖面有限，比如无法分析具体代码问题
- **Deepwiki方案**: 效果不错，代码分析能力强，效果接近 Cursor 源码索引效果
- **组合方案**: 结合了知识库和源码索引，适合大部分问题的解答

> 💡 **最佳实践**: <br>
> IDE 场景：将 Hippy 源码工程添加到 IDE 工作区，并配置 Hippy MCP。<br>
> 网页场景：通过 Knot 智能体访问，可以快速解答大部分场景的问题。

---

## 一、Cursor

1. **引入Hippy源码工程到工作区(推荐必须)**
   - Hippy 团队通过实际测试发现，引入 Hippy 源码工程到工作区，Cursor 去建立源码的索引，能对问题有很好的解答，能极大的提高日常开发的效率。

    <img src="ai/img/codebase.png"  width="50%">

2. **配置项目的 `rules` 文件(推荐必须)**
   - 配置 cursor `rules` 文件，在很多场景都能提高开发效率。可以参考 Hippy 团队的官方 Rule，并补充自己项目的规则信息。
   - Hippy 官方 rules 中包含了 Hippy 源码结构、常用组件 API 使用、AI 调试技巧、React/Vue DSL 区别等等，各团队可以根据自己情况补充。
   - 业务也可以添加自己的 rules，补充目录结构，以及可以参考的代码文件目录、常见问题等。

3. **常用 MCP（按需配置）**

（1）Hippy MCP
    会集成 Hippy 的知识库信息（iwiki）和 Hippy 框架源码信息（Deepwiki）,
    会根据回答的问题类型来给出针对性的解答。建议涉及到 Hippy 框架相关的问题，都可以配置。

```json
    "hippy-mcp": {
          "timeout": 60,
          "url": "https://hippy.woa.com/mcp",
          "headers": {
            "X-Rtx-Username": "<自己的企业微信名>"
          }
    }
```

（2）Deepwiki MCP
    deepwiki 会提供针对 Hippy 框架源码的解答，如果项目工作区没有引入 Hippy 源码，建议添加 Deepwiki mcp。

```json
    "mcpServers": {
        "deepwiki-mcp": {
            "timeout": 60,
            "url": "https://mcp.deepwiki.com/mcp"
        }
    }
```

---

## 二、CodeBuddy

CodeBuddy 内网版可以单独添加官方 Hippy 知识库，其他大部分配置同Cursor，可以参考上文配置：

1. **询问问题时，通过 @ 可以添加「官方 Hippy 知识库」（推荐必须）**
   - CodeBuddy 已经内置集成 Knot 的知识库，大家在询问问题时，可以添加 Hippy 知识库。

    <img src="ai/img/codebuddy_wiki.png"  width="50%">

2. **引入Hippy源码工程到工作区(推荐必须)**
   - 配置同上文 Cursor 配置

3. **配置项目的 `rules` 文件(推荐必须)**
   - 配置同上文 Cursor 配置

4. **常用 MCP（按需配置）**

（1）Hippy MCP
    会集成 Hippy 的知识库信息（iwiki）和Hippy框架源码信息（Deepwiki）, 会根据回答的问题类型来给出针对性的解答，建议涉及到Hippy框架相关的问题，都可以配置。

```json
"hippy-mcp": {
    "timeout": 60,
    "type": "streamableHttp",
    "url": "https://hippy.woa.com/mcp",
    "headers": {
        "X-Rtx-Username": "<自己的企业微信名>"
    }
}
```

（2）Deepwiki MCP
    deepwiki 会提供针对hippy框架源码的解答，如果项目工作区没有引入Hippy源码，建议添加 Deepwiki mcp。

```json
"mcpServers": {
    "deepwiki-mcp": {
        "timeout": 60,
        "type": "streamableHttp",
        "url": "https://mcp.deepwiki.com/mcp"
    }
}
```

---

## 三、网页/企微入口

1. **Knot 智能体**

    [Knot 智能体](https://knot.woa.com/chat?web_key=8292b4273a9549d8bbefa5ddb699cdca)

    <img src="ai/img/knot_agent.png"  width="50%">
    <br>

    **使用提示**
   - 大家提问后，记得点赞👍/👎，方便后续优化。
   - Hippy AI 助手的知识包含：iwiki 文档、Hippy 源码及开发文档、deepwiki。
   - Hippy AI 助手弹窗可以放大，方便查看。

2. **企微机器人**
   - 企微搜索"Hippy AI小助手":

    <img src="ai/img/hippy_bot.png" alt="Hippy AI小助手" width="50%">

   - 向"Hippy AI小助手"直接提问，或者添加到开发群:

    <img src="ai/img/hippy_bot_chat.png" alt="向Hippy AI小助手提问" width="50%">

---

## 四、Prompt 技巧

### 1. 问题排查类

**核心要点**：问题尽量描述清晰，明确想了解的平台、组件、属性，推荐可以带上问题代码

> **最佳实践示例：**
>
> ```jsx
> import { View, Text } from '@hippy/react';
>
> function MyComponent() {
>   return (
>     <View style={{ height: 100 }}>
>       <Text style={{ fontSize: 16 }}>Hello Hippy</Text>
>     </View>
>   );
> }
>
> 我在 Android 平台使用 Hippy React 的 Text 组件，设置了 fontSize 属性为 16，
> 但显示效果不符合预期，文字显示过小。请帮忙分析可能的原因。
> ```

### 2. DSL 类型区分

**核心要点**：问题详情中区分使用的 React DSL 还是 Vue2/Vue3 DSL

> **Hippy React 示例：**
> Hippy React 中 Text 组件支持长按文本选中吗？
>
> **Hippy Vue 示例：**
> 使用 Hippy Vue3 开发，如何实现一个自定义的组件？

### 3. MCP 触发优化

**核心要点**：在 Prompt 中带上相关 MCP 提示，提高对应 MCP 触发概率

> **Hippy 框架问题：**
> 涉及到 Hippy 的提问，无论是对 Hippy 框架还是业务上的诉求，建议触发 Hippy MCP，
> 请使用 @hippy-mcp 触发。
>
> **框架源码问题：**
> 涉及到 Hippy 框架源码细节的问题，如果本地没有引入 Hippy 源码到工作区，
> 建议触发 DeepWiki MCP，使用 @deepwiki-mcp 触发。
>
> **UI 还原问题：**
> 涉及到 Figma 设计图还原的，建议触发 Figma MCP，请使用 @figma-mcp 触发
> （一般情况下，只要带上了 Figma 的设计链接，都会触发 Figma MCP）

### 4. 代码引用技巧

**核心要点**：编写代码的问题，可以设置参考 xxx 代码，会提高成功率

> **页面生成示例：**
> 帮我根据 figma 链接（xxx）实现一个 Hippy React 页面，图片组件请使用
> driver/js/examples/hippy-react-demo/src/components/CustomImageView 这个自定义组件。
> 页面实现可以参考已实现的 Hippy React 页面，比如
> driver/js/examples/hippy-react-demo/src/components/ListView 下的页面代码。
>
> **问题排查示例：**
> 帮我排查一个问题，问题可能和项目中一些代码有关，可以参考项目中
> driver/js/examples/hippy-react-demo/src/components/ListView 这个页面的代码来排查。

---

## 五、后续规划

Hippy 团队后续会补充更多 AI 编程实践的案例和工具, 欢迎大家提交建议或者贡献。
