//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/2/24.
//

#pragma once

#include <map>
#include <string>

namespace tdf {
namespace devtools {

/**
 * Source of serviceworker response.
 * 命名与 CDP 枚举保持一致
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ServiceWorkerResponseSource
 */
enum class ServiceWorkerResponseSource {
  kCacheStorage,
  kHttpCache,
  kFallbackCode,
  kNetwork,
};

/**
 * The mixed content type of the request.
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Security/#type-MixedContentType
 */
enum class SecurityMixedContentType {
  kBlockable,
  kOptionallyLockable,
  kNone,
};

/**
 * 资源类型枚举
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ResourceType
 */
enum class ResourceType {
  kDocument,
  kStylesheet,
  kImage,
  kMedia,
  kFont,
  kScript,
  kTextTrack,
  kXHR,
  kFetch,
  kEventSource,
  kWebSocket,
  kManifest,
  kSignedExchange,
  kPing,
  kCSPViolationReport,
  kPreflight,
  kOther,
};

/**
 * The security level of a page or resource.
 * 命名与 CDP 枚举保持一致
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Security/#type-SecurityState
 */
enum class SecurityState { kUnknown, kNeutral, kInsecure, kSecure, kInfo, kInsecureBroken };

/**
 * Priority of the resource request at the time request is sent.
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ResourcePriority
 */
enum class ResourcePriority {
  kVeryLow,
  kLow,
  kMedium,
  kHigh,
  kVeryHigh,
};

class NetworkEnumUtils {
 public:
  static std::string ServiceWorkerResponseSourceToString(ServiceWorkerResponseSource type) {
    static std::map<ServiceWorkerResponseSource, std::string> map = {
        {ServiceWorkerResponseSource::kCacheStorage, "cache-storage"},
        {ServiceWorkerResponseSource::kHttpCache, "http-cache"},
        {ServiceWorkerResponseSource::kFallbackCode, "fallback-code"},
        {ServiceWorkerResponseSource::kNetwork, "network"}};
    return map[type];
  }

  static std::string SecurityStateToString(SecurityState type) {
    static std::map<SecurityState, std::string> map = {
        {SecurityState::kUnknown, "unknown"}, {SecurityState::kNeutral, "neutral"},
        {SecurityState::kInsecure, "secure"}, {SecurityState::kSecure, "insecure"},
        {SecurityState::kInfo, "info"},       {SecurityState::kInsecureBroken, "insecure-broken"}};
    return map[type];
  }

  static std::string SecurityMixedContentTypeToString(SecurityMixedContentType type) {
    static std::map<SecurityMixedContentType, std::string> map = {
        {SecurityMixedContentType::kBlockable, "blockable"},
        {SecurityMixedContentType::kOptionallyLockable, "optionally-blockable"},
        {SecurityMixedContentType::kNone, "none"}};
    return map[type];
  }

  static std::string ResourcePriorityToString(ResourcePriority type) {
    static std::map<ResourcePriority, std::string> map = {{ResourcePriority::kVeryLow, "VeryLow"},
                                                          {ResourcePriority::kLow, "Low"},
                                                          {ResourcePriority::kMedium, "Medium"},
                                                          {ResourcePriority::kHigh, "High"},
                                                          {ResourcePriority::kVeryHigh, "VeryHigh"}};
    return map[type];
  }

  static std::string ResourceTypeToString(ResourceType type) {
    static std::map<ResourceType, std::string> map = {{ResourceType::kDocument, "Document"},
                                                      {ResourceType::kStylesheet, "Stylesheet"},
                                                      {ResourceType::kImage, "Image"},
                                                      {ResourceType::kMedia, "Media"},
                                                      {ResourceType::kFont, "Font"},
                                                      {ResourceType::kScript, "Script"},
                                                      {ResourceType::kTextTrack, "TextTrack"},
                                                      {ResourceType::kXHR, "XHR"},
                                                      {ResourceType::kFetch, "Fetch"},
                                                      {ResourceType::kEventSource, "EventSource"},
                                                      {ResourceType::kWebSocket, "WebSocket"},
                                                      {ResourceType::kManifest, "Manifest"},
                                                      {ResourceType::kSignedExchange, "SignedExchange"},
                                                      {ResourceType::kPing, "Ping"},
                                                      {ResourceType::kCSPViolationReport, "CSPViolationReport"},
                                                      {ResourceType::kPreflight, "Preflight"},
                                                      {ResourceType::kOther, "Other"}};
    return map[type];
  }
};
}  // namespace devtools
}  // namespace tdf
