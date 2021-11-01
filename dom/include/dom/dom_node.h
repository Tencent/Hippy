#pragma once

#include <string>
#include <cstdint>
#include <vector>
#include <memory>
#include <functional>

#include "dom/dom_value.h"
#include "dom/layout_node.h"
#include "dom/dom_listener.h"

namespace hippy {
inline namespace dom {

class LayoutNode;

class DomNode {
 public:
  using DomValue = tdf::base::DomValue;

  DomNode(int32_t id, int32_t pid, int32_t index, std::string tag_name, std::string view_name,
          std::unordered_map<std::string, std::shared_ptr<DomValue>>&& style_map,
          std::unordered_map<std::string, std::shared_ptr<DomValue>>&& dom_ext_map);
  DomNode(int32_t id, int32_t pid, int32_t index);
  DomNode();
  ~DomNode();

  std::shared_ptr<DomNode> GetParent();
  std::shared_ptr<DomNode> GetChildAt(int32_t index);
  void AddChildAt(std::shared_ptr<DomNode> dom_node, int32_t index);
  std::shared_ptr<DomNode> RemoveChildAt(int32_t index);

  int32_t AddClickEventListener(OnClickEventListener listener);
  void RemoveClickEventListener(int32_t listener_id);
  int32_t AddTouchEventListener(std::shared_ptr<TouchEvent> event, OnTouchEventListener listener);
  void RemoveTouchEventListener(std::shared_ptr<TouchEvent> event, int32_t listener_id);

  inline const std::string& GetTagName() {
    return tag_name_;
  }

  inline void SetStyleStr(const std::string& view_name) {
    view_name_ = view_name;
  }

  inline const std::string& GetViweName() {
    return view_name_;
  }

  int32_t AddDomEventListener(std::shared_ptr<DomEvent> event, OnDomEventListener listener);
  void RemoveDomEventListener(std::shared_ptr<DomEvent> event, int32_t listener_id);

  int32_t AddOnLayoutListener(std::shared_ptr<LayoutEvent> event, OnLayoutEventListener listener);

 private:
  int32_t id_;  // 节点唯一id
  int32_t pid_; // 父节点id
  int32_t index_; // 当前节点在父节点孩子数组中的索引位置
  std::string tag_name_; // DSL 中定义的组件名称
  std::string view_name_; // 底层映射的组件
  std::unordered_map<std::string, std::shared_ptr<DomValue>> style_map_;
  // 样式预处理后结果
  std::unordered_map<std::string, std::shared_ptr<DomValue>> dom_ext_map_;
  //  用户自定义数据
  std::unordered_map<std::string, std::shared_ptr<DomValue>> diff_;
  // Update 时用户自定义数据差异，UpdateRenderNode 完成后会清空 map，以节省内存

  std::shared_ptr<LayoutNode> node_;
  LayoutResult layout_; // Layout 结果

  bool is_just_layout_;
  bool is_virtual_;

  OnLayoutEventListener on_layout_event_listener_;
  std::unordered_map<std::shared_ptr<TouchEvent>, OnTouchEventListener>
      touch_event_listener_map_;

  std::shared_ptr<DomNode> parent_;
  std::vector<std::shared_ptr<DomNode>> children_;
};

}
}

