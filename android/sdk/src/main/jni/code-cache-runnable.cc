//
// Created by howlpan on 2019/4/18.
//

#include "code-cache-runnable.h"  // NOLINT(build/include_subdir)

#include <fstream>
#include <string>

CodeCacheRunnable::~CodeCacheRunnable() { code_cache = ""; }

void CodeCacheRunnable::run(const char* code_cache_path) {
  std::string str(code_cache_path, strlen(code_cache_path));
  std::ofstream outfile(str);
  outfile.write(code_cache.data(), code_cache.length());
  outfile.close();
}
