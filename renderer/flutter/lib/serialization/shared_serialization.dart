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

const Object kUndefined = Object();
const Object kNull = Object();
const Object kHole = Object();

abstract class SharedSerialization {
  static const int latestVersion = 13;

  final Object _nul = kNull;
  Object get nul => _nul;

  final Object _undefined = kUndefined;
  Object get undefined => _undefined;

  final Object _hole = kHole;
  Object get hole => _hole;

  SharedSerialization();
}
