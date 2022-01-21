//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

namespace hippy {
namespace dom {
/**
 * @brief Chrome DevTools FrontEnd Element协议所需数据格式的key定义，调试工具使用
 *        协议文档：https://chromedevtools.github.io/devtools-protocol/1-3/DOM/
 */
constexpr const char* kDomainRootId = "rootId";
constexpr const char* kDomainNodeId = "nodeId";
constexpr const char* kDomainBackendNodeId = "backendNodeId";
constexpr const char* kDomainNodeType = "nodeType";
constexpr const char* kDomainChildren = "children";
constexpr const char* kDomainChildNodeCount = "childNodeCount";
constexpr const char* kDomainNodeName = "nodeName";
constexpr const char* kDomainLocalName = "localName";
constexpr const char* kDomainClassName = "className";
constexpr const char* kDomainNodeValue = "nodeValue";
constexpr const char* kDomainParentId = "parentId";
constexpr const char* kDomainAttributes = "attributes";
constexpr const char* kDomainStyle = "style";
constexpr const char* kDomainLayoutX = "x";
constexpr const char* kDomainLayoutY = "y";
constexpr const char* kDomainLeft = "left";
constexpr const char* kDomainRight = "right";
constexpr const char* kDomainTop = "top";
constexpr const char* kDomainBottom = "bottom";
constexpr const char* kDomainLayoutWidth = "width";
constexpr const char* kDomainLayoutHeight = "height";
constexpr const char* kDomainHitNodeRelationTree = "hitNodeRelationTree";
constexpr const char* kDomainBase64 = "base64";

}  // namespace dom
}  // namespace hippy
