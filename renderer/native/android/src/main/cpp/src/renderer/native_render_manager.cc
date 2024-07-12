/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "renderer/native_render_manager.h"

#include <cstdint>
#include <iostream>
#include <utility>

#include "footstone/logging.h"
#include "footstone/macros.h"
#include "dom/root_node.h"
#include "jni/jni_env.h"
#include "jni/jni_invocation.h"
#include "renderer/native_render_jni.h"

constexpr char kId[] = "id";
constexpr char kPid[] = "pId";
constexpr char kIndex[] = "index";
constexpr char kName[] = "name";
constexpr char kWidth[] = "width";
constexpr char kHeight[] = "height";
constexpr char kLeft[] = "left";
constexpr char kTop[] = "top";
constexpr char kProps[] = "props";
constexpr char kDeleteProps[] = "deleteProps";
constexpr char kFontStyle[] = "fontStyle";
constexpr char kLetterSpacing[] = "letterSpacing";
constexpr char kColor[] = "kColor";
constexpr char kFontSize[] = "fontSize";
constexpr char kFontFamily[] = "fontFamily";
constexpr char kFontWeight[] = "fontWeight";
constexpr char kTextDecorationLine[] = "textDecorationLine";
constexpr char kTextShadowOffset[] = "textShadowOffset";
constexpr char kTextShadowRadius[] = "textShadowRadius";
constexpr char kTextShadowColor[] = "textShadowColor";
constexpr char kLineHeight[] = "lineHeight";
constexpr char kTextAlign[] = "textAlign";
constexpr char kText[] = "text";
constexpr char kEnableScale[] = "enableScale";
constexpr char kNumberOfLines[] = "numberOfLines";

#define MARK_DIRTY_PROPERTY(STYLES, FIND_STYLE, NODE) \
  do {                                                \
    FOOTSTONE_DCHECK(NODE != nullptr);                \
    if (STYLES->find(FIND_STYLE) != STYLES->end()) {  \
      NODE->MarkDirty();                              \
      return;                                         \
    }                                                 \
  } while (0)

