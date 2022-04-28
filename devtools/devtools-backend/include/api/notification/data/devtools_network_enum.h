/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include <map>
#include <string>

namespace hippy::devtools {

/**
 * Enumeration is automatically prefixed with k, such as One -> kOne
 */
#define VK(TypeName, KeyValue) k##KeyValue,

#define VS(TypeName, KeyValue) \
  case TypeName::k##KeyValue:  \
    return #KeyValue;

#define DEFINE_ENUM(TypeName, PropertyList)               \
  enum class TypeName { PropertyList(TypeName, VK) };     \
  inline std::string TypeName##ToString(TypeName value) { \
    switch (value) { PropertyList(TypeName, VS) }         \
  }

/**
 * The mixed content type of the request.
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Security/#type-MixedContentType
 */
#define SecurityMixedContentTypeEnumList(TypeName, V) \
  V(TypeName, Blockable)                              \
  V(TypeName, Optionally_blockable)                   \
  V(TypeName, None)

/**
 * The security level of a page or resource.
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Security/#type-SecurityState
 */
#define SecurityStateEnumList(TypeName, V) \
  V(TypeName, Unknown)                     \
  V(TypeName, Neutral)                     \
  V(TypeName, Secure)                      \
  V(TypeName, Insecure)                    \
  V(TypeName, Info)                        \
  V(TypeName, Insecure_broken)

/**
 * Source of serviceworker response.
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ServiceWorkerResponseSource
 */
#define ServiceWorkerResponseSourceEnumList(TypeName, V) \
  V(TypeName, Cache_storage)                             \
  V(TypeName, Http_cache)                                \
  V(TypeName, Fallback_code)                             \
  V(TypeName, Network)

/**
 * resource type num list
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ResourceType
 */
#define ResourceTypeEnumList(TypeName, V) \
  V(TypeName, Document)                   \
  V(TypeName, Stylesheet)                 \
  V(TypeName, Image)                      \
  V(TypeName, Media)                      \
  V(TypeName, Font)                       \
  V(TypeName, Script)                     \
  V(TypeName, TextTrack)                  \
  V(TypeName, XHR)                        \
  V(TypeName, Fetch)                      \
  V(TypeName, EventSource)                \
  V(TypeName, WebSocket)                  \
  V(TypeName, Manifest)                   \
  V(TypeName, SignedExchange)             \
  V(TypeName, Ping)                       \
  V(TypeName, CSPViolationReport)         \
  V(TypeName, Preflight)                  \
  V(TypeName, Other)

/**
 * Priority of the resource request at the time request is sent.
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ResourcePriority
 */
#define ResourcePriorityEnumList(TypeName, V) \
  V(TypeName, VeryLow)                        \
  V(TypeName, Low)                            \
  V(TypeName, Medium)                         \
  V(TypeName, High)                           \
  V(TypeName, VeryHigh)

DEFINE_ENUM(ResourcePriority, ResourcePriorityEnumList)
DEFINE_ENUM(ResourceType, ResourceTypeEnumList)
DEFINE_ENUM(ServiceWorkerResponseSource, ServiceWorkerResponseSourceEnumList)
DEFINE_ENUM(SecurityState, SecurityStateEnumList)
DEFINE_ENUM(SecurityMixedContentType, SecurityMixedContentTypeEnumList)

#undef DEFINE_ENUM
#undef VK
#undef VS
}  // namespace hippy::devtools
