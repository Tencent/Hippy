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

// @dart=2.9
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:voltron_renderer/voltron_renderer.dart';
import './util/render_context.dart';
import './util/render_op_util.dart';

const _testBgUrl =
    "https://en.wikipedia.org/wiki/Hello_Kitty#/media/File:Hello_kitty_character_portrait.png";

void main() {
  RenderContext renderContext;
  RenderOperatorRunner renderOpRunner;
  RootWidgetViewModel rootWidgetViewModel;

  RenderOpUtil renderOpUtil;
  setUp(() {
    WidgetsFlutterBinding.ensureInitialized();
    renderContext = getRenderContext();
    renderOpRunner = RenderOperatorRunner();
    renderOpRunner.bindRenderContext(renderContext);
    rootWidgetViewModel = RootWidgetViewModel(1);
    renderContext.rootViewModelMap[rootWidgetViewModel.id] = rootWidgetViewModel;
    renderOpUtil = RenderOpUtil(
      rootWidgetViewModel: rootWidgetViewModel,
      renderOpRunner: renderOpRunner,
      renderContext: renderContext,
    );
    renderOpUtil.init();
  });

  group('RenderViewModel:', () {
    group('[display]', () {
      test('== "flex"', () {
        var op = RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
          "index": 1,
          "name": "View",
          "pid": 0,
          "props": {
            "attributes": {"class": "item", "id": 0}
          },
          "styles": {"display": "flex"}
        });
        var vm = renderOpUtil.getViewModelFromRenderOp(op);

        expect(vm.display, 'flex');
      });
      test('== "none"', () {
        var vm = renderOpUtil.getViewModelFromStyles({"display": "none"});

        expect(vm.display, 'none');
        expect(vm.isShow, isFalse);
      });
    });

    group('[overflow]', () {
      test('== "visible"', () {
        var vm = renderOpUtil.getViewModelFromStyles({"overflow": "visible"});
        expect(vm.overflow, 'visible');
      });

      test('== "hidden"', () {
        var vm = renderOpUtil.getViewModelFromStyles({"overflow": "hidden"});
        expect(vm.overflow, 'hidden');
      });
    });

    group('[transform]', () {
      test('use "translate"', () {
        var vm = renderOpUtil.getViewModelFromStyles({
          "transform": [
            {"translateX": 10},
            {"translateY": 20}
          ]
        });

        var helpMatrix = Matrix4.identity();
        helpMatrix.translate(10.0, 20.0);
        expect(vm.transform, equals(helpMatrix));
      });

      test('use "scale"', () {
        var vm = renderOpUtil.getViewModelFromStyles({
          "transform": [
            {"scale": 2.5},
          ]
        });

        var helpMatrix = Matrix4.identity();
        helpMatrix.scale(2.5, 2.5, 1);
        expect(vm.transform, equals(helpMatrix));
      });
    });

    group('[transform-origin]', () {
      //
    }, skip: 'TODO: add tests.');

    group('[accessibilityLabel]', () {
      //
    }, skip: 'TODO: add tests.');

    group('[background-color]', () {
      test('default null', () {
        var vm = renderOpUtil.getViewModelFromStyles({
          "width": 20.0,
          "height": 30.0,
        });
        expect(vm.backgroundColor, isNull);
      });

      test('== ARGB(100, 255, 200, 0)', () {
        var vm = renderOpUtil.getViewModelFromStyles({
          "width": 20.0,
          "height": 30.0,
          "backgroundColor": const Color.fromARGB(100, 255, 200, 0).value
        });
        expect(vm.backgroundColor, equals(const Color.fromARGB(100, 255, 200, 0)));
      });
    });

    group('[background-image]', () {
      test('use URL', () {
        const url = _testBgUrl;
        var vm = renderOpUtil
            .getViewModelFromStyles({"width": 20.0, "height": 30.0, "backgroundImage": url});
        expect(vm.backgroundImage, url);
      });

      test('use linearGradient', () {
        var node = renderOpUtil.getNodeFromStyles({
          "width": 20.0,
          "height": 30.0,
          "linearGradient": {
            "angle": "180",
            "colorStopList": [
              {"color": Colors.green.value},
              {"color": Colors.deepOrange.value}
            ]
          }
        });

        var vm = node.viewModel;
        var gradientData = vm.linearGradient;
        expect(gradientData.get('angle'), '180');

        // 属性需要在update layout之后才能拿到gradient
        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.updateLayout, nodeId: node.id, props: {
            "layout_nodes": [
              [node.id, 0.0, 0.0, 20.0, 30.0], // id,left,top,width,height
            ],
          }),
        ]);

        var decoration = vm.getDecoration() as BoxDecoration;
        var gradient = decoration.gradient;
        expect(gradient, isNotNull, reason: 'decoration has gradient');
        expect(
            gradient.colors, equals([Color(Colors.green.value), Color(Colors.deepOrange.value)]));
      });
    });

    group('[background-size]', () {
      const url = _testBgUrl;
      test('== "cover"', () {
        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
            "index": 1,
            "name": "View",
            "pid": 0,
            "styles": {"backgroundSize": "cover", "backgroundImage": url}
          }),
          RenderOp(type: RenderOpType.updateLayout, nodeId: 1, props: {
            "layout_nodes": [
              [1, 0.0, 0.0, 20.0, 30.0], // id,left,top,width,height
            ],
          }),
        ]);
        var vm = rootWidgetViewModel.renderTree?.getRenderNode(1)?.viewModel;

        expect(vm.backgroundImgSize, "cover");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImage = decoration.image;
        expect(decorationImage.fit, equals(BoxFit.cover));
      });

      test('== "contain"', () {
        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
            "index": 1,
            "name": "View",
            "pid": 0,
            "styles": {"backgroundSize": "contain", "backgroundImage": url}
          }),
          RenderOp(type: RenderOpType.updateLayout, nodeId: 1, props: {
            "layout_nodes": [
              [1, 0.0, 0.0, 20.0, 30.0], // id,left,top,width,height
            ],
          }),
        ]);
        var vm = rootWidgetViewModel.renderTree?.getRenderNode(1)?.viewModel;

        expect(vm.backgroundImgSize, "contain");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImage = decoration.image;
        expect(decorationImage.fit, equals(BoxFit.contain));
      });

      test('== "auto"', () {
        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
            "index": 1,
            "name": "View",
            "pid": 0,
            "styles": {"backgroundSize": "auto", "backgroundImage": url}
          }),
          RenderOp(type: RenderOpType.updateLayout, nodeId: 1, props: {
            "layout_nodes": [
              [1, 0.0, 0.0, 20.0, 30.0], // id,left,top,width,height
            ],
          }),
        ]);
        var vm = rootWidgetViewModel.renderTree?.getRenderNode(1)?.viewModel;

        expect(vm.backgroundImgSize, "auto");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImage = decoration.image;
        expect(decorationImage.fit, equals(BoxFit.none));
      });

      test('== "fit"', () {
        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
            "index": 1,
            "name": "View",
            "pid": 0,
            "styles": {"backgroundSize": "fit", "backgroundImage": url}
          }),
          RenderOp(type: RenderOpType.updateLayout, nodeId: 1, props: {
            "layout_nodes": [
              [1, 0.0, 0.0, 20.0, 30.0], // id,left,top,width,height
            ],
          }),
        ]);
        var vm = rootWidgetViewModel.renderTree?.getRenderNode(1)?.viewModel;

        expect(vm.backgroundImgSize, "fit");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImage = decoration.image;
        expect(decorationImage.fit, equals(BoxFit.fill));
      });

      test('default "auto"', () {
        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
            "index": 1,
            "name": "View",
            "pid": 0,
            "styles": {"backgroundImage": url}
          }),
          RenderOp(type: RenderOpType.updateLayout, nodeId: 1, props: {
            "layout_nodes": [
              [1, 0.0, 0.0, 20.0, 30.0], // id,left,top,width,height
            ],
          }),
        ]);
        var vm = rootWidgetViewModel.renderTree?.getRenderNode(1)?.viewModel;

        expect(vm.backgroundImgSize, "auto");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImage = decoration.image;
        expect(decorationImage.fit, equals(BoxFit.none));
      });
    });

    group('[background-repeat]', () {
      const url = _testBgUrl;

      test('== "no-repeat"', () {
        var vm = renderOpUtil
            .getViewModelFromStyles({"backgroundImage": url, "backgroundRepeat": "no-repeat"});
        expect(vm.backgroundImgRepeat, "no-repeat");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImage = decoration.image;
        expect(decorationImage.repeat, equals(ImageRepeat.noRepeat));
      });

      test('== "repeat"', () {
        var vm = renderOpUtil
            .getViewModelFromStyles({"backgroundImage": url, "backgroundRepeat": "repeat"});
        expect(vm.backgroundImgRepeat, "repeat");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImage = decoration.image;
        expect(decorationImage.repeat, equals(ImageRepeat.repeat));
      });

      test('== "repeat-x"', () {
        var vm = renderOpUtil
            .getViewModelFromStyles({"backgroundImage": url, "backgroundRepeat": "repeat-x"});
        expect(vm.backgroundImgRepeat, "repeat-x");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImage = decoration.image;
        expect(decorationImage.repeat, equals(ImageRepeat.repeatX));
      });

      test('== "repeat-y"', () {
        var vm = renderOpUtil
            .getViewModelFromStyles({"backgroundImage": url, "backgroundRepeat": "repeat-y"});
        expect(vm.backgroundImgRepeat, "repeat-y");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImage = decoration.image;
        expect(decorationImage.repeat, equals(ImageRepeat.repeatY));
      });

      test('default repeat', () {
        var vm = renderOpUtil.getViewModelFromStyles({
          "backgroundImage": url,
        });
        expect(vm.backgroundImgRepeat, "");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImage = decoration.image;
        expect(decorationImage.repeat, equals(ImageRepeat.repeat));
      });
    });

    group('[background-positon]', () {}, skip: 'This API is not complated');

    group('[background-positon-x]', () {
      const url = _testBgUrl;
      test('== "left"', () {
        var vm = renderOpUtil
            .getViewModelFromStyles({"backgroundImage": url, "backgroundPositionX": "left"});
        expect(vm.backgroundPositionX, "left");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImageAlignment = decoration.image.alignment as Alignment;
        expect(decorationImageAlignment.x, -1.0);
      });

      test('== "center"', () {
        var vm = renderOpUtil
            .getViewModelFromStyles({"backgroundImage": url, "backgroundPositionX": "center"});
        expect(vm.backgroundPositionX, "center");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImageAlignment = decoration.image.alignment as Alignment;
        expect(decorationImageAlignment.x, 0.0);
      });

      test('== "right"', () {
        var vm = renderOpUtil
            .getViewModelFromStyles({"backgroundImage": url, "backgroundPositionX": "right"});
        expect(vm.backgroundPositionX, "right");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImageAlignment = decoration.image.alignment as Alignment;
        expect(decorationImageAlignment.x, 1.0);
      });

      test('default "left"', () {
        var vm = renderOpUtil.getViewModelFromStyles({"backgroundImage": url});
        expect(vm.backgroundPositionX, "");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImageAlignment = decoration.image.alignment as Alignment;
        expect(decorationImageAlignment.x, -1.0);
      });
    });

    group('[background-positon-y]', () {
      const url = _testBgUrl;
      test('== "top"', () {
        var vm = renderOpUtil
            .getViewModelFromStyles({"backgroundImage": url, "backgroundPositionY": "top"});
        expect(vm.backgroundPositionY, "top");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImageAlignment = decoration.image.alignment as Alignment;
        expect(decorationImageAlignment.y, -1.0);
      });

      test('== "center"', () {
        var vm = renderOpUtil
            .getViewModelFromStyles({"backgroundImage": url, "backgroundPositionY": "center"});
        expect(vm.backgroundPositionY, "center");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImageAlignment = decoration.image.alignment as Alignment;
        expect(decorationImageAlignment.y, 0.0);
      });

      test('== "bottom"', () {
        var vm = renderOpUtil
            .getViewModelFromStyles({"backgroundImage": url, "backgroundPositionY": "bottom"});
        expect(vm.backgroundPositionY, "bottom");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImageAlignment = decoration.image.alignment as Alignment;
        expect(decorationImageAlignment.y, 1.0);
      });

      test('default "bottom"', () {
        var vm = renderOpUtil.getViewModelFromStyles({"backgroundImage": url});
        expect(vm.backgroundPositionY, "");
        var decoration = vm.getDecoration() as BoxDecoration;
        var decorationImageAlignment = decoration.image.alignment as Alignment;
        expect(decorationImageAlignment.y, -1.0);
      });
    });

    group('[opacity]', () {
      test('== 1.0', () {
        var vm = renderOpUtil.getViewModelFromStyles({"opacity": 1.0});
        expect(vm.opacity, 1.0);
      });
      test('== 0.5', () {
        var vm = renderOpUtil.getViewModelFromStyles({"opacity": 0.5});
        expect(vm.opacity, 0.5);
      });
    });

    group('border-radius', () {
      group('[border-radius]', () {
        test('== 12', () {
          var vm = renderOpUtil.getViewModelFromStyles({"borderRadius": 12.0});
          expect(vm.borderRadius, 12.0);
          var borderRadius = vm.getBorderRadius();
          expect(borderRadius.bottomLeft, const Radius.circular(12.0));
          expect(borderRadius.bottomRight, const Radius.circular(12.0));
          expect(borderRadius.topLeft, const Radius.circular(12.0));
          expect(borderRadius.topRight, const Radius.circular(12.0));
        });
      });

      group('[border-top-right-radius]', () {
        test('== 10', () {
          var vm = renderOpUtil.getViewModelFromStyles({"borderTopRightRadius": 10.0});
          expect(vm.topRightBorderRadius, 10.0);
          var borderRadius = vm.getBorderRadius();
          expect(borderRadius.bottomLeft, Radius.zero);
          expect(borderRadius.bottomRight, Radius.zero);
          expect(borderRadius.topLeft, Radius.zero);
          expect(borderRadius.topRight, const Radius.circular(10.0));
        });
      });

      group('[border-bottom-right-radius]', () {
        test('== 10', () {
          var vm = renderOpUtil.getViewModelFromStyles({"borderBottomRightRadius": 10.0});
          expect(vm.bottomRightBorderRadius, 10.0);
          var borderRadius = vm.getBorderRadius();
          expect(borderRadius.bottomLeft, Radius.zero);
          expect(borderRadius.bottomRight, const Radius.circular(10.0));
          expect(borderRadius.topLeft, Radius.zero);
          expect(borderRadius.topRight, Radius.zero);
        });
      });

      group('[border-top-left-radius]', () {
        test('== 10', () {
          var vm = renderOpUtil.getViewModelFromStyles({"borderTopLeftRadius": 10.0});
          expect(vm.topLeftBorderRadius, 10.0);
          var borderRadius = vm.getBorderRadius();
          expect(borderRadius.bottomLeft, Radius.zero);
          expect(borderRadius.bottomRight, Radius.zero);
          expect(borderRadius.topLeft, const Radius.circular(10.0));
          expect(borderRadius.topRight, Radius.zero);
        });
      });

      group('[border-bottom-left-radius]', () {
        test('== 10', () {
          var vm = renderOpUtil.getViewModelFromStyles({"borderBottomLeftRadius": 10.0});
          expect(vm.bottomLeftBorderRadius, 10.0);
          var borderRadius = vm.getBorderRadius();
          expect(borderRadius.bottomLeft, const Radius.circular(10.0));
          expect(borderRadius.bottomRight, Radius.zero);
          expect(borderRadius.topLeft, Radius.zero);
          expect(borderRadius.topRight, Radius.zero);
        });
      });

      group('left/top/right/bottom', () {
        test('== [11, 12, 13, 14]', () {
          var vm = renderOpUtil.getViewModelFromStyles({
            "borderTopLeftRadius": 11.0,
            "borderTopRightRadius": 12.0,
            "borderBottomRightRadius": 13.0,
            "borderBottomLeftRadius": 14.0,
          });
          expect(vm.topLeftBorderRadius, 11.0);
          expect(vm.topRightBorderRadius, 12.0);
          expect(vm.bottomRightBorderRadius, 13.0);
          expect(vm.bottomLeftBorderRadius, 14.0);
          var borderRadius = vm.getBorderRadius();
          expect(borderRadius.topLeft, const Radius.circular(11.0));
          expect(borderRadius.topRight, const Radius.circular(12.0));
          expect(borderRadius.bottomRight, const Radius.circular(13.0));
          expect(borderRadius.bottomLeft, const Radius.circular(14.0));
        });
      });
    });

    group('border-width', () {
      test('[border-width] == 5', () {
        var vm = renderOpUtil.getViewModelFromStyles({"borderWidth": 5.0});
        expect(vm.borderWidth, 5.0);
        var border = vm.getBorder();
        expect(border.left.width, 5.0);
        expect(border.top.width, 5.0);
        expect(border.right.width, 5.0);
        expect(border.bottom.width, 5.0);
      });

      test('[border-left/top/right/bottom-width] == [5,6,7,8]', () {
        var vm = renderOpUtil.getViewModelFromStyles({
          "borderLeftWidth": 5.0,
          "borderTopWidth": 6.0,
          "borderRightWidth": 7.0,
          "borderBottomWidth": 8.0,
        });
        expect(vm.borderLeftWidth, 5.0);
        expect(vm.borderTopWidth, 6.0);
        expect(vm.borderRightWidth, 7.0);
        expect(vm.borderBottomWidth, 8.0);

        var border = vm.getBorder();
        expect(border.left.width, 5.0);
        expect(border.top.width, 6.0);
        expect(border.right.width, 7.0);
        expect(border.bottom.width, 8.0);
      });
    });

    group('border-color', () {
      test('[border-color] == pink', () {
        var vm = renderOpUtil
            .getViewModelFromStyles({"borderColor": Colors.pink.value, "borderWidth": 1.0});
        expect(vm.borderColor, Colors.pink.value);
        var border = vm.getBorder();
        expect(border.left.color, Colors.pink.shade500);
        expect(border.top.color, Colors.pink.shade500);
        expect(border.right.color, Colors.pink.shade500);
        expect(border.bottom.color, Colors.pink.shade500);
      });

      test('[border-left/top/right/bottom-color] == [yellow,blue,red,pink]', () {
        var vm = renderOpUtil.getViewModelFromStyles({
          "borderLeftColor": Colors.yellow.value,
          "borderTopColor": Colors.blue.value,
          "borderRightColor": Colors.red.value,
          "borderBottomColor": Colors.pink.value,
          "borderWidth": 1.0,
        });
        expect(vm.borderLeftColor, Colors.yellow.value);
        expect(vm.borderTopColor, Colors.blue.value);
        expect(vm.borderRightColor, Colors.red.value);
        expect(vm.borderBottomColor, Colors.pink.value);

        var border = vm.getBorder();
        expect(border.left.color, Colors.yellow.shade500);
        expect(border.top.color, Colors.blue.shade500);
        expect(border.right.color, Colors.red.shade500);
        expect(border.bottom.color, Colors.pink.shade500);
      });
    });

    group('[border-style]', () {
      test('== "solid"', () {
        var vm = renderOpUtil.getViewModelFromStyles({"borderStyle": "solid", "borderWidth": 1.0});
        expect(vm.borderStyle, "solid");
        var border = vm.getBorder();
        expect(border.left.style, BorderStyle.solid);
        expect(border.top.style, BorderStyle.solid);
        expect(border.right.style, BorderStyle.solid);
        expect(border.bottom.style, BorderStyle.solid);
      });
    });

    group('box-shadow', () {
      group('[box-shadow]', () {
        test('== "2px 3px 2px 1px rgba(0, 0, 0, 0.2)"', () {
          /* x偏移量 | y偏移量 | 阴影模糊半径 | 阴影扩散半径 | 阴影颜色 */
          var vm = renderOpUtil.getViewModelFromStyles({
            "boxShadow": [
              {
                "color": const Color.fromARGB(51, 0, 0, 0).value,
                "blurRadius": 2,
                "spreadRadius": 1,
                "offset": {"x": 2, "y": 3}
              }
            ]
          });
          expect(vm.boxShadow, isNotNull);
          var decoration = vm.getDecoration() as BoxDecoration;
          var boxShadows = decoration.boxShadow;
          expect(boxShadows, hasLength(1));
          expect(
              boxShadows[0],
              equals(const BoxShadow(
                color: Color.fromARGB(51, 0, 0, 0),
                offset: Offset(2.0, 3.0),
                blurRadius: 2.0,
                spreadRadius: 1.0,
              )));
        });
      });

      group(
          '[shadowOffsetX][shadowOffsetY][shadowOpacity][shadowRadius][shadowSpread][shadowColor]',
          () {
        test(('== "2px 3px 2px 1px rgba(0, 0, 0, 0.2)"'), () {
          var vm = renderOpUtil.getViewModelFromStyles({
            "shadowOffsetX": 2,
            "shadowOffsetY": 3,
            "shadowOpacity": 0.2,
            "shadowRadius": 2,
            "shadowSpread": 1,
            "shadowColor": const Color.fromARGB(51, 0, 0, 0).value,
          });

          expect(vm.shadowOffsetX, 2);
          expect(vm.shadowOffsetY, 3);
          expect(vm.shadowOpacity, 0.2);
          expect(vm.shadowRadius, 2);
          expect(vm.shadowSpread, 1);
          expect(vm.shadowColor, const Color.fromARGB(51, 0, 0, 0).value);

          var decoration = vm.getDecoration() as BoxDecoration;
          var boxShadows = decoration.boxShadow;
          expect(boxShadows, hasLength(1));
          expect(
              boxShadows[0],
              equals(const BoxShadow(
                color: Color.fromARGB(51, 0, 0, 0),
                offset: Offset(2.0, 3.0),
                blurRadius: 2.0,
                spreadRadius: 1.0,
              )));
        });
      });
    });

    group('copy()', () {
      const url = _testBgUrl;
      var op = RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
        "index": 1,
        "name": "View",
        "pid": 0,
        "props": {
          "attributes": {"class": "item", "id": 0}
        },
        "styles": {
          "display": "flex",
          "overflow": "visible",
          "backgroundImage": url,
          "backgroundPositionY": "top",
        }
      });
      test('should equal the origin', () {
        var vm = renderOpUtil.getViewModelFromRenderOp(op);
        var newVm = RenderViewModel.copy(1, 1, 'View', renderContext, vm);
        expect(newVm, isA<RenderViewModel>());
        expect(vm, equals(newVm));
      });

      test('should not equal the origin after change backgroundPositionY', () {
        var vm = renderOpUtil.getViewModelFromRenderOp(op);
        var newVm = RenderViewModel.copy(1, 1, 'View', renderContext, vm);
        newVm.backgroundPositionY = 'bottom';
        expect(newVm, isA<RenderViewModel>());
        expect(vm, isNot(equals(newVm)));
      });
    });
  });
}