namespace hippy {
inline namespace render {
inline namespace native {

static bool IsMeasureNode(const std::string &name) {
  return name == "Text" || name == "TextInput";
}

std::atomic<uint32_t> NativeRenderManager::unique_native_render_manager_id_{1};
footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<hippy::NativeRenderManager>> NativeRenderManager::persistent_map_;


StyleFilter::StyleFilter(const std::shared_ptr<JavaRef>& j_render_manager) {
  hippy::GetPropsRegisterForRender(j_render_manager, styles_);
}

NativeRenderManager::NativeRenderManager() : RenderManager("NativeRenderManager"),
      serializer_(std::make_shared<footstone::value::Serializer>()) {
  id_ = unique_native_render_manager_id_.fetch_add(1);
}

void NativeRenderManager::CreateRenderDelegate() {
  persistent_map_.Insert(id_, shared_from_this());
  FOOTSTONE_CHECK(hippy::CreateJavaRenderManager(id_, j_render_manager_, j_render_delegate_));
  NativeRenderManager::GetStyleFilter(j_render_manager_);
}

void NativeRenderManager::DestroyRenderDelegate(JNIEnv* j_env) {
  jobject j_object = j_render_manager_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    FOOTSTONE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }
  jmethodID j_method_id = j_env->GetMethodID(j_class, "destroy", "()V");
  if (!j_method_id) {
    FOOTSTONE_LOG(ERROR) << "destroy" << " j_method_id error";
    return;
  }
  j_env->CallVoidMethod(j_object, j_method_id);
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->DeleteLocalRef(j_class);
  persistent_map_.Erase(id_);
}

void NativeRenderManager::InitDensity() {
  density_ = hippy::GetDensity(j_render_manager_);
}

void NativeRenderManager::CreateRenderNode(std::weak_ptr<RootNode> root_node,
                                           std::vector<std::shared_ptr<hippy::dom::DomNode>>&& nodes) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  uint32_t root_id = root->GetId();

  footstone::value::SerializerHelper::DestroyBuffer(serializer_->Release());
  serializer_->WriteHeader();

  auto len = nodes.size();
  footstone::value::HippyValue::HippyValueArrayType dom_node_array;
  dom_node_array.resize(len);
  for (uint32_t i = 0; i < len; i++) {
    const auto& render_info = nodes[i]->GetRenderInfo();
    footstone::value::HippyValue::HippyValueObjectType dom_node;
    dom_node[kId] = footstone::value::HippyValue(render_info.id);
    dom_node[kPid] = footstone::value::HippyValue(render_info.pid);
    dom_node[kIndex] = footstone::value::HippyValue(render_info.index);
    dom_node[kName] = footstone::value::HippyValue(nodes[i]->GetViewName());

    if (IsMeasureNode(nodes[i]->GetViewName())) {
      int32_t id =  footstone::check::checked_numeric_cast<uint32_t, int32_t>(nodes[i]->GetId());
      MeasureFunction measure_function = [WEAK_THIS, root_id, id](float width, LayoutMeasureMode width_measure_mode,
                                                                  float height, LayoutMeasureMode height_measure_mode,
                                                                  void* layoutContext) -> LayoutSize {
        DEFINE_SELF(NativeRenderManager)
        if (!self) {
          return LayoutSize{0, 0};
        }
        int64_t result;
        self->CallNativeMeasureMethod(root_id, id, self->DpToPx(width), static_cast<int32_t>(width_measure_mode), self->DpToPx(height),
                                      static_cast<int32_t>(height_measure_mode), result);
        LayoutSize layout_result;
        layout_result.width = self->PxToDp(static_cast<float>((int32_t)(0xFFFFFFFF & (result >> 32))));
        layout_result.height = self->PxToDp(static_cast<float>((int32_t)(0xFFFFFFFF & result)));
        return layout_result;
      };
      nodes[i]->GetLayoutNode()->SetMeasureFunction(measure_function);
    }

    footstone::value::HippyValue::HippyValueObjectType props;
    // 样式属性
    auto style = nodes[i]->GetStyleMap();
    auto iter = style->begin();
    auto style_filter = NativeRenderManager::GetStyleFilter(j_render_manager_);
    while (iter != style->end()) {
      if (style_filter->Enable(iter->first)) {
        props[iter->first] = *(iter->second);
      }
      iter++;
    }
    // 用户自定义属性
    auto dom_ext = *nodes[i]->GetExtStyle();
    iter = dom_ext.begin();
    while (iter != dom_ext.end()) {
      props[iter->first] = *(iter->second);
      iter++;
    }

    dom_node[kProps] = props;
    dom_node_array[i] = dom_node;
  }
  serializer_->WriteValue(HippyValue(dom_node_array));
  std::pair<uint8_t*, size_t> buffer_pair = serializer_->Release();
  CallNativeMethod("createNode", root->GetId(), buffer_pair);
  footstone::value::SerializerHelper::DestroyBuffer(buffer_pair);
}

void NativeRenderManager::UpdateRenderNode(std::weak_ptr<RootNode> root_node,
                                           std::vector<std::shared_ptr<DomNode>>&& nodes) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }

  for (const auto &n : nodes) {
    auto node = root->GetNode(n->GetId());
    if (node == nullptr) continue;
    if (n->GetViewName() == "Text") {
      MarkTextDirty(root_node, n->GetId());
    }
  }

  footstone::value::SerializerHelper::DestroyBuffer(serializer_->Release());
  serializer_->WriteHeader();

  auto len = nodes.size();
  footstone::value::HippyValue::HippyValueArrayType dom_node_array;
  dom_node_array.resize(len);
  for (uint32_t i = 0; i < len; i++) {
    const auto& render_info = nodes[i]->GetRenderInfo();
    footstone::value::HippyValue::HippyValueObjectType dom_node;
    dom_node[kId] = footstone::value::HippyValue(render_info.id);
    dom_node[kPid] = footstone::value::HippyValue(render_info.pid);
    dom_node[kIndex] = footstone::value::HippyValue(render_info.index);
    dom_node[kName] = footstone::value::HippyValue(nodes[i]->GetViewName());

    footstone::value::HippyValue::HippyValueObjectType diff_props;
    footstone::value::HippyValue::HippyValueArrayType del_props;
    auto diff = nodes[i]->GetDiffStyle();
    if (diff) {
      auto iter = diff->begin();
      while (iter != diff->end()) {
        FOOTSTONE_DCHECK(iter->second != nullptr);
        if (iter->second) {
          diff_props[iter->first] = *(iter->second);
        }
        iter++;
      }
    }
    auto del = nodes[i]->GetDeleteProps();
    if (del) {
      auto iter = del->begin();
      while (iter != del->end()) {
        del_props.emplace_back(footstone::value::HippyValue(*iter));
        iter++;
      }
    }
    dom_node[kProps] = diff_props;
    dom_node[kDeleteProps] = del_props;
    dom_node_array[i] = dom_node;
  }
  serializer_->WriteValue(HippyValue(dom_node_array));
  std::pair<uint8_t*, size_t> buffer_pair = serializer_->Release();
  CallNativeMethod("updateNode", root->GetId(), buffer_pair);
  footstone::value::SerializerHelper::DestroyBuffer(buffer_pair);
}

