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

#include "dom/render_manager.h"

namespace hippy {
inline namespace dom {

class ExtendRenderManager : public RenderManager {
 public:
  ExtendRenderManager() : id_(ExtendRenderManager::GenerateRenderId()) {}

  inline void SetDensity(float density) { density_ = density; }
  inline float GetDensity() const { return density_; }

  inline void SetDomManager(std::weak_ptr<DomManager> dom_manager) { dom_manager_ = dom_manager; }
  inline std::shared_ptr<DomManager> GetDomManager() const { return dom_manager_.lock(); }

  int32_t GetId() const { return id_; }

  static int32_t GenerateRenderId();
  static void Insert(const std::shared_ptr<ExtendRenderManager>& render_manager);
  static std::shared_ptr<ExtendRenderManager> Find(int32_t id);
  static bool Erase(int32_t id);
  static bool Erase(const std::shared_ptr<ExtendRenderManager>& render_manager);

 private:
  int32_t id_;
  float density_ = 1.0f;
  std::weak_ptr<DomManager> dom_manager_;
};

}  // namespace dom
}  // namespace hippy
