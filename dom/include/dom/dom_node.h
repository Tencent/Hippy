#pragma once

#include <cstdint>
#include <functional>
#include <memory>
#include <string>
#include <vector>

#include "dom/dom_listener.h"
#include "dom/dom_manager.h"
#include "dom/dom_value.h"
#include "dom/taitank_layout_node.h"

namespace hippy {
inline namespace dom {

class LayoutNode;
class DomManager;

class DomNode : public std::enable_shared_from_this<DomNode> {
 public:
  using DomValue = tdf::base::DomValue;

  DomNode(int32_t id, int32_t pid, int32_t index, std::string tag_name, std::string view_name,
          std::unordered_map<std::string, std::shared_ptr<DomValue>>&& style_map,
          std::unordered_map<std::string, std::shared_ptr<DomValue>>&& dom_ext_map,
          std::shared_ptr<DomManager> dom_manager);
  DomNode(int32_t id, int32_t pid, int32_t index);
  DomNode();
  ~DomNode();

  // 记录RenderNode相关信息
  struct RenderInfo {
    int32_t pid = -1;      // 父RenderNode的id
    int32_t index = -1;    // 在父RenderNode上的索引值
    bool created = false;  // RenderNode是否已经创建

    void Reset() {
      pid = -1;
      index = -1;
      created = false;
    }
  };

  std::shared_ptr<DomNode> GetParent() { return parent_.lock(); }
  void SetParent(std::shared_ptr<DomNode> parent) { parent_ = parent; }

  int32_t GetChildCount() const { return children_.size(); }
  int32_t IndexOf(std::shared_ptr<DomNode> child);
  std::shared_ptr<DomNode> GetChildAt(int32_t index);
  void AddChildAt(std::shared_ptr<DomNode> dom_node, int32_t index);
  std::shared_ptr<DomNode> RemoveChildAt(int32_t index);
  void DoLayout();
  void ParseLayoutStyleInfo();
  void TransferLayoutOutputsRecursive(std::shared_ptr<DomNode> dom_node);
  int32_t AddClickEventListener(OnClickEventListener listener);
  void RemoveClickEventListener(int32_t listener_id);
  int32_t AddLongClickEventListener(OnLongClickEventListener listener);
  void RemoveLongClickEventListener(int32_t listener_id);
  int32_t AddTouchEventListener(TouchEvent event, OnTouchEventListener listener);
  void RemoveTouchEventListener(TouchEvent event, int32_t listener);
  int32_t SetOnAttachChangedListener(OnAttachChangedListener listener);
  int32_t AddShowEventListener(ShowEvent event, OnShowEventListener listener);
  void RemoveShowEventListener(ShowEvent event, int32_t listener_id);

  inline void SetTagName(const std::string& tag_name) { tag_name_ = tag_name; }

  inline const std::string& GetTagName() { return tag_name_; }

  inline void SetStyleStr(const std::string& view_name) { view_name_ = view_name; }

  inline const std::string& GetViweName() { return view_name_; }

  void SetId(int32_t id) { id_ = id; }
  int32_t GetId() const { return id_; }

  void SetPid(int32_t pid) { pid_ = pid; }
  int32_t GetPid() const { return pid_; }

  RenderInfo GetRenderInfo() const { return render_info_; }
  void SetRenderInfo(RenderInfo render_info) { render_info_ = render_info; }

  bool IsJustLayout() const { return is_just_layout_; }
  void SetIsJustLayout(bool is_just_layout) { is_just_layout_ = is_just_layout; }

  bool IsVirtual() { return is_virtual_; }
  void SetIsVirtual(bool is_virtual) { is_virtual_ = is_virtual; }

  void SetIndex(int32_t index) { index_ = index; }
  int32_t GetIndex() const { return index_; }
  void SetSize(int32_t width, int32_t height);
  int32_t AddDomEventListener(std::shared_ptr<DomEvent> event, OnDomEventListener listener);
  void RemoveDomEventListener(std::shared_ptr<DomEvent> event, int32_t listener_id);

  int32_t AddOnLayoutListener(std::shared_ptr<LayoutEvent> event, OnLayoutEventListener listener);

  const std::unordered_map<std::string, std::shared_ptr<DomValue>>& GetStyleMap() const { return style_map_; }

  bool HasTouchEventListeners() const { return !touch_listeners->empty(); }
  void CallFunction(const std::string& name,
                    std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                    CallFunctionCallback cb);
  CallFunctionCallback GetCallback(const std::string& name);

 private:
  int32_t id_;             // 节点唯一id
  int32_t pid_;            // 父节点id
  int32_t index_;          // 当前节点在父节点孩子数组中的索引位置
  std::string tag_name_;   // DSL 中定义的组件名称
  std::string view_name_;  // 底层映射的组件
  std::unordered_map<std::string, std::shared_ptr<DomValue>> style_map_;
  // 样式预处理后结果
  std::unordered_map<std::string, std::shared_ptr<DomValue>> dom_ext_map_;
  //  用户自定义数据
  std::unordered_map<std::string, std::shared_ptr<DomValue>> diff_;
  // Update 时用户自定义数据差异，UpdateRenderNode 完成后会清空 map，以节省内存

  std::shared_ptr<TaitankLayoutNode> node_;
  LayoutResult layout_;  // Layout 结果
  bool is_just_layout_;
  bool is_virtual_;

  OnLayoutEventListener on_layout_event_listener_;

  std::weak_ptr<DomNode> parent_;
  std::vector<std::shared_ptr<DomNode>> children_;

  RenderInfo render_info_;
  std::weak_ptr<DomManager> dom_manager_;
  int32_t current_callback_id_;
  std::shared_ptr<std::unordered_map<int32_t, OnTouchEventListener>> touch_listeners;
  std::shared_ptr<std::unordered_map<int32_t, OnClickEventListener>> click_listeners;
  std::shared_ptr<std::unordered_map<int32_t, OnLongClickEventListener>> long_click_listeners;
  std::shared_ptr<std::unordered_map<int32_t, OnShowEventListener>> show_listeners;
  std::shared_ptr<std::unordered_map<std::string, CallFunctionCallback>> callbacks_;


};

}  // namespace dom
}  // namespace hippy