void NativeRenderManager::MoveRenderNode(std::weak_ptr<RootNode> root_node,
                                         std::vector<std::shared_ptr<DomNode>> &&nodes) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }

  footstone::value::SerializerHelper::DestroyBuffer(serializer_->Release());
  serializer_->WriteHeader();

  auto len = nodes.size();
  footstone::value::HippyValue::HippyValueArrayType dom_node_array;
  dom_node_array.resize(len);
  for (uint32_t i = 0; i < len; i++) {
    const auto& render_info = nodes[i]->GetRenderInfo();
    footstone::value::HippyValue::HippyValueObjectType dom_node;
    dom_node[kId] = footstone::value::HippyValue(render_info.id);
    dom_node[kPid] = footstone::value::HippyValue(render_info.pid);
    dom_node[kIndex] = footstone::value::HippyValue(render_info.index);
    dom_node_array[i] = dom_node;
  }
  serializer_->WriteValue(HippyValue(dom_node_array));
  std::pair<uint8_t*, size_t> buffer_pair = serializer_->Release();

  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jobject j_buffer;
  auto j_size = footstone::check::checked_numeric_cast<size_t, jint>(buffer_pair.second);
  j_buffer = j_env->NewByteArray(j_size);
  j_env->SetByteArrayRegion(reinterpret_cast<jbyteArray>(j_buffer), 0, j_size,
                            reinterpret_cast<const jbyte*>(buffer_pair.first));
  jobject j_object = j_render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    FOOTSTONE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }
  jmethodID j_method_id = j_env->GetMethodID(j_class, "moveNode", "(I[B)V");
  if (!j_method_id) {
    FOOTSTONE_LOG(ERROR) << "moveNode" << " j_method_id error";
    return;
  }
  j_env->CallVoidMethod(j_object, j_method_id, root->GetId(), j_buffer);
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->DeleteLocalRef(j_buffer);
  j_env->DeleteLocalRef(j_class);
  footstone::value::SerializerHelper::DestroyBuffer(buffer_pair);
}

void NativeRenderManager::DeleteRenderNode(std::weak_ptr<RootNode> root_node,
                                           std::vector<std::shared_ptr<DomNode>>&& nodes) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jintArray j_int_array;
  auto size = footstone::check::checked_numeric_cast<size_t, jint>(nodes.size());
  j_int_array = j_env->NewIntArray(size);
  std::vector<jint> id;
  id.resize(nodes.size());
  for (size_t i = 0; i < nodes.size(); i++) {
    id[i] = footstone::check::checked_numeric_cast<uint32_t, jint>(nodes[i]->GetRenderInfo().id);
  }
  j_env->SetIntArrayRegion(j_int_array, 0, size, &id[0]);

  jobject j_object = j_render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    FOOTSTONE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, "deleteNode", "(I[I)V");
  if (!j_method_id) {
    FOOTSTONE_LOG(ERROR) << "deleteNode j_cb_id error";
    return;
  }

  j_env->CallVoidMethod(j_object, j_method_id, root->GetId(), j_int_array);
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->DeleteLocalRef(j_int_array);
  j_env->DeleteLocalRef(j_class);

}

