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

import 'dart:typed_data';

import '../serialization.dart';
import '../util.dart';

extension TypeEx on Object {
  T? asType<T>() {
    if (this is T) {
      return this as T;
    }
    return null;
  }
}

extension BinaryUtilEx on Uint8List {
  T? decodeType<T>() {
    return decode()?.asType<T>();
  }

  Object? decode() {
    if (this.isEmpty) {
      return null;
    }
    var deserializer = Deserializer.defaultDeserializer();
    deserializer.reader = BinaryReader(this);
    deserializer.reset();
    deserializer.readHeader();
    return deserializer.readValue();
  }
}

extension JSonBinaryUtilEx on String {
  T? decodeType<T>() {
    return decode()?.asType<T>();
  }

  Object? decode() {
    return parseJsonString(this);
  }
}
