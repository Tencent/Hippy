#include "render/tdf_render_bridge.h"
#include "core/platform/android/jni/jni_platform_android.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "render/tdf/tdf_render_manager.h"

void TDFRenderBridge::Init(JavaVM* j_vm, __unused void* reserved) {
  // Init TDF Core: TDF Core was a static library for Hippy, so we need to do initialization manually.
  tdfcore::InitWithJavaVM(j_vm);
  JNIEnv *env = tdfcore::AttachCurrentThread();
  FOOTSTONE_DCHECK(env);
  bool result = tdfcore::Register(env);
  FOOTSTONE_DCHECK(result);

  // Init TDF Render
  hippy::TDFRenderManager::Init();
}

void TDFRenderBridge::RegisterScopeForUriLoader(uint32_t render_id, const std::shared_ptr<Scope>& scope) {
  hippy::TDFRenderManager::SetUriDataGetter(render_id,
      [scope](tdfrender::StringView uri, tdfrender::DataCb cb) {
        assert(scope->GetUriLoader());
        return scope->GetUriLoader()->RequestUntrustedContent(uri, cb);
      });
}

void TDFRenderBridge::Destroy() {}

jint OnCreateTDFRender(JNIEnv* j_env, jobject j_obj, jfloat j_density) {
  auto render = std::make_shared<hippy::TDFRenderManager>();
  auto& map = hippy::TDFRenderManager::PersistentMap();
  bool ret = map.Insert(render->GetId(), render);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "OnCreateTDFRender insert render manager invalid";
  }
  return render->GetId();
}

void RegisterTDFEngine(JNIEnv* j_env, jobject j_obj, jint render_id, jlong engine_id, jint root_view_id) {
  auto& map = hippy::TDFRenderManager::PersistentMap();
  std::shared_ptr<hippy::TDFRenderManager> render_manager;
  bool ret = map.Find(static_cast<int32_t>(render_id), render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(FATAL) << "BindTDFEngine engine_id invalid";
    return;
  }
  auto engine = reinterpret_cast<tdfcore::TDFEngineAndroid*>(engine_id);
  render_manager->RegisterShell(static_cast<uint32_t>(root_view_id), engine->GetShell());
}

REGISTER_JNI("com/tencent/renderer/TDFRenderer", "OnCreateTDFRender", "(F)I", OnCreateTDFRender)
REGISTER_JNI("com/tencent/renderer/TDFRenderer", "RegisterTDFEngine", "(IJI)V", RegisterTDFEngine)