void NativeRenderManager::UpdateLayout(std::weak_ptr<RootNode> root_node,
                                       const std::vector<std::shared_ptr<DomNode>>& nodes) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }

  footstone::value::SerializerHelper::DestroyBuffer(serializer_->Release());
  serializer_->WriteHeader();

  auto len = nodes.size();
  footstone::value::HippyValue::HippyValueArrayType dom_node_array;
  dom_node_array.resize(len);
  for (uint32_t i = 0; i < len; i++) {
    footstone::value::HippyValue::HippyValueObjectType dom_node;
    dom_node[kId] = footstone::value::HippyValue(nodes[i]->GetId());
    const auto& result = nodes[i]->GetRenderLayoutResult();
    dom_node[kWidth] = footstone::value::HippyValue(DpToPx(result.width));
    dom_node[kHeight] = footstone::value::HippyValue(DpToPx(result.height));
    dom_node[kLeft] = footstone::value::HippyValue(DpToPx(result.left));
    dom_node[kTop] = footstone::value::HippyValue(DpToPx(result.top));
    if (IsMeasureNode(nodes[i]->GetViewName())) {
      dom_node["paddingLeft"] = footstone::value::HippyValue(DpToPx(result.paddingLeft));
      dom_node["paddingTop"] = footstone::value::HippyValue(DpToPx(result.paddingTop));
      dom_node["paddingRight"] = footstone::value::HippyValue(DpToPx(result.paddingRight));
      dom_node["paddingBottom"] = footstone::value::HippyValue(DpToPx(result.paddingBottom));
    }
    dom_node_array[i] = dom_node;
  }
  serializer_->WriteValue(HippyValue(dom_node_array));
  std::pair<uint8_t*, size_t> buffer_pair = serializer_->Release();
  CallNativeMethod("updateLayout", root->GetId(), buffer_pair);
  footstone::value::SerializerHelper::DestroyBuffer(buffer_pair);
}

void NativeRenderManager::MoveRenderNode(std::weak_ptr<RootNode> root_node,
                                         std::vector<int32_t>&& moved_ids,
                                         int32_t from_pid,
                                         int32_t to_pid,
                                         int32_t index) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }

  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jintArray j_int_array;
  auto j_size = footstone::check::checked_numeric_cast<size_t, jint>(moved_ids.size());
  j_int_array = j_env->NewIntArray(j_size);
  j_env->SetIntArrayRegion(j_int_array, 0, j_size, &moved_ids[0]);

  jobject j_object = j_render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    FOOTSTONE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, "moveNode", "(I[IIII)V");
  if (!j_method_id) {
    FOOTSTONE_LOG(ERROR) << "moveNode j_cb_id error";
    return;
  }

  j_env->CallVoidMethod(j_object, j_method_id, root->GetId(), j_int_array, to_pid, from_pid, index);
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->DeleteLocalRef(j_int_array);
  j_env->DeleteLocalRef(j_class);
}

void NativeRenderManager::EndBatch(std::weak_ptr<RootNode> root_node) {
  auto root = root_node.lock();
  if (root) {
    CallNativeMethod("endBatch", root->GetId());
  }
}

void NativeRenderManager::BeforeLayout(std::weak_ptr<RootNode> root_node){}

void NativeRenderManager::AfterLayout(std::weak_ptr<RootNode> root_node) {
  // 更新布局信息前处理事件监听
  HandleListenerOps(root_node, event_listener_ops_, "updateEventListener");
}

void NativeRenderManager::AddEventListener(std::weak_ptr<RootNode> root_node,
                                           std::weak_ptr<DomNode> dom_node, const std::string& name) {
  auto node = dom_node.lock();
  if (node) {
    event_listener_ops_[node->GetId()].emplace_back(ListenerOp(true, dom_node, name));
  }
}

