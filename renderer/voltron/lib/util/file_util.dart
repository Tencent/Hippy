//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/services.dart' show rootBundle;
import 'package:path/path.dart';

import 'string_util.dart';

Future<ByteData> loadAssetFileBinary(String name) {
  return rootBundle.load(name);
}

Future<Directory?> createDir(Directory? parent, String dirName) async {
  if (parent == null || isEmpty(dirName)) return null;

  var childDir =
      Directory(parent.absolute.path + Platform.pathSeparator + dirName);
  if (!await childDir.exists()) await childDir.create();

  return childDir;
}

String fileNameByFile(FileSystemEntity? file) {
  if (file == null) {
    return "";
  }

  return basename(file.path);
}
