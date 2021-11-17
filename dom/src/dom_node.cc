#include "dom/dom_node.h"

#include <utility>

namespace hippy {
inline namespace dom {

DomNode::DomNode(int32_t id, int32_t pid, int32_t index,
                 std::string tag_name, std::string view_name,
                 std::unordered_map<std::string, std::shared_ptr<DomValue>>&& style_map,
std::unordered_map<std::string, std::shared_ptr<DomValue>>&& dom_ext_map):
id_(id), pid_(pid), index_(index), tag_name_(std::move(tag_name)),
view_name_(std::move(view_name)), style_map_(std::move(style_map)),
dom_ext_map_(std::move(dom_ext_map)) {}

DomNode::DomNode(int32_t id, int32_t pid, int32_t index): id_(id), pid_(pid), index_(index) {}

}
}
