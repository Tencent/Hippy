#include "snapshot/snapshot.h"

namespace hippy {
inline namespace driver {

Snapshot::bytes Snapshot::GetData() {
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    return dom_manager->GetSnapShot();
  }
  return "";
}

bool Snapshot::SetData(std::string buffer, std::shared_ptr<RootNode> root) {
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    return dom_manager->SetSnapShot(std::move(buffer), root);
  }
  return true;
}
}
}
