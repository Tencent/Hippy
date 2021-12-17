//
// Created by howlpan on 2019/4/18.
//

#ifndef CODE_CACHE_RUNNABLE_H_
#define CODE_CACHE_RUNNABLE_H_

#include <string>

class CodeCacheRunnable {
 public:
  CodeCacheRunnable() = default;
  ~CodeCacheRunnable();

 public:
  void run(const char* code_cache_path);

  std::string code_cache;
};

#endif  // CODE_CACHE_RUNNABLE_H_
