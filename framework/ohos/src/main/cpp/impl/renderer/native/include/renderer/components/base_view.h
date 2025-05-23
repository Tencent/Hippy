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

#pragma once

#include <js_native_api.h>
#include <js_native_api_types.h>
#include <string>
#include <sys/types.h>
#include "footstone/serializer.h"
#include "renderer/arkui/arkui_node.h"
#include "renderer/native_render_context.h"
#include "footstone/hippy_value.h"
#include "renderer/recycle/recycle_view.h"

namespace hippy {
inline namespace render {
inline namespace native {

using HippyValue = footstone::HippyValue;
using HippyValueObjectType = footstone::value::HippyValue::HippyValueObjectType;
using HippyValueArrayType = footstone::value::HippyValue::HippyValueArrayType;

class BaseView : public ArkUINodeDelegate, public std::enable_shared_from_this<BaseView> {
public:
  BaseView(std::shared_ptr<NativeRenderContext> &ctx);
  virtual ~BaseView();

  virtual void Init();

  std::shared_ptr<NativeRenderContext> &GetCtx() { return ctx_; }
  uint32_t GetTag() { return tag_; }
  std::string &GetViewType() { return view_type_; }
  std::vector<std::shared_ptr<BaseView>> &GetChildren() { return children_; }
  std::weak_ptr<BaseView> &GetParent() { return parent_; }

  void SetTag(uint32_t tag);
  void SetViewType(const std::string &type);
  void SetParent(std::shared_ptr<BaseView> parent);
  
  bool IsLazyCreate() { return isLazyCreate_; }

  virtual ArkUINode *GetLocalRootArkUINode() = 0;
  void CreateArkUINode(bool isFromLazy, int index = -1);
  virtual void CreateArkUINodeImpl() = 0;
  void DestroyArkUINode();
  virtual void DestroyArkUINodeImpl() = 0;
  
  virtual std::shared_ptr<RecycleView> RecycleArkUINode();
  virtual bool RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) { return false; }
  virtual bool ReuseArkUINode(std::shared_ptr<RecycleView> &recycleView, int32_t index);
  virtual bool ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) { return false; }
  
  bool SetProp(const std::string &propKey, const HippyValue &propValue);
  void OnSetPropsEnd();
  virtual bool SetViewProp(const std::string &propKey, const HippyValue &propValue) { return false; }
  virtual bool SetPropImpl(const std::string &propKey, const HippyValue &propValue);
  virtual void OnSetPropsEndImpl();
  void Call(const std::string &method, const std::vector<HippyValue> params,
                    std::function<void(const HippyValue &result)> callback);
  virtual void CallImpl(const std::string &method, const std::vector<HippyValue> params,
                    std::function<void(const HippyValue &result)> callback);
  void AddSubRenderView(std::shared_ptr<BaseView> &subView, int32_t index);
  void RemoveSubView(std::shared_ptr<BaseView> &subView);
  void RemoveFromParentView();

  void SetRenderViewFrame(const HRRect &frame, const HRPadding &padding = HRPadding(0, 0, 0, 0));
  void UpdateEventListener(HippyValueObjectType &newEvents);
  bool CheckRegisteredEvent(std::string &eventName);

  void SetTsRenderProvider(napi_env ts_env, napi_ref ts_render_provider_ref);
  void SetTsEventCallback(napi_ref ts_event_callback_ref);

  void SetPosition(const HRPosition &position);

  virtual void OnClick(const HRPosition &position) override;
  virtual void OnLongClick(const HRPosition &position) override;
  virtual void OnTouch(int32_t actionType, const HRPosition &screenPosition) override;
  virtual void OnAppear() override;
  virtual void OnDisappear() override;
  virtual void OnAreaChange(ArkUI_NumberValue* data) override;

protected:
  virtual void OnChildInserted(std::shared_ptr<BaseView> const &childView, int index);
  virtual void OnChildRemoved(std::shared_ptr<BaseView> const &childView, int32_t index);
  virtual void OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int index) {}
  virtual void OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {}
  virtual void OnChildReusedImpl(std::shared_ptr<BaseView> const &childView, int index) {}
  void UpdateRenderViewFrame(const HRRect &frame, const HRPadding &padding);
  virtual void UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding);
  virtual bool IsValidFrame(const HRRect &frame) { return true; }
  virtual bool HandleGestureBySelf() { return false; }

