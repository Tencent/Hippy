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
import 'dart:typed_data';
// ignore: import_of_legacy_library_into_null_safe
import 'package:utf/utf.dart';
import 'string_encoding.dart';
import 'string_location.dart';
import 'string_table.dart';

class DirectStringTable extends StringTable {
  @override
  String lookup(ByteData byteData, StringEncoding encoding,
      StringLocation location, Object? relatedKey) {
    if (location == StringLocation.eVoid) {
      return "";
    }

    var dataList = byteData.buffer.asUint8List();
    if (encoding == StringEncoding.latin) {
      // iso-8896-1标准
      return Latin1Codec().decode(dataList);
    } else if (encoding == StringEncoding.utf16Le) {
      // utf16-le标准
      return decodeUtf16le(dataList);
    } else {
      return Utf8Codec().decode(dataList);
    }
  }

  @override
  void release() {}
}
