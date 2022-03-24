#include "render/hippy_render_manager.h"

#include <cstdint>
#include <iostream>
#include <utility>

#include "base/logging.h"
#include "core/base/common.h"
#include "jni/jni_env.h"

#include "dom/taitank_layout_node.h"

constexpr char kId[] = "id";
constexpr char kPid[] = "pId";
constexpr char kIndex[] = "index";
constexpr char kName[] = "name";
constexpr char kWidth[] = "width";
constexpr char kHeight[] = "height";
constexpr char kLeft[] = "left";
constexpr char kTop[] = "top";
constexpr char kProps[] = "props";
constexpr char kMeasureNode[] = "Text";

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
    TDF_BASE_DCHECK(NODE != nullptr);                 \
    if (STYLES->find(FIND_STYLE) != STYLES->end()) {  \
      NODE->MarkDirty();                              \
      return;                                         \
    }                                                 \
  } while (0)

namespace hippy {
inline namespace dom {

static std::unordered_map<int32_t, std::shared_ptr<HippyRenderManager>> hippy_render_manager_map;
static std::mutex mutex;
static std::atomic<int32_t> global_hippy_render_manager_key{0};

HippyRenderManager::HippyRenderManager(std::shared_ptr<JavaRef> render_delegate)
    : render_delegate_(std::move(render_delegate)), serializer_(std::make_shared<tdf::base::Serializer>()) {
  id_ = global_hippy_render_manager_key.fetch_add(1);
}

void HippyRenderManager::Insert(const std::shared_ptr<HippyRenderManager>& render_manager) {
  std::lock_guard<std::mutex> lock(mutex);
  hippy_render_manager_map[render_manager->id_] = render_manager;
}

std::shared_ptr<HippyRenderManager> HippyRenderManager::Find(int32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = hippy_render_manager_map.find(id);
  if (it == hippy_render_manager_map.end()) {
    return nullptr;
  }
  return it->second;
}

bool HippyRenderManager::Erase(int32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = hippy_render_manager_map.find(id);
  if (it == hippy_render_manager_map.end()) {
    return false;
  }
  hippy_render_manager_map.erase(it);
  return true;
}

bool HippyRenderManager::Erase(const std::shared_ptr<HippyRenderManager>& render_manager) {
  return HippyRenderManager::Erase(render_manager->id_);
}

void HippyRenderManager::CreateRenderNode(std::vector<std::shared_ptr<hippy::dom::DomNode>>&& nodes) {
  serializer_->Release();
  serializer_->WriteHeader();

  auto len = nodes.size();
  tdf::base::DomValue::DomValueArrayType dom_node_array;
  dom_node_array.resize(len);
  for (uint32_t i = 0; i < len; i++) {
    const auto& render_info = nodes[i]->GetRenderInfo();
    tdf::base::DomValue::DomValueObjectType dom_node;
    dom_node[kId] = tdf::base::DomValue(render_info.id);
    dom_node[kPid] = tdf::base::DomValue(render_info.pid);
    dom_node[kIndex] = tdf::base::DomValue(render_info.index);
    dom_node[kName] = tdf::base::DomValue(nodes[i]->GetViewName());

    if (nodes[i]->GetViewName() == kMeasureNode) {
      int32_t id =  hippy::base::checked_numeric_cast<uint32_t, int32_t>(nodes[i]->GetId());
      MeasureFunction measure_function = [this, id](float width,
          LayoutMeasureMode width_measure_mode, float height,
          LayoutMeasureMode height_measure_mode,
          void* layoutContext) -> LayoutSize {
        int64_t result;
        this->CallNativeMeasureMethod(id, DpToPx(width), width_measure_mode,
                                      DpToPx(height), height_measure_mode,
                                      result);
        LayoutSize layout_result;
        layout_result.width = PxToDp(static_cast<float>((int32_t) (0xFFFFFFFF & (result >> 32))));
        layout_result.height = PxToDp(static_cast<float>((int32_t) (0xFFFFFFFF & result)));
        TDF_BASE_DLOG(INFO) << "measure width: " << (int32_t)(0xFFFFFFFF & (result >> 32))
                            << ", height: " << (int32_t)(0xFFFFFFFF & result) << ", result: " << result;
        return layout_result;
      };
      nodes[i]->GetLayoutNode()->SetMeasureFunction(measure_function);
    }

    tdf::base::DomValue::DomValueObjectType props;
    // 样式属性
    auto style = nodes[i]->GetStyleMap();
    auto iter = style->begin();
    while (iter != style->end()) {
      props[iter->first] = *(iter->second);
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
  serializer_->WriteDenseJSArray(dom_node_array);
  std::pair<uint8_t*, size_t> buffer_pair = serializer_->Release();

  CallNativeMethod(buffer_pair, "createNode");
}

void HippyRenderManager::UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  for (const auto& n : nodes) {
    if (n->GetTagName() == "Text") {
      MarkTextDirty(n->GetId());
    }
  }

  serializer_->Release();
  serializer_->WriteHeader();

  auto len = nodes.size();
  tdf::base::DomValue::DomValueArrayType dom_node_array;
  dom_node_array.resize(len);
  for (uint32_t i = 0; i < len; i++) {
    const auto& render_info = nodes[i]->GetRenderInfo();
    tdf::base::DomValue::DomValueObjectType dom_node;
    dom_node[kId] = tdf::base::DomValue(render_info.id);
    dom_node[kPid] = tdf::base::DomValue(render_info.pid);
    dom_node[kIndex] = tdf::base::DomValue(render_info.index);
    dom_node[kName] = tdf::base::DomValue(nodes[i]->GetViewName());

    tdf::base::DomValue::DomValueObjectType props;
    // 样式属性
    auto style = nodes[i]->GetStyleMap();
    auto iter = style->begin();
    while (iter != style->end()) {
      props[iter->first] = *(iter->second);
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
  serializer_->WriteDenseJSArray(dom_node_array);
  std::pair<uint8_t*, size_t> buffer_pair = serializer_->Release();

  CallNativeMethod(buffer_pair, "updateNode");
}

void HippyRenderManager::DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jintArray j_int_array;
  auto size = hippy::base::checked_numeric_cast<size_t, jint>(nodes.size());
  j_int_array = j_env->NewIntArray(size);
  std::vector<jint> id;
  id.resize(nodes.size());
  for (size_t i = 0; i < nodes.size(); i++) {
    id[i] = hippy::base::checked_numeric_cast<uint32_t, jint>(nodes[i]->GetId());
  }
  j_env->SetIntArrayRegion(j_int_array, 0, size, &id[0]);

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
}

void HippyRenderManager::UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) {
  serializer_->Release();
  serializer_->WriteHeader();

  auto len = nodes.size();
  tdf::base::DomValue::DomValueArrayType dom_node_array;
  dom_node_array.resize(len);
  for (uint32_t i = 0; i < len; i++) {
    tdf::base::DomValue::DomValueObjectType dom_node;
    dom_node[kId] = tdf::base::DomValue(nodes[i]->GetId());
    const auto& result = nodes[i]->GetRenderLayoutResult();
    dom_node[kWidth] = tdf::base::DomValue(DpToPx(result.width));
    dom_node[kHeight] = tdf::base::DomValue(DpToPx(result.height));
    dom_node[kLeft] = tdf::base::DomValue(DpToPx(result.left));
    dom_node[kTop] = tdf::base::DomValue(DpToPx(result.top));
    if (nodes[i]->GetViewName() == kMeasureNode) {
      dom_node["paddingLeft"] = tdf::base::DomValue(DpToPx(result.paddingLeft));
      dom_node["paddingTop"] = tdf::base::DomValue(DpToPx(result.paddingTop));
      dom_node["paddingRight"] = tdf::base::DomValue(DpToPx(result.paddingRight));
      dom_node["paddingBottom"] = tdf::base::DomValue(DpToPx(result.paddingBottom));
    }
    dom_node_array[i] = dom_node;
  }
  serializer_->WriteDenseJSArray(dom_node_array);
  std::pair<uint8_t*, size_t> buffer_pair = serializer_->Release();

  CallNativeMethod(buffer_pair, "updateLayout");
}

void HippyRenderManager::MoveRenderNode(std::vector<int32_t>&& moved_ids, int32_t from_pid, int32_t to_pid) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jintArray j_int_array;
  auto j_size = hippy::base::checked_numeric_cast<size_t, jint>(moved_ids.size());
  j_int_array = j_env->NewIntArray(j_size);
  j_env->SetIntArrayRegion(j_int_array, 0, j_size, &moved_ids[0]);

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

  j_env->CallVoidMethod(j_object, j_method_id, j_int_array, to_pid, from_pid);
  j_env->DeleteLocalRef(j_int_array);
}

void HippyRenderManager::EndBatch() { CallNativeMethod("endBatch"); }

void HippyRenderManager::BeforeLayout(){}

void HippyRenderManager::AfterLayout() {
  // 更新布局信息前处理事件监听
  HandleListenerOps(event_listener_ops_, "updateEventListener");
}

void HippyRenderManager::AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) {
  event_listener_ops_.emplace_back(ListenerOp(true, dom_node, name));
}

void HippyRenderManager::RemoveEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) {
  event_listener_ops_.emplace_back(ListenerOp(false, dom_node, name));
}

