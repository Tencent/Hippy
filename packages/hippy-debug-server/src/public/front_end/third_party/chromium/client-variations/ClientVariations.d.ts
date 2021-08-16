// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

type Data = {
  variationIds: number[],
  triggerVariationIds: number[],
}

export function parseClientVariations(data: string): Data
export function formatClientVariations(
    data: Data, variationIdsComment?: string,
    triggerVariationIdsComment?: string): string
