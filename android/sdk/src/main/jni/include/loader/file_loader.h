#ifndef HIPPY_JNI_LOADER_FILE_LOADER_H_
#define HIPPY_JNI_LOADER_FILE_LOADER_H_

#include "loader/adr_loader.h"

class FileLoader : public ADRLoader {
 public:
  FileLoader(const std::string& base);
  virtual ~FileLoader(){};

  virtual std::string Load(const std::string& uri);

 private:
  bool CheckValid(const std::string& path);
};

#endif  // HIPPY_JNI_LOADER_FILE_LOADER_H_