void HippyRenderManager::CallFunction(std::weak_ptr<DomNode> domNode, const std::string& name, const DomArgument& param,
                                      uint32_t cb_id) {
  std::shared_ptr<DomNode> node = domNode.lock();
  if (node == nullptr) {
    TDF_BASE_LOG(ERROR) << "CallJs bad node";
    return;
  }

  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jobject j_object = render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    TDF_BASE_LOG(ERROR) << "CallJs j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, "callUIFunction", "(IJLjava/lang/String;[B)V");
  if (!j_method_id) {
    TDF_BASE_LOG(ERROR) << "CallJs j_method_id error";
    return;
  }

  std::vector<uint8_t> param_bson;
  param.ToBson(param_bson);

  jbyteArray j_buffer;
  auto j_size = hippy::base::checked_numeric_cast<size_t, jint>(param_bson.size());
  j_buffer = j_env->NewByteArray(j_size);
  j_env->SetByteArrayRegion(reinterpret_cast<jbyteArray>(j_buffer), 0, j_size,
                            reinterpret_cast<const jbyte*>(param_bson.data()));

  jstring j_name = j_env->NewStringUTF(name.c_str());

  j_env->CallVoidMethod(j_object, j_method_id, node->GetId(), (jlong)cb_id, j_name, j_buffer);
  j_env->DeleteLocalRef(j_buffer);
  j_env->DeleteLocalRef(j_name);
}

float HippyRenderManager::DpToPx(float dp) const { return dp * density_; }

float HippyRenderManager::PxToDp(float px) const { return px / density_; }

void HippyRenderManager::CallNativeMethod(const std::pair<uint8_t*, size_t>& buffer, const std::string& method) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jobject j_buffer;
  auto j_size = hippy::base::checked_numeric_cast<size_t, jint>(buffer.second);
  j_buffer = j_env->NewByteArray(j_size);
  j_env->SetByteArrayRegion(reinterpret_cast<jbyteArray>(j_buffer), 0, j_size,
                            reinterpret_cast<const jbyte*>(buffer.first));

  jobject j_object = render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    TDF_BASE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, method.c_str(), "([B)V");
  if (!j_method_id) {
    TDF_BASE_LOG(ERROR) << method << " j_method_id error";
    return;
  }

  j_env->CallVoidMethod(j_object, j_method_id, j_buffer);
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->DeleteLocalRef(j_buffer);
}

