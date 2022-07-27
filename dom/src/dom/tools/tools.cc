#include "dom/tools/tools.h"

#include <map>
#include <string>

#include "dom/dom_node.h"

namespace hippy {
inline namespace dom {
inline namespace tools {

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
  stream << node;
  return stream.str();
}

}  // namespace tools
}  // namespace dom
}  // namespace hippy