protected:
  bool SetLinearGradientProp(const std::string &propKey, const HippyValue &propValue);
  bool SetBackgroundImageProp(const std::string &propKey, const HippyValue &propValue);
  bool SetBorderProp(const std::string &propKey, const HippyValue &propValue);
  bool SetShadowProp(const std::string &propKey, const HippyValue &propValue);
  bool SetEventProp(const std::string &propKey, const HippyValue &propValue);

  virtual void SetClickable(bool flag);
  void SetLongClickable(bool flag);
  void SetPressIn(bool flag);
  void SetPressOut(bool flag);
  void SetTouchDownHandle(bool flag);
  void SetTouchMoveHandle(bool flag);
  void SetTouchEndHandle(bool flag);
  void SetTouchCancelHandle(bool flag);
  void SetInterceptTouch(bool flag);
  void SetInterceptPullUp(bool flag);
  void SetAttachedToWindowHandle(bool flag);
  void SetDetachedFromWindowHandle(bool flag);
  
  void UpdateLazyProps();
  void UpdateLazyAll();

  void HandleInterceptPullUp();
  int64_t GetTimeMilliSeconds();
  int32_t IndexOfChild(const std::shared_ptr<BaseView> child);

  std::shared_ptr<footstone::value::Serializer> &GetSerializer();

  void OnViewComponentEvent(const std::string &event_name, const HippyValueObjectType &hippy_object);

  std::shared_ptr<NativeRenderContext> ctx_;
  uint32_t tag_;
  std::string view_type_;
  std::vector<std::shared_ptr<BaseView>> children_;
  std::weak_ptr<BaseView> parent_;

  napi_env ts_env_ = nullptr;
  napi_ref ts_render_provider_ref_ = nullptr;
  napi_ref ts_event_callback_ref_ = nullptr;

  static std::shared_ptr<footstone::value::Serializer> serializer_;

  HRPosition backgroundImagePosition_ = {0, 0};

  float borderTopLeftRadius_ = 0;
  float borderTopRightRadius_ = 0;
  float borderBottomRightRadius_ = 0;
  float borderBottomLeftRadius_ = 0;
  float borderTopWidth_ = 0;
  float borderRightWidth_ = 0;
  float borderBottomWidth_ = 0;
  float borderLeftWidth_ = 0;
  std::string borderTopStyle_;
  std::string borderRightStyle_;
  std::string borderBottomStyle_;
  std::string borderLeftStyle_;
  uint32_t borderTopColor_ = 0;
  uint32_t borderRightColor_ = 0;
  uint32_t borderBottomColor_ = 0;
  uint32_t borderLeftColor_ = 0;

  HRShadow shadow_;

  bool toSetBackgroundImagePosition_ = false;
  bool toSetBorderRadius_ = false;
  bool toSetBorderWidth_ = false;
  bool toSetBorderStyle_ = false;
  bool toSetBorderColor_ = false;
  bool toSetShadow = false;

  std::function<void()> eventClick_;
  std::function<void()> eventLongClick_;
  std::function<void()> eventPressIn_;
  std::function<void()> eventPressOut_;
  std::function<void(const HRPosition &screenPosition)> eventTouchDown_;
  std::function<void(const HRPosition &screenPosition)> eventTouchUp_;
  std::function<void(const HRPosition &screenPosition)> eventTouchMove_;
  std::function<void(const HRPosition &screenPosition)> eventTouchCancel_;
  std::function<void()> eventAttachedToWindow_;
  std::function<void()> eventDetachedFromWindow_;

  bool flagInterceptPullUp_ = false;

  HippyValueObjectType events_;

  bool isLazyCreate_ = false;
  HippyValueObjectType lazyProps_;
  std::optional<HRRect> lazyFrame_;
  std::optional<HRPadding> lazyPadding_;
private:
  HippyValueObjectType CallNativeRenderProviderMethod(napi_env env, napi_ref render_provider_ref, uint32_t component_id, const std::string &method);  
};

}  // namespace native
}  // namespace render
}  // namespace hippy
