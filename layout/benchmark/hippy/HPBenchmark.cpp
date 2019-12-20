/**
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the LICENSE
* file in the root directory of this source tree.
*/
/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* this benchmark refer facebook yoga , so it can compare with yoga.
 */
#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#include "./Hippy.h"

#define NUM_REPETITIONS 1000

#define HPBENCHMARKS(BLOCK)                \
  int main(int argc, char const* argv[]) { \
    clock_t __start;                       \
    clock_t __endTimes[NUM_REPETITIONS];   \
    { BLOCK }                              \
    return 0;                              \
  }

#define HPBENCHMARK(NAME, BLOCK)                         \
  __start = clock();                                     \
  for (uint32_t __i = 0; __i < NUM_REPETITIONS; __i++) { \
    {BLOCK} __endTimes[__i] = clock();                   \
  }                                                      \
  __printBenchmarkResult(NAME, __start, __endTimes);

static int __compareDoubles(const void* a, const void* b) {
  double arg1 = *(const double*) a;
  double arg2 = *(const double*) b;

  if (arg1 < arg2) {
    return -1;
  }

  if (arg1 > arg2) {
    return 1;
  }

  return 0;
}

static void __printBenchmarkResult(
    char* name,
    clock_t start,
    clock_t* endTimes) {
  double timesInMs[NUM_REPETITIONS];
  double mean = 0;
  clock_t lastEnd = start;
  for (uint32_t i = 0; i < NUM_REPETITIONS; i++) {
    timesInMs[i] = (endTimes[i] - lastEnd) / (double) CLOCKS_PER_SEC * 1000;
    lastEnd = endTimes[i];
    mean += timesInMs[i];
  }
  mean /= NUM_REPETITIONS;

  qsort(timesInMs, NUM_REPETITIONS, sizeof(double), __compareDoubles);
  double median = timesInMs[NUM_REPETITIONS / 2];

  double variance = 0;
  for (uint32_t i = 0; i < NUM_REPETITIONS; i++) {
    variance += pow(timesInMs[i] - mean, 2);
  }
  variance /= NUM_REPETITIONS;
  double stddev = sqrt(variance);

  printf("%s: median: %lf ms, stddev: %lf ms\n", name, median, stddev);
}

static HPSize _measure(
    HPNodeRef node,
    float width,
    MeasureMode widthMode,
    float height,
    MeasureMode heightMode,
    void * layoutContext) {
  return (HPSize){
      .width = widthMode == MeasureModeUndefined ? 10 : width,
      .height = heightMode == MeasureModeUndefined ? 10 : width,
  };
}

