/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2024 THL A29 Limited, a Tencent company.
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

#include "renderer/arkui/dialog_controller.h"
#include "renderer/arkui/native_dialog_api.h"

namespace hippy {
inline namespace render {
inline namespace native {

DialogController::DialogController(){
  dialogHandle = NativeDialogApi::GetInstance()->create();
}

DialogController::~DialogController(){
  if(dialogHandle)
    NativeDialogApi::GetInstance()->dispose(dialogHandle);
}

void DialogController::SetContent(ArkUI_NodeHandle content){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->setContent(dialogHandle,content));
}

void DialogController::RemoveContent(){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->removeContent(dialogHandle));
}

void DialogController::SetContentAlignment(int32_t alignment, float offsetX, float offsetY){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->setContentAlignment(dialogHandle,alignment,offsetX,offsetY));  
}

void DialogController::ResetContentAlignment(){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->resetContentAlignment(dialogHandle));  
}

void DialogController::SetModalMode(bool isModal){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->setModalMode(dialogHandle,isModal));  
}

void DialogController::SetAutoCancel(bool autoCancel){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->setAutoCancel(dialogHandle,autoCancel));
}

void DialogController::SetMask(uint32_t maskColor, const ArkUI_Rect* maskRect){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->setMask(dialogHandle,maskColor,maskRect));
}

void DialogController::SetBackgroundColor(uint32_t backgroundColor){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->setBackgroundColor(dialogHandle,backgroundColor));
}

void DialogController::SetCornerRadius(float topLeft, float topRight,float bottomLeft, float bottomRight){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->setCornerRadius(dialogHandle,topLeft,topRight,bottomLeft,bottomRight));
}

void DialogController::SetGridColumnCount(int32_t gridCount){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->setGridColumnCount(dialogHandle,gridCount));
}

void DialogController::EnableCustomStyle(bool enableCustomStyle){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->enableCustomStyle(dialogHandle,enableCustomStyle));
}

void DialogController::EnableCustomAnimation(bool enableCustomAnimation){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->enableCustomAnimation(dialogHandle,enableCustomAnimation));
}

void DialogController::Show(){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->show(dialogHandle, false));
}

void DialogController::Close(){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->close(dialogHandle));
}

void DialogController::RegisterOnWillDismiss(ArkUI_OnWillDismissEvent eventHandler){
  if(!dialogHandle)
    return;
  MaybeThrow(NativeDialogApi::GetInstance()->registerOnWillDismiss(dialogHandle,eventHandler));    
}

} // namespace native
} // namespace render
} // namespace hippy
