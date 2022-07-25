#include "dom/tools/tools.h"

#include <map>
#include <string>

#include "dom/dom_node.h"

namespace hippy {
inline namespace dom {
inline namespace tools {

const std::map<int32_t, std::string> kRelativeTypeMap = {
    {-1, "kFront"},
    {0, "kDefault"},
    {1, "kBack"},
};

Tools::Tools() : identifier_("") {}

Tools::Tools(std::string identifier) : identifier_(identifier) {}

void Tools::Log(const std::vector<std::shared_ptr<DomInfo>>& nodes) {
  std::string message;
  for (const auto& n : nodes) {
    std::string node_message;
    node_message = Message(*n);
    message += node_message;
    message += ", ";
  }
  FOOTSTONE_DLOG(INFO) << identifier_ << "[" << message << "]";
}

void Tools::Log(const std::vector<DomInfo>& nodes) {
  std::string message;
  for (const auto& n : nodes) {
    std::string node_message;
    node_message = Message(n);
    message += node_message;
    message += ", ";
  }
  FOOTSTONE_DLOG(INFO) << identifier_ << "[" << message << "]";
}

void Tools::Log(const std::shared_ptr<DomInfo>& node) {
  std::string message;
  message = Message(*node);
  FOOTSTONE_DLOG(INFO) << identifier_ << message;
}

void Tools::Log(const DomInfo& node) {
  std::string message;
  message = Message(node);
  FOOTSTONE_DLOG(INFO) << identifier_ << message;
}

std::string Tools::Message(const DomInfo& node) {
  std::stringstream stream;
  auto dom_node = node.dom_node;
  auto ref_info = node.ref_info;
  stream << "{";
  if (ref_info != nullptr) {
    stream << "\"ref info\": {";
    stream << "\"ref_id\": " << ref_info->ref_id << ", ";
    stream << "\"relative_to_ref\": \"" << kRelativeTypeMap.find(ref_info->relative_to_ref)->second << "\"";
    stream << "}, ";
  }
  if (dom_node != nullptr) {
    stream << "\"dom node\": {";
    stream << "\"id\": " << dom_node->GetId() << ", ";
    stream << "\"pid\": " << dom_node->GetPid() << ", ";
    stream << "\"view name\": \"" << dom_node->GetViewName() << "\", ";
    auto style = dom_node->GetStyleMap();
    if (style != nullptr) {
      stream << "\"style\": {";
      for (const auto& s : *style) {
        stream << "\"" << s.first << "\": " << *s.second << ", ";
      }
      stream << "}, ";
    }
    auto ext = dom_node->GetExtStyle();
    if (ext != nullptr) {
      stream << "\"ext style\": {";
      for (const auto& e : *ext) {
        stream << "\"" << e.first << "\": " << *e.second << ", ";
      }
      stream << "}, ";
    }
    stream << "}";
  }
  stream << "}";

  return stream.str();
}

}  // namespace tools
}  // namespace dom
}  // namespace hippy
