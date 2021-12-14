#include "render/hippy_render_manager.h"

#include <cstdint>
#include <iostream>
#include <utility>

#include "base/logging.h"

const std::string kId = "id";
const std::string kPid = "pId";
const std::string kIndex = "index";
const std::string kName = "name";
const std::string kWidth = "width";
const std::string kHeight = "height";
const std::string kLeft = "left";
const std::string kRight = "right";
const std::string kProps = "props";

namespace hippy {
inline namespace dom {

void HippyRenderManager::CreateRenderNode(std::vector<std::shared_ptr<hippy::dom::DomNode>>&& nodes) {
  serializer_->Release();
  serializer_->WriteHeader();

  uint32_t len = nodes.size();
  tdf::base::DomValue::DomValueArrayType dom_node_array;
  dom_node_array.resize(len);
  for (uint32_t i = 0; i < len; i++) {
    tdf::base::DomValue::DomValueObjectType dom_node;
    dom_node[kId] = tdf::base::DomValue(nodes[i]->GetId());
    dom_node[kPid] = tdf::base::DomValue(nodes[i]->GetPid());
    dom_node[kIndex] = tdf::base::DomValue(nodes[i]->GetIndex());
    dom_node[kName] = tdf::base::DomValue(nodes[i]->GetViewName());

    // layout result
    auto result = nodes[i]->GetLayoutResult();
    dom_node[kWidth] = tdf::base::DomValue(result.width);
    dom_node[kHeight] = tdf::base::DomValue(result.height);
    dom_node[kLeft] = tdf::base::DomValue(result.left);
    dom_node[kTop] = tdf::base::DomValue(result.top);

    tdf::base::DomValue::DomValueObjectType props;
    // 样式属性
    auto style = nodes[i]->GetStyleMap();
    auto iter = style.begin();
    while (iter != style.end()) {
      props[iter->first] = *(iter->second);
      iter++;
    }

    // 用户自定义属性
    auto dom_ext = nodes[i]->GetExtStyle();
    iter = dom_ext.begin();
    while (iter != dom_ext.end()) {
      props[iter->first] = *(iter->second);
      iter++;
    }

    dom_node[kProps] = props;
    dom_node_array[i] = dom_node;
  }
  serializer_->WriteDenseJSArray(dom_node_array);
  std::pair<uint8_t*, size_t> buffer_pair = serializer_->Release();

  CallNativeMethod(buffer_pair, "createNode");
  return;
};

void HippyRenderManager::UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  serializer_->Release();
  serializer_->WriteHeader();

  uint32_t len = nodes.size();
  tdf::base::DomValue::DomValueArrayType dom_node_array;
  dom_node_array.resize(len);
  for (uint32_t i = 0; i < len; i++) {
    tdf::base::DomValue::DomValueObjectType dom_node;
    dom_node[kId] = tdf::base::DomValue(nodes[i]->GetId());
    dom_node[kPid] = tdf::base::DomValue(nodes[i]->GetPid());
    dom_node[kIndex] = tdf::base::DomValue(nodes[i]->GetIndex());
    dom_node[kName] = tdf::base::DomValue(nodes[i]->GetViewName());

    tdf::base::DomValue::DomValueObjectType props;
    // diff 属性
    auto diff = nodes[i]->GetDiffStyle();
    auto iter = diff.begin();
    while (iter != diff.end()) {
      props[iter->first] = *(iter->second);
      iter++;
    }
    dom_node[kProps] = props;
    dom_node_array[i] = dom_node;
  }
  serializer_->WriteDenseJSArray(dom_node_array);
  std::pair<uint8_t*, size_t> buffer_pair = serializer_->Release();

  CallNativeMethod(buffer_pair, "updateNode");
  return;
};

void HippyRenderManager::DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jintArray j_int_array;
  j_int_array = j_env->NewIntArray(nodes.size());
  std::vector<int> id;
  id.resize(nodes.size());
  for (size_t i = 0; i < nodes.size(); i++) {
    id[i] = nodes[i]->GetId();
  }
  j_env->SetIntArrayRegion(j_int_array, 0, nodes.size(), &id[0]);

  jobject j_object = render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    TDF_BASE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, "deleteNode", "([I)V");
  if (!j_method_id) {
    TDF_BASE_LOG(ERROR) << "deleteNode j_cb_id error";
    return;
  }

  j_env->CallVoidMethod(j_object, j_method_id, j_int_array);
  j_env->DeleteLocalRef(j_int_array);
  return;
};

void HippyRenderManager::UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) {
  TDF_BASE_NOTIMPLEMENTED();
};

void HippyRenderManager::MoveRenderNode(std::vector<int32_t>&& moved_ids, int32_t from_pid, int32_t to_pid) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jintArray j_int_array;
  j_int_array = j_env->NewIntArray(moved_ids.size());
  j_env->SetIntArrayRegion(j_int_array, 0, moved_ids.size(), &moved_ids[0]);

  jobject j_object = render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    TDF_BASE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, "moveNode", "([III)V");
  if (!j_method_id) {
    TDF_BASE_LOG(ERROR) << "moveNode j_cb_id error";
    return;
  }

  j_env->CallVoidMethod(j_object, j_method_id, j_int_array, from_pid, to_pid);
  j_env->DeleteLocalRef(j_int_array);

  return;
};

void HippyRenderManager::Batch() { TDF_BASE_NOTIMPLEMENTED(); };

void HippyRenderManager::AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) {
  TDF_BASE_NOTIMPLEMENTED();
}

void HippyRenderManager::RemoveEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) {
  TDF_BASE_NOTIMPLEMENTED();
}

void HippyRenderManager::CallFunction(std::weak_ptr<DomNode> domNode, const std::string& name, const DomValue& param,
                                      CallFunctionCallback cb) {
  TDF_BASE_NOTIMPLEMENTED();
};

void HippyRenderManager::CallNativeMethod(const std::pair<uint8_t*, size_t>& buffer, const std::string& method) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jobject j_buffer;
  j_buffer = j_env->NewByteArray(buffer.second);
  j_env->SetByteArrayRegion(reinterpret_cast<jbyteArray>(j_buffer), 0, buffer.second,
                            reinterpret_cast<const jbyte*>(buffer.first));

  jobject j_object = render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    TDF_BASE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, method.c_str(), "([B)V");
  if (!j_method_id) {
    TDF_BASE_LOG(ERROR) << method << " j_cb_id error";
    return;
  }

  j_env->CallVoidMethod(j_object, j_method_id, j_buffer);
  j_env->DeleteLocalRef(j_buffer);
}

}  // namespace dom
}  // namespace hippy