void NativeRenderManager::RemoveEventListener(std::weak_ptr<RootNode> root_node,
                                              std::weak_ptr<DomNode> dom_node, const std::string& name) {
  auto node = dom_node.lock();
  if (node) {
    event_listener_ops_[node->GetId()].emplace_back(ListenerOp(false, dom_node, name));
  }
}

void NativeRenderManager::CallFunction(std::weak_ptr<RootNode> root_node,
                                       std::weak_ptr<DomNode> domNode, const std::string& name, const DomArgument& param,
                                      uint32_t cb_id) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }

  std::shared_ptr<DomNode> node = domNode.lock();
  if (node == nullptr) {
    FOOTSTONE_LOG(ERROR) << "CallJs bad node";
    return;
  }

  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jobject j_object = j_render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    FOOTSTONE_LOG(ERROR) << "CallJs j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, "callUIFunction", "(IIJLjava/lang/String;[B)V");
  if (!j_method_id) {
    FOOTSTONE_LOG(ERROR) << "CallJs j_method_id error";
    return;
  }

  std::vector<uint8_t> param_bson;
  param.ToBson(param_bson);

  jbyteArray j_buffer;
  auto j_size = footstone::check::checked_numeric_cast<size_t, jint>(param_bson.size());
  j_buffer = j_env->NewByteArray(j_size);
  j_env->SetByteArrayRegion(reinterpret_cast<jbyteArray>(j_buffer), 0, j_size,
                            reinterpret_cast<const jbyte*>(param_bson.data()));

  jstring j_name = j_env->NewStringUTF(name.c_str());

  j_env->CallVoidMethod(j_object, j_method_id, root->GetId(), node->GetId(), (jlong)cb_id, j_name, j_buffer);
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->DeleteLocalRef(j_buffer);
  j_env->DeleteLocalRef(j_name);
  j_env->DeleteLocalRef(j_class);
}

void NativeRenderManager::ReceivedEvent(std::weak_ptr<RootNode> root_node, uint32_t dom_id,
                                        const std::string& event_name, const std::shared_ptr<HippyValue>& params,
                                        bool capture, bool bubble) {
  auto manager = dom_manager_.lock();
  FOOTSTONE_DCHECK(manager != nullptr);
  if (manager == nullptr) return;

  auto root = root_node.lock();
  FOOTSTONE_DCHECK(root != nullptr);
  if (root == nullptr) return;

  std::vector<std::function<void()>> ops = {[weak_dom_manager = dom_manager_, weak_root_node = root_node, dom_id,
                                             params = std::move(params), use_capture = capture, use_bubble = bubble,
                                             event_name = std::move(event_name)] {
    auto manager = weak_dom_manager.lock();
    if (manager == nullptr) return;

    auto root = weak_root_node.lock();
    if (root == nullptr) return;

    auto node = manager->GetNode(root, dom_id);
    if (node == nullptr) return;

    auto event = std::make_shared<DomEvent>(event_name, node, use_capture, use_bubble, params);
    node->HandleEvent(event);
  }};
  manager->PostTask(Scene(std::move(ops)));
}

float NativeRenderManager::DpToPx(float dp) const { return dp * density_; }

float NativeRenderManager::PxToDp(float px) const { return px / density_; }

void NativeRenderManager::CallNativeMethod(const std::string& method, uint32_t root_id, const std::pair<uint8_t*, size_t>& buffer) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jobject j_buffer;
  auto j_size = footstone::check::checked_numeric_cast<size_t, jint>(buffer.second);
  j_buffer = j_env->NewByteArray(j_size);
  j_env->SetByteArrayRegion(reinterpret_cast<jbyteArray>(j_buffer), 0, j_size,
                            reinterpret_cast<const jbyte*>(buffer.first));

  jobject j_object = j_render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    FOOTSTONE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, method.c_str(), "(I[B)V");
  if (!j_method_id) {
    FOOTSTONE_LOG(ERROR) << method << " j_method_id error";
    return;
  }

  j_env->CallVoidMethod(j_object, j_method_id, root_id, j_buffer);
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->DeleteLocalRef(j_buffer);
  j_env->DeleteLocalRef(j_class);
}

