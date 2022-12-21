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

import 'dart:ui' as ui show PlaceholderAlignment;

import 'package:flutter/material.dart';
import 'package:voltron_renderer/style.dart';

import '../common.dart';
import '../controller.dart';
import '../util.dart';

class ImageVirtualNode extends VirtualNode {
  static const String propVerticalAlignment = "verticalAlignment";
  static const String propVerticalAlign = "verticalAlign";

  static ImageSpanMethodProvider sImageSpanMethodProvider = ImageSpanMethodProvider();

  double mWidth = 0.0;
  double mHeight = 0.0;

  final List<String> _imageEventTypes = [];

  String imgSrc = '';

  bool _isFirstLoad = true;

  ui.PlaceholderAlignment _verticalAlignment = ui.PlaceholderAlignment.bottom;

  ui.PlaceholderAlignment get verticalAlignment => _verticalAlignment;

  ImageVirtualNode(
    rootId,
    id,
    pid,
    index,
    renderContext,
  ) : super(rootId, id, pid, index, renderContext);

  // for Android
  @ControllerProps(NodeProps.kSrc)
  void src(String src) {
    src = context.convertRelativePath(rootId, src);
    if (src != imgSrc) {
      imgSrc = src;
      _isFirstLoad = true;
    }
  }

  // for iOS
  @ControllerProps(NodeProps.kSource)
  void source(VoltronArray source) {
    if (source.size() == 0) return;
    VoltronMap? firstObj = source.get<VoltronMap>(0);
    String? src = firstObj?.get<String>('uri');
    if (src != null) {
      var srcComputed = context.convertRelativePath(rootId, src);
      if (srcComputed != imgSrc) {
        imgSrc = srcComputed;
        _isFirstLoad = true;
      }
    }
  }

  @ControllerProps(NodeProps.kOnLoad)
  void setOnLoad(bool flag) {
    if (flag) {
      _imageEventTypes.add(NodeProps.kOnLoad);
    }
  }

  @ControllerProps(NodeProps.kOnLoadEnd)
  void setOnLoadEnd(bool flag) {
    if (flag) {
      _imageEventTypes.add(NodeProps.kOnLoadEnd);
    }
  }

  @ControllerProps(NodeProps.kOnLoadStart)
  void setOnLoadStart(bool flag) {
    if (flag) {
      _imageEventTypes.add(NodeProps.kOnLoadStart);
    }
  }

  @ControllerProps(NodeProps.kOnError)
  void setOnError(bool flag) {
    if (flag) {
      _imageEventTypes.add(NodeProps.kOnError);
    }
  }

  @ControllerProps(NodeProps.kOnProgress)
  void setOnProgress(bool flag) {
    if (flag) {
      _imageEventTypes.add(NodeProps.kOnProgress);
    }
  }

  @ControllerProps(propVerticalAlignment)
  void setVerticalAlignment(String alignment) {
    if (alignment == 'baseline') {
      _verticalAlignment = ui.PlaceholderAlignment.baseline;
    } else if (alignment == 'middle') {
      _verticalAlignment = ui.PlaceholderAlignment.middle;
    } else if (alignment == 'top') {
      _verticalAlignment = ui.PlaceholderAlignment.top;
    } else if (alignment == 'bottom') {
      _verticalAlignment = ui.PlaceholderAlignment.bottom;
    }
  }

  @ControllerProps(NodeProps.kWidth)
  void setWidth(double v) {
    mWidth = v;
  }

  @ControllerProps(NodeProps.kHeight)
  void setHeight(double v) {
    mHeight = v;
  }

  void _sendComponentEvent(
    String type,
    VoltronMap params,
  ) {
    context.renderBridgeManager.sendComponentEvent(
      rootId,
      id,
      type,
      params,
    );
  }

