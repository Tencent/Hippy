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

#ifdef __WIN32__
#define _SILENCE_EXPERIMENTAL_FILESYSTEM_DEPRECATION_WARNING 1
#  include <windows.h>
#  include <io.h>
#  include <strsafe.h>
#  include <tchar.h>
#  include <experimental/filesystem>
typedef _off_t off64_t;
#else
#  include <unistd.h>
#  include <dirent.h>
#  include <cstdio>
#  include <cstdarg>
#  include <stdarg.h>
#endif

#include <sys/stat.h>
#include <sys/types.h>
#ifdef __APPLE__
#  include <TargetConditionals.h>
#  if TARGET_OS_IPHONE || TARGET_IPHONE_SIMULATOR
#    define off64_t off_t
#  elif TARGET_OS_MAC
#    include <sys/dtrace.h>  // for off_t
#  endif  // TARGET_OS_MAC
#  define ftruncate64 ftruncate
#  define lseek64 lseek
#endif  // __APPLE__
#include <string>
#include <vector>
#include <chrono>

#include "core/base/macros.h"

namespace hippy {
namespace base {
#ifdef __WIN32__
namespace fs = std::experimental::filesystem;
#endif
inline int vasprintf(char **strp, const char *fmt, va_list ap) {
#ifdef __WIN32__
  int len = _vscprintf(fmt, ap) + 1;
  *strp = new char[len];
  return vsprintf_s(*strp, len, fmt, ap);
#else
  return ::vasprintf(strp, fmt, ap);
#endif
}

inline int asprintf(char **strp, const char *fmt, ...) {
  va_list args;
  va_start(args, fmt);
#ifdef __WIN32__
  int result = vasprintf(strp, fmt, args);
#else
  int result = ::vasprintf(strp, fmt, args);
#endif
  va_end(args);
  return result;
}

typedef struct FileAttr {
  TSTRING abs_path;
  TSTRING file_name;
} FileAttr;

inline off64_t FdGetFileSize(int fd) {
  struct stat stat_buf { 0 };
  int rc = fstat(fd, &stat_buf);
  return rc == 0 ? stat_buf.st_size : -1;
}

inline uint64_t GetPageSize() {
#if __WIN32__
  SYSTEM_INFO sys_info;
  GetSystemInfo(&sys_info);
  return sys_info.dwPageSize;
#else
  return sysconf(_SC_PAGE_SIZE);
#endif
}

#if __WIN32__
inline bool WinTruncateFile(HANDLE fl, uint64_t size) {
  if (fl == INVALID_HANDLE_VALUE) {
    return false;
  }
  return SetFileValidData(fl, size);
}
#endif

inline bool TruncateFd(int fd, uint64_t size) {
#if __WIN32__
  auto handle = reinterpret_cast<HANDLE>(_get_osfhandle(fd));
  return WinTruncateFile(handle, size);
#else
  return ftruncate64(fd, size);
#endif
}

inline bool SeekFd(int fd, uint64_t pos) {
#if __WIN32__
  auto handle = reinterpret_cast<HANDLE>(_get_osfhandle(fd));
  if (handle == INVALID_HANDLE_VALUE) {
    return false;
  }

  LARGE_INTEGER lpos;
  lpos.QuadPart = pos;

  return SetFilePointerEx(handle, lpos, nullptr, FILE_BEGIN);
#else
  return lseek64(fd, pos, SEEK_SET) != -1;
#endif
}

inline bool FdResizeFile(int fd, off64_t new_size) {
  off64_t old_size = FdGetFileSize(fd);
  if (old_size < 0) {
    return false;
  }

  if (old_size != new_size) {
    auto page_size = GetPageSize();
    if (TruncateFd(fd, new_size) != 0) {
      return false;
    }
    // enlarge file, must write bytes to every page to ensure physical storage is allocated
    // if not, a SIGBUS event will raise when access the unallocated part
    // if system has no free storage, ONLY write the last pos is not enough.
    if (old_size < new_size) {
      for (off64_t i = (old_size + page_size) / page_size * page_size;
           i <= new_size; i += page_size) {
        if (!SeekFd(fd, i - 1)) {
          return false;
        }
        if (write(fd, "", 1) == -1) {
          return false;
        }
      }
    }
  }

  return true;
}

inline void FlushFileToDisk(FILE* fl) {
  if (fl != nullptr) {
    fflush(fl);
#if __WIN32__
    FlushFileBuffers(reinterpret_cast<HANDLE>(_get_osfhandle(_fileno(fl))));
#else
    fsync(fileno(fl));
#endif
  }
}

inline std::string WStringToUTF8String(const std::wstring &text) {
#if __WIN32__
  if (text.length() == 0) {
    return std::string();
  }
  size_t required_size = WideCharToMultiByte(CP_UTF8, 0, text.c_str(), text.length(), nullptr, 0, nullptr, nullptr);
  auto data = UP<char>(new char[required_size]);
  WideCharToMultiByte(CP_UTF8, 0, text.c_str(), text.length(), data.get(), required_size, nullptr, nullptr);
  return std::string(data.get(), required_size);
#else
//#error "not support non-windows system converting encoding"
  return "";
#endif
}

inline std::string TStringToUTF8String(const TSTRING &text) {
#ifndef UNICODE
  return text;
#endif

#if __WIN32__
  return WStringToUTF8String(text);
#else
//#error "not support non-windows system converting encoding"
#endif
}

inline std::wstring UTF8StringToWString(const std::string &text) {
#if __WIN32__
  size_t required_size = MultiByteToWideChar(CP_UTF8, 0, text.c_str(), text.length(), nullptr, 0);
  auto data = UP<wchar_t>(new wchar_t[required_size]);
  MultiByteToWideChar(CP_UTF8, 0, text.c_str(), text.length(), data.get(), required_size);
  return std::wstring(data.get(), required_size);
#else
//#error "not support non-win32 system converting encoding"
  return std::wstring('0', 1);
#endif
}

/***
 * 保证Path路径以'/'结尾
 * @param url
 */
inline void HandleLastSlash(TSTRING& url) {
  if (!url.empty()) {
    TCHAR last_char = url[url.size() - 1];
    if (last_char != TEXT(PATH_SPLITTER)) {
      url += TEXT(PATH_SPLITTER);
    }
  }
}

typedef std::function<bool(FileAttr& attr)> FileFilter;

/***
 * 获取指定路径的目录名和文件名
 * @param abs_dir 指定路径
 * @param filter 过滤器
 * @return 指定路径的目录名和文件名
 */
inline std::vector<FileAttr> GetFilesInDir(const TSTRING& abs_dir,
                                           const FileFilter& filter = nullptr) {
  std::vector<FileAttr> files;
  // Android 不支持filesystem
#ifdef __WIN32__
  if (!fs::exists(fs::path(abs_dir.c_str()))) {
      return files;
  }
  for (auto& entry : fs::directory_iterator(abs_dir)) {
    if (fs::is_regular_file(entry.path())) {
      auto attr = FileAttr();
      attr.abs_path = entry.path();
      attr.file_name = entry.path().filename();
      files.push_back(attr);
    }
  }
#else
  DIR* p_dir = nullptr;
  struct dirent* dmsg;
  char file_path[PATH_MAX];
  char dir[PATH_MAX];

  strcpy(dir, abs_dir.c_str());
  strcat(dir, "%s");

  if ((p_dir = opendir(abs_dir.c_str())) != nullptr) {
    while ((dmsg = readdir(p_dir)) != nullptr) {
      if (dmsg->d_type == DT_REG && strcmp(dmsg->d_name, ".") != 0 &&
          strcmp(dmsg->d_name, "..") != 0) {
        std::string file_name = dmsg->d_name;
        sprintf(file_path, dir, file_name.c_str());

        FileAttr attr;
        attr.abs_path = std::string(file_path);
        attr.file_name = std::string(file_name);
        if (filter == nullptr || filter(attr)) {
          files.push_back(attr);
        }
      }
    }
  }

  if (p_dir != nullptr) {
    closedir(p_dir);
  }
#endif
  return files;
}

inline static int64_t GetFileCreateTs(const TSTRING& abs_path) {
  int64_t create_ts = -1;
#ifdef __WIN32__
  FILE* fp = _tfopen(abs_path.c_str(), TEXT("r"));
#else
  FILE* fp = fopen(abs_path.c_str(), "r");
#endif
  if (fp) {
    struct stat stat_buf { 0 };
    int rc = fstat(fileno(fp), &stat_buf);
#ifdef __APPLE__
    create_ts = rc == 0 ? stat_buf.st_birthtimespec.tv_sec : -1;
#elif __WIN32__
    create_ts = rc == 0 ? stat_buf.st_ctime : -1;
#else  // __APPLE__
    create_ts = rc == 0 ? stat_buf.st_ctim.tv_sec : -1;
#endif  // __APPLE__
    fclose(fp);
  }
  return create_ts;
}

}  // namespace base
}  // namespace hippy