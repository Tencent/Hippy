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

#include "base/thread_util.h"

#include <cassert>
#include <sys/types.h>
#if __WIN32__
#include <windows.h>
#include <processthreadsapi.h>
#else
#include <pthread.h>
#include <unistd.h>
#endif

#include <cstdint>

#ifdef __ANDROID__
#include <sys/prctl.h>
#endif

#include "base/utils.h"

namespace hippy {
namespace base {
uint64_t ThreadUtil::GetThreadId() {
#ifdef __ANDROID__
  return gettid();
#elif defined(__APPLE__)
  uint64_t tid = 0;
  pthread_threadid_np(nullptr, &tid);
  return tid;
#elif __WIN32__
  return GetCurrentThreadId();
#endif
}

void ThreadUtil::SetCurrentThreadName(const std::string& name) {
  if (!name.empty()) {
#if defined(__APPLE__)
    pthread_setname_np(name.c_str());
#elif __ANDROID__
    pthread_setname_np(pthread_self(), name.c_str());
#elif __WIN32__
    // use dynamic load for compatibility of Windows Server 2016
    HMODULE kernel_module = LoadLibraryA("KernelBase.dll");
    typedef HRESULT (CALLBACK* SetThreadDescriptionFunc)(
            HANDLE hThread,
            PCWSTR lpThreadDescription
    );
    if (kernel_module != nullptr) {
        auto func = reinterpret_cast<SetThreadDescriptionFunc>(GetProcAddress(kernel_module, "SetThreadDescription"));
        if (func != nullptr) {
            auto hr = func(GetCurrentThread(), UTF8StringToWString(name).c_str());
            assert(SUCCEEDED(hr));
        }
        FreeLibrary(kernel_module);
    }
#endif
  }
}

std::string ThreadUtil::GetCurrentThreadName() {
  static const size_t kNameLength = 16;
  char name[kNameLength] = {'\0'};
  if (std::string(name).empty()) {
#ifdef __ANDROID__
    prctl(PR_GET_NAME, name);
#elif defined(__APPLE__)
    pthread_getname_np(pthread_self(), name, kNameLength);
#elif __WIN32__
    PWSTR desc;
      // use dynamic load for compatibility of Windows Server 2016
      HMODULE kernel_module = LoadLibraryA("KernelBase.dll");
      typedef HRESULT (CALLBACK* GetThreadDescriptionFunc)(
              HANDLE hThread,
              PWSTR  *ppszThreadDescription
      );
      if (kernel_module != nullptr) {
          auto func = reinterpret_cast<GetThreadDescriptionFunc>(GetProcAddress(kernel_module, "GetThreadDescription"));
          if (func != nullptr) {
              auto hr = func(GetCurrentThread(), &desc);
              if (SUCCEEDED(hr)) {
                  auto result = WStringToUTF8String(std::wstring(desc));
                  LocalFree(desc);
                  return result;
              } else {
                  assert(false);
              }
          }
          FreeLibrary(kernel_module);
      }
#endif
  }
  return std::string(name);
}

}  // namespace base
}  // namespace hippy