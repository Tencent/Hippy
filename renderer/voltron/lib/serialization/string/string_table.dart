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

import 'package:flutter/services.dart';
import 'string_encoding.dart';
import 'string_location.dart';

/// A String pool, used to store and lookup frequently construct string objects.
abstract class StringTable {
  /// Use the specified {@code byteBuffer} and its {@code encoding} to find a string in the string table,
  /// if it exists, return its reference, if not, constructs a new one.
  ///
  /// If the string to be lookup is located in [StringLocation.eVoid], this means that the string will not be used,
  /// can simply return an empty string.
  ///
  /// The byte buffer used to lookup
  /// The [StringEncoding] of a supported encoding
  /// The location of the string
  /// If the string located in the value position of the k-v structure
  ///
  /// Return The string corresponding to [ByteData]
  String lookup(ByteData byteData, StringEncoding encoding,
      StringLocation location, Object? relatedKey);

  void release();
}
