/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import memoize from 'memoize-one';
import { PX_PER_MS, MAX_ZOOM, CONTEXT_TYPE } from './constants';

export function getCanvasContext(canvas) {
  return memoize((canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext(CONTEXT_TYPE, { alpha: false });
    const dpr = window.devicePixelRatio || 1;
    configureRetinaCanvas(canvas, dpr);
    ctx.scale(dpr, dpr);
    return ctx;
  })(canvas);
}

function configureRetinaCanvas(canvas: HTMLCanvasElement, dpr) {
  // hidpi canvas: https://www.html5rocks.com/en/tutorials/canvas/hidpi/
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
}

interface CanvasMousePosition {
  canvasMouseX: number;
  canvasMouseY: number;
}

export function getCanvasMousePosition(event: MouseEvent, canvas: Node): CanvasMousePosition {
  const rect = canvas instanceof HTMLCanvasElement ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
  const canvasMouseX = event.clientX - rect.left;
  const canvasMouseY = event.clientY - rect.top;

  return { canvasMouseX, canvasMouseY };
}

export function handleCanvsWheel(
  event: WheelEvent,
  canvas: Node,
  props: {
    viewportWidth: number;
    center: number;
    zoom: number;
    minZoom: number;
    onStateChange: ({ zoom, center }) => void;
  },
): void {
  event.preventDefault();
  event.stopPropagation();

  const { viewportWidth, zoom, minZoom, center, onStateChange } = props;
  const { canvasMouseX } = getCanvasMousePosition(event, canvas);
  const mouseOffsetFromCenter = canvasMouseX - viewportWidth / 2;

  const baseZoom = 1;
  const wheelStepSize = 0.005;
  const updatedZoom = zoom * (baseZoom + wheelStepSize * -event.deltaY);
  const updatedCenter =
    center + mouseOffsetFromCenter / PX_PER_MS / zoom - mouseOffsetFromCenter / PX_PER_MS / updatedZoom;

  if (getClampedZoom(minZoom, updatedZoom) !== zoom) {
    onStateChange({
      zoom: updatedZoom,
      center: updatedCenter,
    });
  }
}

export function getClampedZoom(zoom, updated) {
  return Math.max(zoom, Math.min(MAX_ZOOM, updated));
}

export function geClampedCenter(startOffset, endOffset, updated) {
  return Math.max(startOffset, Math.min(endOffset, updated));
}
