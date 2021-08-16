// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as PerfUI from '../../../legacy/components/perf_ui/perf_ui.js';
await FrontendHelpers.initializeGlobalVars();
const chart = new PerfUI.PieChart.PieChart();
document.getElementById('container')?.appendChild(chart);
chart.data = {
    chartName: 'Nice Chart',
    size: 110,
    formatter: (value) => String(value) + ' %',
    showLegend: true,
    total: 100,
    slices: [{ value: 75, color: 'crimson', title: 'Filling' }, { value: 25, color: 'burlywood', title: 'Crust' }],
};
//# sourceMappingURL=basic-with-legend.js.map