void NativeRenderManager::CallNativeMethod(const std::string& method, uint32_t root_id) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jobject j_object = j_render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    FOOTSTONE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, method.c_str(), "(I)V");
  if (!j_method_id) {
    FOOTSTONE_LOG(ERROR) << method << " j_method_id error";
    return;
  }

  j_env->CallVoidMethod(j_object, j_method_id, root_id);
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->DeleteLocalRef(j_class);

}

void NativeRenderManager::CallNativeMeasureMethod(const uint32_t root_id, const int32_t id, const float width, const int32_t width_mode,
                                                 const float height, const int32_t height_mode, int64_t& result) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jobject j_object = j_render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    FOOTSTONE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, "measure", "(IIFIFI)J");
  if (!j_method_id) {
    FOOTSTONE_LOG(ERROR) << "measure j_method_id error";
    return;
  }

  jlong measure_result = j_env->CallLongMethod(j_object, j_method_id, root_id, id, width, width_mode, height, height_mode);
  JNIEnvironment::ClearJEnvException(j_env);

  result = static_cast<int64_t>(measure_result);
  j_env->DeleteLocalRef(j_class);

}

void NativeRenderManager::HandleListenerOps(std::weak_ptr<RootNode> root_node,
                                            std::map<uint32_t, std::vector<ListenerOp>>& ops,
                                            const std::string& method_name) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }

  if (ops.empty()) {
    return;
  }

  footstone::value::HippyValue::HippyValueArrayType event_listener_ops;
  for (auto iter = ops.begin(); iter != ops.end(); ++iter) {
    footstone::value::HippyValue::HippyValueObjectType op;
    footstone::value::HippyValue::HippyValueObjectType events;

    const std::vector<ListenerOp> &listener_ops = iter->second;
    const auto len = listener_ops.size();
    std::vector<ListenerOp>::size_type index = 0;
    for (; index < len; index++) {
      const ListenerOp &listener_op = listener_ops[index];
      std::shared_ptr<DomNode> dom_node = listener_op.dom_node.lock();
      if (dom_node == nullptr) {
        break;
      }
      events[listener_op.name] = footstone::value::HippyValue(listener_op.add);
    }
    if (index == len) {
      op[kId] = footstone::value::HippyValue(iter->first);
      op[kProps] = events;
      event_listener_ops.emplace_back(op);
    }
  }

  ops.clear();
  if (event_listener_ops.empty()) {
    return;
  }

  footstone::value::SerializerHelper::DestroyBuffer(serializer_->Release());
  serializer_->WriteHeader();
  serializer_->WriteValue(HippyValue(event_listener_ops));
  std::pair<uint8_t*, size_t> buffer_pair = serializer_->Release();
  CallNativeMethod(method_name, root->GetId(), buffer_pair);
  footstone::value::SerializerHelper::DestroyBuffer(buffer_pair);
}

void NativeRenderManager::MarkTextDirty(std::weak_ptr<RootNode> weak_root_node, uint32_t node_id) {
  auto root_node = weak_root_node.lock();
  FOOTSTONE_DCHECK(root_node);
  if (root_node) {
    auto node = root_node->GetNode(node_id);
    FOOTSTONE_DCHECK(node);
    if (node) {
      auto diff_style = node->GetDiffStyle();
      if (diff_style) {
        MARK_DIRTY_PROPERTY(diff_style, kFontStyle, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kLetterSpacing, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kColor, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kFontSize, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kFontFamily, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kFontWeight, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kTextDecorationLine, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kTextShadowOffset, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kTextShadowRadius, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kTextShadowColor, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kLineHeight, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kTextAlign, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kText, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kEnableScale, node->GetLayoutNode());
        MARK_DIRTY_PROPERTY(diff_style, kNumberOfLines, node->GetLayoutNode());
      }
    }
  }
}

}  // namespace native
}  // namespace render
}  // namespace hippy
