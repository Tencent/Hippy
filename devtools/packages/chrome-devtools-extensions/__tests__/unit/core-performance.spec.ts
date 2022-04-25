import 'jest';

import { parseFrameTimingData } from '@chrome-devtools-extensions/views/core-performance/parse-frame-timing';

import { parseTraceData } from '@chrome-devtools-extensions/views/core-performance/parse-trace';
import {
  START_TIME,
  END_TIME,
  MOCK_FRAME_TIMINGS,
  MOCK_FRAME_TIMINGS_RES,
  MOCK_CORE_TIMELINE,
  MOCK_CORE_TIMELINE_RES_RENDER_TRACE,
} from '../../__mocks__/performance';

describe('parseFrameTimingData', () => {
  it('normal data', () => {
    const res = parseFrameTimingData(MOCK_FRAME_TIMINGS, START_TIME, END_TIME);
    expect(res).toEqual(MOCK_FRAME_TIMINGS_RES);
  });
});

describe('parseTraceData', () => {
  it('normal data', () => {
    const res = parseTraceData(MOCK_CORE_TIMELINE.traceEvents);
    expect(res.renderTrace).toEqual(MOCK_CORE_TIMELINE_RES_RENDER_TRACE);
  });
});
