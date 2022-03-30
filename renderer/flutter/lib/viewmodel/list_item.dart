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

import 'package:voltron_renderer/render.dart';

import 'group.dart';

class ListItemViewModel extends GroupViewModel {
  bool shouldSticky;

  ListItemViewModel(int id, int instanceId, String className, this.shouldSticky,
      RenderContext context)
      : super(id, instanceId, className, context);

  ListItemViewModel.copy(int id, int instanceId, String className,
      this.shouldSticky, RenderContext context, ListItemViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel) {
    shouldSticky = viewModel.shouldSticky;
  }

  @override
  bool operator ==(Object other) {
    return other is ListItemViewModel &&
        shouldSticky == other.shouldSticky &&
        super == (other);
  }

  @override
  int get hashCode => shouldSticky.hashCode | super.hashCode;
}
