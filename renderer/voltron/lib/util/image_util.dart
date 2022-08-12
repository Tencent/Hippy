//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
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

import 'dart:convert';
import 'dart:io';

import 'package:flutter/cupertino.dart';

ImageProvider getImage(String src) {
  ImageProvider image;
  if (src.startsWith('assets://')) {
    image = AssetImage(src.replaceFirst('assets://', ''));
  } else if (src.startsWith('file://')) {
    image = FileImage(File(src.replaceFirst('file://', '')));
  } else if (src.startsWith('data:')){ // base 64
    var base64Str = src.split('base64,').last;
    image = imageFromBase64String(base64Str);
  } else {
    image = NetworkImage(src);
  }
  return image;
}

MemoryImage imageFromBase64String(String base64String) {
  return MemoryImage(base64Decode(base64String));
}
