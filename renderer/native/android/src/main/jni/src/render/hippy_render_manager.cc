#include "render/hippy_render_manager.h"

#include <cstdint>
#include <utility>

#include "base/logging.h"
#include "bridge/runtime.h"
#include "dom/serializer.h"

// TODO change to serialize
std::pair<uint8_t *, size_t>
HandleDomValue(const std::shared_ptr<Runtime> &runtime,
               const std::vector<std::shared_ptr<hippy::dom::DomNode>> &nodes) {
  tdf::base::Serializer serializer;
  serializer.WriteHeader();

  uint32_t len = nodes.size();
  tdf::base::DomValue::DomValueArrayType dom_node_array;
  dom_node_array.resize(len);

  for (uint32_t i = 0; i < len; i++) {
    tdf::base::DomValue::DomValueArrayType dom_node;
    dom_node.push_back(tdf::base::DomValue(nodes[i]->GetId()));
    dom_node.push_back(tdf::base::DomValue(nodes[i]->GetPid()));
    dom_node.push_back(tdf::base::DomValue(nodes[i]->GetIndex()));
    dom_node.push_back(tdf::base::DomValue(nodes[i]->GetViewName()));
    dom_node.push_back(tdf::base::DomValue(nodes[i]->GetTagName()));
    dom_node_array[i] = dom_node;
  }

  serializer.WriteDenseJSArray(dom_node_array);
  return serializer.Release();
};

namespace hippy {
inline namespace dom {

void HippyRenderManager::CreateRenderNode(
    std::vector<std::shared_ptr<hippy::dom::DomNode>> &&nodes) {
  std::shared_ptr<Runtime> runtime =
      Runtime::Find(static_cast<int32_t>(runtime_id_));
  if (!runtime) {
    return;
  }

  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv *j_env = instance->AttachCurrentThread();

  jobject j_buffer;
  std::pair<uint8_t *, size_t> pair = HandleDomValue(runtime, nodes);
  j_buffer = j_env->NewDirectByteBuffer(
      const_cast<void *>(reinterpret_cast<const void *>(pair.first)),
      pair.second);
  jobject j_object = render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    TDF_BASE_LOG(ERROR) << "CreateRenderNode j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, "createNode", "([B)V");
  if (!j_method_id) {
    TDF_BASE_LOG(ERROR) << "CreateRenderNode j_cb_id error";
    return;
  }

  j_env->CallVoidMethod(render_delegate_->GetObj(), j_method_id, j_buffer);
  j_env->DeleteLocalRef(j_buffer);
};

void HippyRenderManager::UpdateRenderNode(
    std::vector<std::shared_ptr<DomNode>> &&nodes) {
  std::shared_ptr<Runtime> runtime =
      Runtime::Find(static_cast<int32_t>(runtime_id_));
  if (!runtime) {
    return;
  }

  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv *j_env = instance->AttachCurrentThread();

  jobject j_buffer;
  std::pair<uint8_t *, size_t> pair = HandleDomValue(runtime, nodes);
  j_buffer = j_env->NewDirectByteBuffer(
      const_cast<void *>(reinterpret_cast<const void *>(pair.first)),
      pair.second);
  jobject j_object = render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    TDF_BASE_LOG(ERROR) << "UpdateRenderNode j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, "updateNode", "([B)V");
  if (!j_method_id) {
    TDF_BASE_LOG(ERROR) << "UpdateRenderNode j_cb_id error";
    return;
  }

  j_env->CallVoidMethod(render_delegate_->GetObj(), j_method_id, j_buffer);
  j_env->DeleteLocalRef(j_buffer);
};

void HippyRenderManager::DeleteRenderNode(
    std::vector<std::shared_ptr<DomNode>> &&nodes) {
  std::shared_ptr<Runtime> runtime =
      Runtime::Find(static_cast<int32_t>(runtime_id_));
  if (!runtime) {
    return;
  }

  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv *j_env = instance->AttachCurrentThread();

  jobject j_buffer;
  std::pair<uint8_t *, size_t> pair = HandleDomValue(runtime, nodes);
  j_buffer = j_env->NewDirectByteBuffer(
      const_cast<void *>(reinterpret_cast<const void *>(pair.first)),
      pair.second);
  jobject j_object = render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    TDF_BASE_LOG(ERROR) << "UpdateRenderNode j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, "deleteNode", "([B)V");
  if (!j_method_id) {
    TDF_BASE_LOG(ERROR) << "UpdateRenderNode j_cb_id error";
    return;
  }

  j_env->CallVoidMethod(render_delegate_->GetObj(), j_method_id, j_buffer);
  j_env->DeleteLocalRef(j_buffer);
};

void HippyRenderManager::UpdateLayout(
    const std::vector<std::shared_ptr<DomNode>> &nodes) {
  TDF_BASE_NOTIMPLEMENTED();
};

void HippyRenderManager::MoveRenderNode(std::vector<int32_t> &&moved_ids,
                                        int32_t from_pid, int32_t to_pid) {
  TDF_BASE_NOTIMPLEMENTED();
};

void HippyRenderManager::Batch() { TDF_BASE_NOTIMPLEMENTED(); };

void HippyRenderManager::CallFunction(
    std::weak_ptr<DomNode> domNode, const std::string &name,
    std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
    DispatchFunctionCallback cb) {
  TDF_BASE_NOTIMPLEMENTED();
};

void HippyRenderManager::SetClickEventListener(int32_t id,
                                               OnClickEventListener listener){};

void HippyRenderManager::RemoveClickEventListener(int32_t id){};

void HippyRenderManager::SetLongClickEventListener(
    int32_t id, OnLongClickEventListener listener){};

void HippyRenderManager::RemoveLongClickEventListener(int32_t id){};

void HippyRenderManager::SetTouchEventListener(int32_t id, TouchEvent event,
                                               OnTouchEventListener listener){};

void HippyRenderManager::RemoveTouchEventListener(int32_t id,
                                                  TouchEvent event){};

void HippyRenderManager::SetShowEventListener(int32_t id, ShowEvent event,
                                              OnShowEventListener listener){};

void HippyRenderManager::RemoveShowEventListener(int32_t id, ShowEvent event){};

} // namespace dom
} // namespace hippy