void HippyRenderManager::CallNativeMethod(const std::string& method) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jobject j_object = render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    TDF_BASE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, method.c_str(), "()V");
  if (!j_method_id) {
    TDF_BASE_LOG(ERROR) << method << " j_method_id error";
    return;
  }

  j_env->CallVoidMethod(j_object, j_method_id);
  JNIEnvironment::ClearJEnvException(j_env);
}

void HippyRenderManager::CallNativeMeasureMethod(const int32_t id, const float width, const int32_t width_mode,
                                                 const float height, const int32_t height_mode, int64_t& result) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  jobject j_object = render_delegate_->GetObj();
  jclass j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    TDF_BASE_LOG(ERROR) << "CallNativeMethod j_class error";
    return;
  }

  jmethodID j_method_id = j_env->GetMethodID(j_class, "measure", "(IFIFI)J");
  if (!j_method_id) {
    TDF_BASE_LOG(ERROR) << "measure j_method_id error";
    return;
  }

  jlong measure_result = j_env->CallLongMethod(j_object, j_method_id, id, width, width_mode, height, height_mode);
  JNIEnvironment::ClearJEnvException(j_env);

  result = (int64_t)measure_result;
}

void HippyRenderManager::HandleListenerOps(std::vector<ListenerOp>& ops, const std::string& method_name) {
  if (ops.empty()) {
    return;
  }

  auto len = ops.size();
  tdf::base::DomValue::DomValueArrayType event_listener_ops;
  size_t index = 0;
  while (index < len) {
    std::shared_ptr<DomNode> dom_node = ops[index].dom_node.lock();
    if (dom_node == nullptr) {
      index++;
      continue;
    }

    auto current_id = dom_node->GetId();
    bool current_add = ops[index].add;
    tdf::base::DomValue::DomValueObjectType op;
    op[kId] = tdf::base::DomValue(current_id);
    tdf::base::DomValue::DomValueObjectType events;
    events[ops[index].name] = tdf::base::DomValue(current_add);
    index++;

    while (index < len) {
      std::shared_ptr<DomNode> node = ops[index].dom_node.lock();
      if (node == nullptr) {
        index++;
        break;
      }
      if (node->GetId() == current_id) {
        // batch add or remove operations with the same nodes together.
        events[ops[index].name] = tdf::base::DomValue(ops[index].add);
        index++;
      } else {
        break;
      }
    }

    op[kProps] = events;
    event_listener_ops.emplace_back(op);
  }

  ops.clear();
  if (event_listener_ops.empty()) {
    return;
  }

  serializer_->Release();
  serializer_->WriteHeader();
  serializer_->WriteDenseJSArray(event_listener_ops);
  std::pair<uint8_t*, size_t> buffer_pair = serializer_->Release();
  CallNativeMethod(buffer_pair, method_name);
}

void HippyRenderManager::MarkTextDirty(uint32_t node_id) {
  auto dom_manager = dom_manager_.lock();
  TDF_BASE_DCHECK(dom_manager);
  if (dom_manager) {
    auto node = dom_manager->GetNode(node_id);
    TDF_BASE_DCHECK(node);
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

}  // namespace dom
}  // namespace hippy
