#pragma once

#include <cstdint>
#include <memory>

#include "dom/dom_value.h"
#include "render/voltron_layout_node.h"

namespace voltron {

class VoltronRenderNode : public VoltronLayoutNode {
 public:
  using DomValue = tdf::base::DomValue;
 private:
  int32_t id_;             // 节点唯一id
  int32_t pid_;            // 父节点id
  int32_t index_;          // 当前节点在父节点孩子数组中的索引位置
  std::string tag_name_;   // DSL 中定义的组件名称
  std::string view_name_;  // 底层映射的组件

  // 样式预处理后结果
  std::unordered_map<std::string, std::shared_ptr<DomValue>> style_map_;
  //  用户自定义数据
  std::unordered_map<std::string, std::shared_ptr<DomValue>> props_;
  // Update 时用户自定义数据差异，Update 完成后会清空 map，以节省内存
  std::unordered_map<std::string, std::shared_ptr<DomValue>> prop_to_update_;

  std::weak_ptr<VoltronRenderNode> parent_;
  std::weak_ptr<VoltronRenderNode> root_;
  std::vector<std::shared_ptr<VoltronRenderNode>> children_;
};

}  // namespace voltron