  WidgetSpan createSpan() {
    if (imgSrc != '' && mWidth > 0 && mHeight > 0) {
      var src = imgSrc;
      var isFirstLoad = _isFirstLoad;
      _isFirstLoad = false;
      try {
        /// getImage will throw base64 error
        var img = getImage(imgSrc);
        if (_imageEventTypes.isNotEmpty) {
          if (imgSrc == src && isFirstLoad) {
            _sendComponentEvent(
              "loadStart",
              VoltronMap(),
            );
          }
          img.resolve(const ImageConfiguration()).addListener(ImageStreamListener(
                (image, flag) {
                  if (imgSrc == src && isFirstLoad) {
                    _sendComponentEvent(
                      "load",
                      VoltronMap(),
                    );
                    _sendComponentEvent(
                      "loadEnd",
                      VoltronMap(),
                    );
                  }
                },
                onChunk: (event) {
                  if (imgSrc == src && isFirstLoad) {
                    var total = event.expectedTotalBytes;
                    var loaded = event.cumulativeBytesLoaded;
                    if (loaded > 0 && total is int && total > 0) {
                      var params = VoltronMap();
                      params.push('loaded', loaded);
                      params.push('total', total);
                      _sendComponentEvent(
                        "progress",
                        params,
                      );
                    }
                  }
                },
                onError: (exception, stackTrace) {
                  if (imgSrc == src && isFirstLoad) {
                    _sendComponentEvent(
                      "error",
                      VoltronMap(),
                    );
                    _sendComponentEvent(
                      "loadEnd",
                      VoltronMap(),
                    );
                  }
                },
              ));
        }
        Widget current = Container(
          decoration: BoxDecoration(
            image: DecorationImage(
              image: img,
              alignment: Alignment.center,
              repeat: ImageRepeat.noRepeat,
              fit: BoxFit.fill,
            ),
          ),
          width: mWidth,
          height: mHeight,
        );
        if (nativeGestureDispatcher.needListener()) {
          current = Listener(
            behavior: HitTestBehavior.opaque,
            onPointerDown: (event) => nativeGestureDispatcher.handleOnTouchEvent(event),
            onPointerCancel: (event) => nativeGestureDispatcher.handleOnTouchEvent(event),
            onPointerMove: (event) => nativeGestureDispatcher.handleOnTouchEvent(event),
            onPointerUp: (event) => nativeGestureDispatcher.handleOnTouchEvent(event),
            child: GestureDetector(
              onTap: () => nativeGestureDispatcher.handleClick(),
              onLongPress: () => nativeGestureDispatcher.handleLongClick(),
              child: current,
            ),
          );
        }
        return WidgetSpan(
          alignment: _verticalAlignment,
          baseline: TextBaseline.alphabetic,
          child: current,
        );
      } catch (e) {
        return const WidgetSpan(
          child: SizedBox(
            width: 0,
            height: 0,
          ),
        );
      }
    } else {
      return const WidgetSpan(
        child: SizedBox(
          width: 0,
          height: 0,
        ),
      );
    }
  }

  @override
  MethodPropProvider get provider => sImageSpanMethodProvider;
}

class ImageSpanMethodProvider extends StyleMethodPropProvider {
  ImageSpanMethodProvider() {
    pushMethodProp(
      NodeProps.kSrc,
      StyleMethodProp(
        (consumer, value) {
          if (consumer is ImageVirtualNode && value is String) {
            consumer.src(value);
          }
        },
        '',
      ),
    );
    pushMethodProp(
      NodeProps.kSource,
      StyleMethodProp(
        (consumer, value) {
          if (consumer is ImageVirtualNode && value is VoltronArray) {
            consumer.source(value);
          }
        },
        VoltronArray(),
      ),
    );
    pushMethodProp(
      NodeProps.kOnProgress,
      StyleMethodProp(
        (consumer, value) {
          if (consumer is ImageVirtualNode && value is bool) {
            consumer.setOnProgress(value);
          }
        },
        false,
      ),
    );
    pushMethodProp(
      NodeProps.kOnLoadStart,
      StyleMethodProp(
        (consumer, value) {
          if (consumer is ImageVirtualNode && value is bool) {
            consumer.setOnLoadStart(value);
          }
        },
        false,
      ),
    );
    pushMethodProp(
      NodeProps.kOnLoad,
      StyleMethodProp(
        (consumer, value) {
          if (consumer is ImageVirtualNode && value is bool) {
            consumer.setOnLoad(value);
          }
        },
        false,
      ),
    );
    pushMethodProp(
      NodeProps.kOnLoadEnd,
      StyleMethodProp(
        (consumer, value) {
          if (consumer is ImageVirtualNode && value is bool) {
            consumer.setOnLoadEnd(value);
          }
        },
        false,
      ),
    );
    pushMethodProp(
      NodeProps.kOnError,
      StyleMethodProp(
        (consumer, value) {
          if (consumer is ImageVirtualNode && value is bool) {
            consumer.setOnError(value);
          }
        },
        false,
      ),
    );
    pushMethodProp(
      ImageVirtualNode.propVerticalAlignment,
      StyleMethodProp(
        (consumer, value) {
          if (consumer is ImageVirtualNode && value is String) {
            consumer.setVerticalAlignment(value);
          }
        },
        '',
      ),
    );
    pushMethodProp(
      ImageVirtualNode.propVerticalAlign,
      StyleMethodProp(
        (consumer, value) {
          if (consumer is ImageVirtualNode && value is String) {
            consumer.setVerticalAlignment(value);
          }
        },
        '',
      ),
    );
    pushMethodProp(
      NodeProps.kWidth,
      StyleMethodProp(
        (consumer, value) {
          if (consumer is ImageVirtualNode && value is double) {
            consumer.setWidth(value);
          }
        },
        0.0,
      ),
    );
    pushMethodProp(
      NodeProps.kHeight,
      StyleMethodProp(
        (consumer, value) {
          if (consumer is ImageVirtualNode && value is double) {
            consumer.setHeight(value);
          }
        },
        0.0,
      ),
    );
  }
}
