#include <string>

#include "dom/serializer.h"
#include "dom/deserializer.h"
#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "dom/root_node.h"

namespace hippy {
inline namespace driver {

class Snapshot {
 public:
  Snapshot(std::weak_ptr<hippy::DomManager> dom_manager): dom_manager_(dom_manager) {}
  ~Snapshot() = default;

  using bytes = std::string;
  bytes GetData();
  bool SetData(bytes buffer, std::shared_ptr<RootNode> root);

 private:
  std::weak_ptr<DomManager> dom_manager_;
};

}
}
