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

import 'dart:collection';

import 'package:collection/collection.dart';

import '../render.dart';
import 'view_model.dart';

class GroupViewModel extends RenderViewModel {
  // touch/click intercept
  bool interceptTouch = false;

  // pull intercept
  bool interceptPullUp = false;

  final List<RenderViewModel> _children = [];

  final HashMap<int, RenderViewModel> _childrenMap = HashMap();

  List<int> _sortedIdList = [];

  @override
  List<RenderViewModel> get children => _children;

  List<int> get sortedIdList => _sortedIdList;

  HashMap<int, RenderViewModel> get childrenMap => _childrenMap;

  @override
  RenderViewModel? childFromId(int id) {
    return _childrenMap[id];
  }

  @override
  int get childCount => _children.length;

  GroupViewModel(
    int id,
    int instanceId,
    String className,
    RenderContext context,
  ) : super(id, instanceId, className, context);

  GroupViewModel.copy(
    int id,
    int instanceId,
    String className,
    RenderContext context,
    GroupViewModel viewModel,
  ) : super.copy(id, instanceId, className, context, viewModel) {
    interceptTouch = viewModel.interceptTouch;
    interceptPullUp = viewModel.interceptPullUp;
    interceptTouch = viewModel.interceptTouch;
    _children.addAll(viewModel.children);
    _childrenMap.addAll(viewModel._childrenMap);
    _sortedIdList.addAll(viewModel.sortedIdList);
  }

  @override
  bool operator ==(Object other) {
    return other is GroupViewModel &&
        interceptTouch == other.interceptTouch &&
        interceptPullUp == other.interceptPullUp &&
        interceptTouch == other.interceptTouch &&
        const DeepCollectionEquality().equals(_sortedIdList, other.sortedIdList) &&
        super == (other);
  }

  @override
  int get hashCode =>
      interceptTouch.hashCode |
      interceptPullUp.hashCode |
      interceptTouch.hashCode |
      _sortedIdList.hashCode |
      super.hashCode;

  @override
  RenderViewModel? getChildAt(int index) {
    if (index >= 0 && index < childCount) {
      return _children[index];
    }
    return null;
  }

  @override
  void sortChildren() {
    // 根据zIndex排序
    _sortedIdList = [];
    if (_children.length > 1) {
      var sortChildren = <RenderViewModel>[];
      sortChildren.addAll(_children);
      insertionSort<RenderViewModel>(sortChildren, compare: (model1, model2) {
        var index1 = model1.zIndex;
        var index2 = model2.zIndex;
        return index1.compareTo(index2);
      });
      for (var model in sortChildren) {
        _sortedIdList.add(model.id);
      }
    } else if (_children.length == 1) {
      _sortedIdList.add(_children[0].id);
    }
  }

  void addViewModel(RenderViewModel child, int index) {
    var oldParent = child.parent;
    if (oldParent != null && oldParent is GroupViewModel) {
      oldParent.removeViewModel(child);
    }

    child.parent = this;
    if (index > childCount || index < 0) {
      _children.add(child);
    } else {
      _children.insert(index, child);
    }
    _childrenMap[child.id] = child;
  }

  void removeViewModel(RenderViewModel child) {
    child.parent = null;
    children.remove(child);
    _childrenMap.remove(child.id);
    _sortedIdList.remove(child.id);
  }
}

class DivContainerViewModel {
  final List<int> sortedIdList = [];
  final HashMap<int, RenderViewModel> childrenMap;
  final String overflow;
  final String name;
  final RenderContext context;
  final GroupViewModel _viewModel;

  int get id => _viewModel.id;

  GroupViewModel get viewModel => _viewModel;

  DivContainerViewModel(GroupViewModel viewModel)
      : _viewModel = viewModel,
        context = viewModel.context,
        overflow = viewModel.overflow,
        name = viewModel.name,
        childrenMap = viewModel.childrenMap {
    sortedIdList.addAll(viewModel.sortedIdList);
  }

  @override
  bool operator ==(Object other) =>
      other is DivContainerViewModel &&
      const DeepCollectionEquality().equals(sortedIdList, other.sortedIdList) &&
      overflow == other.overflow;

  @override
  int get hashCode => sortedIdList.hashCode | overflow.hashCode;
}
