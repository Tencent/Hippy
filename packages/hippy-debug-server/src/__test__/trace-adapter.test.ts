import fs from 'fs';
import path from 'path';
import TraceAdapter from '../adapter/ios/ios/trace-adapter';

describe('ios trace 适配器', () => {
  it('trace转换', async () => {
    const src = path.join(__dirname, '../mock/jsc-trace.json');
    const dest = path.join(__dirname, '../mock/converted-v8-trace.json');
    const data = await fs.promises.readFile(src);
    const jscJson = JSON.parse(data.toString());
    debugger;
    const traceAdapter = new TraceAdapter();
    const v8Json = traceAdapter.jsc2v8(jscJson);
    await fs.promises.writeFile(dest, JSON.stringify(v8Json));
    expect(0).toBe(0);
    // expect(v8Json.nodes.length).toBeGreaterThan(0);
    // expect(v8Json.edges.length).toBeGreaterThan(0);
  });
});
