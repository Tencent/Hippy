// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import './LighthouseService.js';
import '../../third_party/lighthouse/lighthouse-dt-bundle.js';

self.postMessage('workerReady');