HPBENCHMARKS({
  HPBENCHMARK("Stack with flex", {
    const HPNodeRef root = HPNodeNew();
    HPNodeStyleSetWidth(root, 100);
    HPNodeStyleSetHeight(root, 100);

    for (uint32_t i = 0; i < 10; i++) {
      const HPNodeRef child = HPNodeNew();
      HPNodeSetMeasureFunc(child, _measure);
      HPNodeStyleSetFlex(child, 1);
      HPNodeInsertChild(root, child, 0);
    }

    HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionLTR);
    HPNodeFreeRecursive(root);
  });

  HPBENCHMARK("Align stretch in undefined axis", {
    const HPNodeRef root = HPNodeNew();

    for (uint32_t i = 0; i < 10; i++) {
      const HPNodeRef child = HPNodeNew();
      HPNodeStyleSetHeight(child, 20);
      HPNodeSetMeasureFunc(child, _measure);
      HPNodeInsertChild(root, child, 0);
    }

    HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionLTR);
    HPNodeFreeRecursive(root);
  });

  HPBENCHMARK("Nested flex", {
    const HPNodeRef root = HPNodeNew();

    for (uint32_t i = 0; i < 10; i++) {
      const HPNodeRef child = HPNodeNew();
      HPNodeStyleSetFlex(child, 1);
      HPNodeInsertChild(root, child, 0);

      for (uint32_t ii = 0; ii < 10; ii++) {
        const HPNodeRef grandChild = HPNodeNew();
        HPNodeSetMeasureFunc(grandChild, _measure);
        HPNodeStyleSetFlex(grandChild, 1);
        HPNodeInsertChild(child, grandChild, 0);
      }
    }

    HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionLTR);
    HPNodeFreeRecursive(root);
  });

  HPBENCHMARK("Huge nested layout", {
    const HPNodeRef root = HPNodeNew();

    for (uint32_t i = 0; i < 10; i++) {
      const HPNodeRef child = HPNodeNew();
      HPNodeStyleSetFlexGrow(child, 1);
      HPNodeStyleSetWidth(child, 10);
      HPNodeStyleSetHeight(child, 10);
      HPNodeInsertChild(root, child, 0);

      for (uint32_t ii = 0; ii < 10; ii++) {
        const HPNodeRef grandChild = HPNodeNew();
        HPNodeStyleSetFlexDirection(grandChild, FLexDirectionRow);
        HPNodeStyleSetFlexGrow(grandChild, 1);
        HPNodeStyleSetWidth(grandChild, 10);
        HPNodeStyleSetHeight(grandChild, 10);
        HPNodeInsertChild(child, grandChild, 0);

        for (uint32_t iii = 0; iii < 10; iii++) {
          const HPNodeRef grandGrandChild = HPNodeNew();
          HPNodeStyleSetFlexGrow(grandGrandChild, 1);
          HPNodeStyleSetWidth(grandGrandChild, 10);
          HPNodeStyleSetHeight(grandGrandChild, 10);
          HPNodeInsertChild(grandChild, grandGrandChild, 0);

          for (uint32_t iiii = 0; iiii < 10; iiii++) {
            const HPNodeRef grandGrandGrandChild = HPNodeNew();
            HPNodeStyleSetFlexDirection(
                grandGrandGrandChild, FLexDirectionRow);
            HPNodeStyleSetFlexGrow(grandGrandGrandChild, 1);
            HPNodeStyleSetWidth(grandGrandGrandChild, 10);
            HPNodeStyleSetHeight(grandGrandGrandChild, 10);
            HPNodeInsertChild(grandGrandChild, grandGrandGrandChild, 0);
          }
        }
      }
    }

    HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionLTR);
    HPNodeFreeRecursive(root);
  });

  //added by ianwang(honwsn@gmail.com) ,for no style test that will cost more time then the previous test case.
  HPBENCHMARK("Huge nested layout, no style width & height", {
    const HPNodeRef root = HPNodeNew();

    for (uint32_t i = 0; i < 10; i++) {
      const HPNodeRef child = HPNodeNew();
      HPNodeStyleSetFlexGrow(child, 1);
//      HPNodeStyleSetWidth(child, 10);
//      HPNodeStyleSetHeight(child, 10);
      HPNodeInsertChild(root, child, 0);

      for (uint32_t ii = 0; ii < 10; ii++) {
        const HPNodeRef grandChild = HPNodeNew();
        HPNodeStyleSetFlexDirection(grandChild, FLexDirectionRow);
        HPNodeStyleSetFlexGrow(grandChild, 1);
//        HPNodeStyleSetWidth(grandChild, 10);
//        HPNodeStyleSetHeight(grandChild, 10);
        HPNodeInsertChild(child, grandChild, 0);

        for (uint32_t iii = 0; iii < 10; iii++) {
          const HPNodeRef grandGrandChild = HPNodeNew();
          HPNodeStyleSetFlexGrow(grandGrandChild, 1);
//          HPNodeStyleSetWidth(grandGrandChild, 10);
//          HPNodeStyleSetHeight(grandGrandChild, 10);
          HPNodeInsertChild(grandChild, grandGrandChild, 0);

          for (uint32_t iiii = 0; iiii < 10; iiii++) {
            const HPNodeRef grandGrandGrandChild = HPNodeNew();
            HPNodeStyleSetFlexDirection(
                grandGrandGrandChild, FLexDirectionRow);
            HPNodeStyleSetFlexGrow(grandGrandGrandChild, 1);
            HPNodeStyleSetWidth(grandGrandGrandChild, 10);
            HPNodeStyleSetHeight(grandGrandGrandChild, 10);
            HPNodeInsertChild(grandGrandChild, grandGrandGrandChild, 0);
          }
        }
      }
    }

    HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionLTR);
    HPNodeFreeRecursive(root);
  });
});
