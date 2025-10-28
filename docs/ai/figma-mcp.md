# 其他工具(一): Figma MCP

如何直接把 Figma 的设计图生成 Hippy 代码？

1. **Figma 开启 MCP Server**
   1. 参考 figma 文档下载最新版本的 figma 桌面端应用。
   2. 需要申请 dev mode 权限。

      <img src="ai/img/figma_dev.png"  width="50%">
   3. 开启 MCP Server。
      <img src="ai/img/figma_mcp_enable.png"  width="50%">

2. **Cursor/Codebuddy/Vscode 等配置接入 MCP**
   - 可以参考：[配置使用教程](https://km.woa.com/articles/show/632094?kmref=search&from_page=1&no=2)
   - **Cursor**:

        ```json
        {
          "mcpServers": {
            "Figma": {
              "url": "http://127.0.0.1:3845/mcp"
            }
          }
        }
        ```

   - **CodeBuddy**:

        ```json
        {
          "mcpServers": {
            "Figma Dev Mode MCP": {
              "type": "http",
              "url": "http://127.0.0.1:3845/mcp"
            }
          }
        }
        ```

   - **Vscode**:

        ```json
         "chat.mcp.discovery.enabled": true,
         "mcp": {
           "servers": {
             "Figma Dev Mode MCP": {
               "type": "http",
               "url": "http://127.0.0.1:3845/mcp"
             }
           }
         },
         "chat.agent.enabled": true
        ```

3. **Figma MCP 方法**
   - 参考：[Figma MCP官方文档](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Dev-Mode-MCP-Server)
   - `get_code`: 获取 figma 根据设计图生成的代码（目前只支持前端，后续会支持 compose 等），目前 cursor 直接用前端转 Hippy，效果也还不错。
   - `get_variable_defs`: 获取 figma 选中的变量和样式等。
   - `get_code_connect_map`: 获取 figma 节点 id 和代码组件库的映射表。
   - `get_image`: 获取 figma 中图片的链接。
   - `create_design_system_rules`: 创建 figma 的设计 rules，有助于设计系统和输出技术栈一致。
   - `get_metadata`: 获取 figma 根据设计图生成的原始 dsl 信息。

4. **使用示例**
   - **Prompt**:
        > 请根据我提供的 Figma 设计链接，使用 Dev Mode + MCP 协议生成高质量的 Hippy React 代码。确保生成的代码结构清晰、还原度高，语义化良好，适配当前项目的组件体系，确保编译通过:
        > @<https://www.figma.com/design/CMXiU5b0y7DWLF6oVpjyqm/Figma-Basics?node-id=0-495&t=7dr4gc6Ig2o3UwRg-4>
        > 代码生成目录是 driver/js/examples/hippy-react-demo/src/components/figma-mcp/
        > 可以参考 driver/js/examples/hippy-react-demo/src/components/ 下的其他页面代码
