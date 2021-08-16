// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.PerformanceTestRunner = self.PerformanceTestRunner || {};

PerformanceTestRunner.timelineData = function() {
  return JSON.stringify([
    {
      'args': {'number': 32},

      'cat': '__metadata',
      'name': 'num_cpus',
      'ph': 'M',
      'pid': 3840,
      'tid': 0,
      'ts': 0
    },
    {
      'args': {'sort_index': -5},

      'cat': '__metadata',
      'name': 'process_sort_index',
      'ph': 'M',
      'pid': 3840,
      'tid': 12,
      'ts': 0
    },
    {
      'args': {'name': 'Renderer'},

      'cat': '__metadata',
      'name': 'process_name',
      'ph': 'M',
      'pid': 3840,
      'tid': 12,
      'ts': 0
    },
    {
      'args': {'sort_index': -1},

      'cat': '__metadata',
      'name': 'thread_sort_index',
      'ph': 'M',
      'pid': 3840,
      'tid': 11,
      'ts': 0
    },
    {
      'args': {'data': {'sessionId': '9.4', 'frames': [{'frame': 'frame1', 'url': 'frameurl', 'name': 'frame-name'}]}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'TracingStartedInPage',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673092068,
      'tts': 170409
    },
    {
      'args': {'data': {'layerTreeId': 17, 'frame': 'frame-unknown'}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'SetLayerTreeId',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673092082,
      'tts': 170421
    },
    {
      'args': {'data': {'layerTreeId': 1, 'frame': 'frame1'}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'SetLayerTreeId',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673092083,
      'tts': 170421
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673092095,
      'tts': 170434
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673107791,
      'tts': 170482
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673107799,
      'tts': 170490
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 438}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 65,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 64,
      'tid': 9,
      'ts': 1122673107821,
      'tts': 170511
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 27,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 26,
      'tid': 9,
      'ts': 1122673107849,
      'tts': 170539
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 439}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673107869,
      'tts': 170559
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2688936, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673107883,
      'tts': 170573
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673107891,
      'tts': 170581
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673107921,
      'tts': 170612
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673107934,
      'tts': 170624
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673107941,
      'tts': 170631
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673126470,
      'tts': 170708
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673126480,
      'tts': 170717
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 439}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 108,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 107,
      'tid': 9,
      'ts': 1122673126522,
      'tts': 170759
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 47,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 46,
      'tid': 9,
      'ts': 1122673126569,
      'tts': 170806
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 440}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673126606,
      'tts': 170843
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2688952, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673126627,
      'tts': 170864
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673126637,
      'tts': 170874
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673126683,
      'tts': 170920
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673126699,
      'tts': 170936
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673126708,
      'tts': 170944
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673141177,
      'tts': 171002
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673141186,
      'tts': 171010
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 440}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 110,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 109,
      'tid': 9,
      'ts': 1122673141212,
      'tts': 171036
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 46,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 43,
      'tid': 9,
      'ts': 1122673141259,
      'tts': 171084
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 441}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673141293,
      'tts': 171117
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2688968, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673141318,
      'tts': 171142
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673141329,
      'tts': 171154
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673141379,
      'tts': 171204
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673141406,
      'tts': 171231
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673141421,
      'tts': 171246
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673162929,
      'tts': 171304
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673162938,
      'tts': 171313
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 441}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 98,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 97,
      'tid': 9,
      'ts': 1122673162975,
      'tts': 171350
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 41,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 39,
      'tid': 9,
      'ts': 1122673163020,
      'tts': 171395
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 442}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673163051,
      'tts': 171426
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2688984, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673163070,
      'tts': 171445
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673163081,
      'tts': 171455
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673163119,
      'tts': 171493
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673163133,
      'tts': 171508
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673163141,
      'tts': 171516
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673179592,
      'tts': 171569
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673179600,
      'tts': 171576
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 442}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 77,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 76,
      'tid': 9,
      'ts': 1122673179625,
      'tts': 171601
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 31,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 31,
      'tid': 9,
      'ts': 1122673179660,
      'tts': 171635
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 443}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673179683,
      'tts': 171659
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689000, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673179699,
      'tts': 171675
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673179707,
      'tts': 171682
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673179736,
      'tts': 171711
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673179751,
      'tts': 171727
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673179759,
      'tts': 171735
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673196258,
      'tts': 171788
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673196265,
      'tts': 171794
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 443}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 73,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 72,
      'tid': 9,
      'ts': 1122673196291,
      'tts': 171820
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 30,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 29,
      'tid': 9,
      'ts': 1122673196323,
      'tts': 171852
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 444}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673196346,
      'tts': 171875
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689016, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673196361,
      'tts': 171890
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673196370,
      'tts': 171899
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673196402,
      'tts': 171931
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673196417,
      'tts': 171946
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673196425,
      'tts': 171954
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673213043,
      'tts': 172016
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122673107747,
      'tts': 77989
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122673107777,
      'tts': 78018
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122673126358,
      'tts': 78708
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122673126413,
      'tts': 78760
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122673141111,
      'tts': 78880
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122673141133,
      'tts': 78902
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122673162867,
      'tts': 79126
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122673162886,
      'tts': 79145
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122673179534,
      'tts': 79253
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122673179551,
      'tts': 79269
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673313423,
      'tts': 174171
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673313452,
      'tts': 174200
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673313467,
      'tts': 174215
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673329958,
      'tts': 174302
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673329971,
      'tts': 174314
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 451}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 98,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 96,
      'tid': 9,
      'ts': 1122673330000,
      'tts': 174343
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 44,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 41,
      'tid': 9,
      'ts': 1122673330035,
      'tts': 174379
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 452}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673330066,
      'tts': 174409
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689144, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673330092,
      'tts': 174435
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673330106,
      'tts': 174450
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673330151,
      'tts': 174495
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673330180,
      'tts': 174523
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673330194,
      'tts': 174538
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673346680,
      'tts': 174624
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673346692,
      'tts': 174635
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 452}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 98,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 96,
      'tid': 9,
      'ts': 1122673346721,
      'tts': 174664
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 43,
      'tid': 9,
      'ts': 1122673346756,
      'tts': 174699
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 453}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673346787,
      'tts': 174730
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689160, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673346813,
      'tts': 174756
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673346827,
      'tts': 174770
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673346871,
      'tts': 174814
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673346900,
      'tts': 174843
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673346914,
      'tts': 174857
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673363348,
      'tts': 174943
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673363361,
      'tts': 174954
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 453}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 98,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 95,
      'tid': 9,
      'ts': 1122673363390,
      'tts': 174984
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122673363425,
      'tts': 175019
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 454}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673363456,
      'tts': 175050
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689176, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673363482,
      'tts': 175075
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673363496,
      'tts': 175090
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673363540,
      'tts': 175134
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673363569,
      'tts': 175163
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673363584,
      'tts': 175177
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673380043,
      'tts': 175286
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673380057,
      'tts': 175299
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 454}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 99,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 97,
      'tid': 9,
      'ts': 1122673380086,
      'tts': 175328
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122673380122,
      'tts': 175364
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 455}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673380153,
      'tts': 175396
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689192, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673380179,
      'tts': 175421
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673380194,
      'tts': 175436
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673380238,
      'tts': 175480
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673380266,
      'tts': 175508
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673380281,
      'tts': 175523
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673396686,
      'tts': 175611
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673396699,
      'tts': 175622
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 455}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 99,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 96,
      'tid': 9,
      'ts': 1122673396735,
      'tts': 175659
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 44,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122673396771,
      'tts': 175694
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 456}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673396802,
      'tts': 175725
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689208, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673396828,
      'tts': 175751
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673396842,
      'tts': 175765
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673396886,
      'tts': 175810
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673396915,
      'tts': 175838
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673396930,
      'tts': 175853
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673413345,
      'tts': 175940
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673413358,
      'tts': 175952
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674113927,
      'tts': 89784
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674113950,
      'tts': 89806
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674130606,
      'tts': 89979
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674130629,
      'tts': 90001
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674147273,
      'tts': 90157
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674147296,
      'tts': 90179
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674163929,
      'tts': 90337
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674163951,
      'tts': 90358
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673747387,
      'tts': 182445
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 476}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 100,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 97,
      'tid': 9,
      'ts': 1122673747439,
      'tts': 182498
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122673747475,
      'tts': 182534
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 477}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673747507,
      'tts': 182565
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689544, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673747532,
      'tts': 182591
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673747547,
      'tts': 182605
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673747592,
      'tts': 182650
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673747621,
      'tts': 182680
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673747636,
      'tts': 182694
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673764047,
      'tts': 182781
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673764060,
      'tts': 182792
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 477}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 99,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 97,
      'tid': 9,
      'ts': 1122673764089,
      'tts': 182821
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122673764125,
      'tts': 182858
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 478}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673764156,
      'tts': 182889
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689560, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673764182,
      'tts': 182914
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673764196,
      'tts': 182929
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673764241,
      'tts': 182973
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673764268,
      'tts': 183001
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673764283,
      'tts': 183015
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673780702,
      'tts': 183103
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673780715,
      'tts': 183114
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 478}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 106,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 104,
      'tid': 9,
      'ts': 1122673780744,
      'tts': 183143
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 44,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122673780787,
      'tts': 183186
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 479}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673780818,
      'tts': 183217
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689576, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673780844,
      'tts': 183243
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673780858,
      'tts': 183257
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673780902,
      'tts': 183302
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673780932,
      'tts': 183331
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673780946,
      'tts': 183346
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673797374,
      'tts': 183434
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673797387,
      'tts': 183445
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 479}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 106,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 104,
      'tid': 9,
      'ts': 1122673797416,
      'tts': 183475
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122673797458,
      'tts': 183517
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 480}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673797489,
      'tts': 183548
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689592, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673797516,
      'tts': 183575
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673797530,
      'tts': 183589
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673797575,
      'tts': 183633
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673797604,
      'tts': 183662
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673797618,
      'tts': 183677
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673814044,
      'tts': 183764
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673814056,
      'tts': 183776
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 480}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 98,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 96,
      'tid': 9,
      'ts': 1122673814086,
      'tts': 183805
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 43,
      'tid': 9,
      'ts': 1122673814121,
      'tts': 183840
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 481}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673814153,
      'tts': 183872
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689608, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673814178,
      'tts': 183897
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673814193,
      'tts': 183912
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673814237,
      'tts': 183956
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673814265,
      'tts': 183985
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673814280,
      'tts': 183999
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673830696,
      'tts': 184086
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673830709,
      'tts': 184097
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 481}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 99,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 97,
      'tid': 9,
      'ts': 1122673830738,
      'tts': 184126
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122673830774,
      'tts': 184163
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 482}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673830806,
      'tts': 184194
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689624, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673830831,
      'tts': 184219
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673830846,
      'tts': 184234
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673830890,
      'tts': 184278
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673830917,
      'tts': 184305
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673830932,
      'tts': 184320
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122673847325,
      'tts': 184405
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122673847337,
      'tts': 184417
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674030729,
      'tts': 188070
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 493}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 98,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 96,
      'tid': 9,
      'ts': 1122674030758,
      'tts': 188099
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 44,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122674030794,
      'tts': 188135
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 494}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674030825,
      'tts': 188166
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689816, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674030850,
      'tts': 188191
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674030864,
      'tts': 188205
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674030908,
      'tts': 188249
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674030937,
      'tts': 188278
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674030951,
      'tts': 188292
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674047345,
      'tts': 188381
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674047358,
      'tts': 188393
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 494}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 98,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 96,
      'tid': 9,
      'ts': 1122674047387,
      'tts': 188422
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 43,
      'tid': 9,
      'ts': 1122674047422,
      'tts': 188457
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 495}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674047453,
      'tts': 188489
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689832, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674047479,
      'tts': 188514
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674047493,
      'tts': 188528
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674047538,
      'tts': 188573
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674047566,
      'tts': 188601
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674047580,
      'tts': 188615
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674064041,
      'tts': 188723
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674064054,
      'tts': 188735
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 495}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 114,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 112,
      'tid': 9,
      'ts': 1122674064084,
      'tts': 188765
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 60,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 57,
      'tid': 9,
      'ts': 1122674064120,
      'tts': 188801
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 496}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674064166,
      'tts': 188847
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689848, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674064192,
      'tts': 188873
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674064207,
      'tts': 188888
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674064252,
      'tts': 188933
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674064279,
      'tts': 188960
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674064293,
      'tts': 188974
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674080701,
      'tts': 189063
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674080714,
      'tts': 189075
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 496}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 112,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 110,
      'tid': 9,
      'ts': 1122674080743,
      'tts': 189104
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 46,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 44,
      'tid': 9,
      'ts': 1122674080791,
      'tts': 189152
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 497}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674080823,
      'tts': 189185
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689864, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674080849,
      'tts': 189210
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674080864,
      'tts': 189225
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674080908,
      'tts': 189269
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674080936,
      'tts': 189297
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674080950,
      'tts': 189312
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674097365,
      'tts': 189401
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674097378,
      'tts': 189412
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 497}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 97,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 95,
      'tid': 9,
      'ts': 1122674097407,
      'tts': 189441
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 43,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122674097443,
      'tts': 189477
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 498}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674097473,
      'tts': 189507
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689880, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674097498,
      'tts': 189532
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674097513,
      'tts': 189547
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674097556,
      'tts': 189591
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674097585,
      'tts': 189619
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674097599,
      'tts': 189634
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674114019,
      'tts': 189724
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674114032,
      'tts': 189735
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 498}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 97,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 95,
      'tid': 9,
      'ts': 1122674114061,
      'tts': 189765
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122674114096,
      'tts': 189800
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 499}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674114127,
      'tts': 189830
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689896, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674114153,
      'tts': 189856
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674114167,
      'tts': 189870
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674114211,
      'tts': 189914
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674114239,
      'tts': 189942
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674114253,
      'tts': 189957
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674130694,
      'tts': 190042
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674130707,
      'tts': 190054
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 499}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 98,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 95,
      'tid': 9,
      'ts': 1122674130736,
      'tts': 190084
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 44,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122674130772,
      'tts': 190119
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 500}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674130802,
      'tts': 190150
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689912, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674130828,
      'tts': 190175
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674130842,
      'tts': 190189
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674130887,
      'tts': 190234
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674130914,
      'tts': 190262
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674130929,
      'tts': 190276
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674147364,
      'tts': 190365
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674147377,
      'tts': 190376
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 500}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 111,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 109,
      'tid': 9,
      'ts': 1122674147406,
      'tts': 190406
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 47,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 44,
      'tid': 9,
      'ts': 1122674147452,
      'tts': 190453
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 501}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674147486,
      'tts': 190486
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689928, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674147511,
      'tts': 190511
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674147526,
      'tts': 190526
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674147570,
      'tts': 190570
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674147598,
      'tts': 190598
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674147613,
      'tts': 190613
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674164055,
      'tts': 190720
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674164068,
      'tts': 190732
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 501}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 113,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 111,
      'tid': 9,
      'ts': 1122674164097,
      'tts': 190761
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 46,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 44,
      'tid': 9,
      'ts': 1122674164146,
      'tts': 190810
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 502}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674164178,
      'tts': 190842
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689944, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674164204,
      'tts': 190868
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674164219,
      'tts': 190883
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674164263,
      'tts': 190927
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674164312,
      'tts': 190976
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674164327,
      'tts': 190991
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674180694,
      'tts': 191071
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674180707,
      'tts': 191083
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 502}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 111,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 109,
      'tid': 9,
      'ts': 1122674180736,
      'tts': 191112
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 46,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 43,
      'tid': 9,
      'ts': 1122674180783,
      'tts': 191160
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 503}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674180816,
      'tts': 191192
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689960, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674180841,
      'tts': 191217
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674180855,
      'tts': 191232
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674180899,
      'tts': 191276
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674180928,
      'tts': 191305
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674180943,
      'tts': 191319
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674197354,
      'tts': 191407
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674197367,
      'tts': 191418
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 503}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 98,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 96,
      'tid': 9,
      'ts': 1122674197396,
      'tts': 191447
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122674197431,
      'tts': 191483
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 504}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674197462,
      'tts': 191514
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689976, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674197487,
      'tts': 191539
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674197502,
      'tts': 191553
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674197546,
      'tts': 191598
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674197590,
      'tts': 191642
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674197606,
      'tts': 191657
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674214025,
      'tts': 191747
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674214038,
      'tts': 191759
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 504}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 111,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 110,
      'tid': 9,
      'ts': 1122674214067,
      'tts': 191788
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 43,
      'tid': 9,
      'ts': 1122674214115,
      'tts': 191836
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 505}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674214147,
      'tts': 191868
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2689992, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674214173,
      'tts': 191894
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674214187,
      'tts': 191908
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674214232,
      'tts': 191953
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674214259,
      'tts': 191981
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674214274,
      'tts': 191995
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674230673,
      'tts': 192083
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674230686,
      'tts': 192095
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 505}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 125,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 123,
      'tid': 9,
      'ts': 1122674230716,
      'tts': 192124
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 48,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 46,
      'tid': 9,
      'ts': 1122674230775,
      'tts': 192183
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 506}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674230809,
      'tts': 192217
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2690008, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674230835,
      'tts': 192243
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674230849,
      'tts': 192258
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674230894,
      'tts': 192303
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674230924,
      'tts': 192332
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674230938,
      'tts': 192347
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674247362,
      'tts': 192436
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674247374,
      'tts': 192447
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 506}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 97,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 95,
      'tid': 9,
      'ts': 1122674247403,
      'tts': 192476
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 43,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 41,
      'tid': 9,
      'ts': 1122674247439,
      'tts': 192512
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 507}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674247469,
      'tts': 192543
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2690024, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674247494,
      'tts': 192567
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674247509,
      'tts': 192582
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674247553,
      'tts': 192626
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674247581,
      'tts': 192655
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674247596,
      'tts': 192669
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674264048,
      'tts': 192774
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674264062,
      'tts': 192786
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 507}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 99,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 97,
      'tid': 9,
      'ts': 1122674264091,
      'tts': 192815
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 45,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122674264127,
      'tts': 192851
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 508}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674264158,
      'tts': 192883
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2690040, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674264184,
      'tts': 192908
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674264199,
      'tts': 192923
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674264243,
      'tts': 192967
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674264272,
      'tts': 192996
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674264286,
      'tts': 193010
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674280687,
      'tts': 193099
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674180599,
      'tts': 90536
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674180634,
      'tts': 90570
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674197265,
      'tts': 90728
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674197288,
      'tts': 90750
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674213934,
      'tts': 90908
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674213956,
      'tts': 90929
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674230583,
      'tts': 91100
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674230606,
      'tts': 91122
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674247271,
      'tts': 91300
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674247293,
      'tts': 91321
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674263915,
      'tts': 91477
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674263938,
      'tts': 91499
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674280596,
      'tts': 91655
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674280619,
      'tts': 91677
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674297261,
      'tts': 91831
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674297287,
      'tts': 91856
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674313908,
      'tts': 92015
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674313930,
      'tts': 92036
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674330601,
      'tts': 92208
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674330623,
      'tts': 92230
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674347259,
      'tts': 92385
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674347281,
      'tts': 92407
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674363933,
      'tts': 92564
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674363956,
      'tts': 92586
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674380587,
      'tts': 92742
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674380610,
      'tts': 92764
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674397245,
      'tts': 92919
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674397268,
      'tts': 92940
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674413915,
      'tts': 93111
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674413938,
      'tts': 93133
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674430594,
      'tts': 93290
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674430617,
      'tts': 93312
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674447250,
      'tts': 93468
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674447273,
      'tts': 93490
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674463925,
      'tts': 93617
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674463948,
      'tts': 93639
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674480599,
      'tts': 93799
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674480621,
      'tts': 93820
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674497252,
      'tts': 93974
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674497275,
      'tts': 93996
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674513924,
      'tts': 94167
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674513946,
      'tts': 94189
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674530585,
      'tts': 94357
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674530607,
      'tts': 94379
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674547254,
      'tts': 94537
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674547276,
      'tts': 94558
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'BeginFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674563916,
      'tts': 94716
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline.frame',
      'name': 'RequestMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 't',
      'tid': 17,
      'ts': 1122674563954,
      'tts': 94753
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674514204,
      'tts': 198558
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674514232,
      'tts': 198586
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674514246,
      'tts': 198600
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674530672,
      'tts': 198686
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674530685,
      'tts': 198697
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 523}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 97,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 95,
      'tid': 9,
      'ts': 1122674530714,
      'tts': 198727
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 44,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 41,
      'tid': 9,
      'ts': 1122674530749,
      'tts': 198762
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 524}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674530780,
      'tts': 198792
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2693784, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674530805,
      'tts': 198817
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674530820,
      'tts': 198832
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674530864,
      'tts': 198876
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674530892,
      'tts': 198905
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674530907,
      'tts': 198919
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674547345,
      'tts': 199009
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674547358,
      'tts': 199020
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 524}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 98,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 95,
      'tid': 9,
      'ts': 1122674547387,
      'tts': 199050
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 44,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 41,
      'tid': 9,
      'ts': 1122674547423,
      'tts': 199086
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 525}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674547454,
      'tts': 199116
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2693800, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674547479,
      'tts': 199141
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674547493,
      'tts': 199156
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674547538,
      'tts': 199200
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674547566,
      'tts': 199229
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674547581,
      'tts': 199243
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674564053,
      'tts': 199343
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'BeginMainThreadFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674564066,
      'tts': 199355
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 525}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 99,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3834,
      'tdur': 97,
      'tid': 9,
      'ts': 1122674564096,
      'tts': 199384
    },
    {
      'args': {
        'data':
            {'frame': '0x1100e70a8000', 'scriptId': '29', 'scriptLine': 2, 'scriptName': 'http://localhost/raf.html'}
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 44,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3834,
      'tdur': 42,
      'tid': 9,
      'ts': 1122674564132,
      'tts': 199420
    },
    {
      'args': {'data': {'frame': '0x1100e70a8000', 'id': 526}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674564162,
      'tts': 199451
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 0, 'jsHeapSizeUsed': 2693816, 'nodes': 7}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674564188,
      'tts': 199477
    },
    {
      'args': {'frame': '0x1100e70a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3834,
      's': 'g',
      'tid': 9,
      'ts': 1122674564203,
      'tts': 199492
    },
    {
      'args': {'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'B',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674564248,
      'tts': 199536
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'CompositeLayers',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674564276,
      'tts': 199565
    },
    {
      'args': {},
      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Program',
      'ph': 'E',
      'pid': 3834,
      'tid': 9,
      'ts': 1122674564291,
      'tts': 199579
    },
    {
      'args': {'number': 32},

      'cat': '__metadata',
      'name': 'num_cpus',
      'ph': 'M',
      'pid': 3834,
      'tid': 0,
      'ts': 0
    },
    {
      'args': {'sort_index': -5},

      'cat': '__metadata',
      'name': 'process_sort_index',
      'ph': 'M',
      'pid': 3834,
      'tid': 10,
      'ts': 0
    },
    {
      'args': {'name': 'Renderer'},

      'cat': '__metadata',
      'name': 'process_name',
      'ph': 'M',
      'pid': 3834,
      'tid': 10,
      'ts': 0
    },
    {
      'args': {'sort_index': -1},

      'cat': '__metadata',
      'name': 'thread_sort_index',
      'ph': 'M',
      'pid': 3834,
      'tid': 9,
      'ts': 0
    },
    {
      'args': {'name': 'CrRendererMain'},

      'cat': '__metadata',
      'name': 'thread_name',
      'ph': 'M',
      'pid': 3834,
      'tid': 9,
      'ts': 0
    },
    {
      'args': {'name': 'Compositor'},

      'cat': '__metadata',
      'name': 'thread_name',
      'ph': 'M',
      'pid': 3834,
      'tid': 17,
      'ts': 0
    },
    {
      'args': {'elementCount': 47},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RecalculateStyles',
      'ph': 'E',
      'pid': 3872,
      'tid': 26,
      'ts': 1122673092850,
      'tts': 827512
    },
    {
      'args':
          {'beginData': {'dirtyObjects': 44, 'frame': '0x176b9c2a8000', 'partialLayout': false, 'totalObjects': 261}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Layout',
      'ph': 'B',
      'pid': 3872,
      'tid': 26,
      'ts': 1122673092873,
      'tts': 827535
    },
    {
      'args': {'endData': {'root': [0, 0, 1570, 0, 1570, 1472, 0, 1472], 'rootNode': 2}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'Layout',
      'ph': 'E',
      'pid': 3872,
      'tid': 26,
      'ts': 1122673093523,
      'tts': 828186
    },
    {
      'args': {'data': {'frame': '0x176b9c2a8000', 'id': 12}},

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 1828,
      'name': 'FireAnimationFrame',
      'ph': 'X',
      'pid': 3872,
      'tdur': 1827,
      'tid': 26,
      'ts': 1122673093558,
      'tts': 828220
    },
    {
      'args': {
        'data': {
          'frame': '0x176b9c2a8000',
          'scriptId': '65',
          'scriptLine': 939,
          'scriptName': 'devtools://devtools/bundled/ui/UIUtils.js'
        }
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 1770,
      'name': 'FunctionCall',
      'ph': 'X',
      'pid': 3872,
      'tdur': 1770,
      'tid': 26,
      'ts': 1122673093604,
      'tts': 828265
    },
    {
      'args': {'frame': '0x176b9c2a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'ScheduleStyleRecalculation',
      'ph': 'I',
      'pid': 3872,
      's': 'g',
      'tid': 26,
      'ts': 1122673094798,
      'tts': 829461
    },
    {
      'args': {'frame': '0x176b9c2a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RecalculateStyles',
      'ph': 'B',
      'pid': 3872,
      'tid': 26,
      'ts': 1122673094958,
      'tts': 829620
    },
    {
      'args': {'elementCount': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RecalculateStyles',
      'ph': 'E',
      'pid': 3872,
      'tid': 26,
      'ts': 1122673094989,
      'tts': 829651
    },
    {
      'args': {'data': {'frame': '0x176b9c2a8000', 'id': 13}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'RequestAnimationFrame',
      'ph': 'I',
      'pid': 3872,
      's': 'g',
      'tid': 26,
      'ts': 1122673095367,
      'tts': 830030
    },
    {
      'args': {'data': {'documents': 1, 'jsEventListeners': 141, 'jsHeapSizeUsed': 15850696, 'nodes': 1705}},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateCounters',
      'ph': 'I',
      'pid': 3872,
      's': 'g',
      'tid': 26,
      'ts': 1122673095384,
      'tts': 830046
    },
    {
      'args': {'frame': '0x176b9c2a8000'},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayerTree',
      'ph': 'I',
      'pid': 3872,
      's': 'g',
      'tid': 26,
      'ts': 1122673095390,
      'tts': 830052
    },
    {
      'args': {'layerId': 11, 'layerTreeId': 1},

      'cat': 'disabled-by-default-devtools.timeline',
      'name': 'UpdateLayer',
      'ph': 'B',
      'pid': 3872,
      'tid': 26,
      'ts': 1122673095845,
      'tts': 830507
    },
    {
      'args': {
        'data': {
          'clip': [-15, -15, 1585, -15, 1585, 1487, -15, 1487],
          'frame': '0x176b9c2a8000',
          'layerId': 11,
          'nodeId': 2
        }
      },

      'cat': 'disabled-by-default-devtools.timeline',
      'dur': 4637,
      'name': 'Paint',
      'ph': 'X',
      'pid': 3872,
      'tdur': 4630,
      'tid': 26,
      'ts': 1122673095897,
      'tts': 830559
    },
    {
      'args': {'name': 'Browser'},

      'cat': '__metadata',
      'name': 'process_name',
      'ph': 'M',
      'pid': 3778,
      'tid': 3801,
      'ts': 0
    },
    {
      'args': {'name': 'CrBrowserMain'},

      'cat': '__metadata',
      'name': 'thread_name',
      'ph': 'M',
      'pid': 3778,
      'tid': 3778,
      'ts': 0
    }
  ]);
};
