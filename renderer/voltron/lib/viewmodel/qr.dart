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

import 'package:qr_flutter/qr_flutter.dart';

import '../render.dart';
import 'view_model.dart';

class QrRenderViewModel extends RenderViewModel {
  String? text;
  int level = QrErrorCorrectLevel.L;
  int version = QrVersions.auto;

  QrRenderViewModel(
      int id, int instanceId, String className, RenderContext context)
      : super(id, instanceId, className, context);
}
