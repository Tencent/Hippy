import fs from 'fs';
import path from 'path';
import TraceAdapter from '../middlewares/ios/adapter/trace-adapter';

describe('ios trace 适配器', () => {
  it('trace转换', async () => {
    const src = path.join(__dirname, '../__mock__/jsc-trace.json');
    const dest = path.join(__dirname, '../__mock__/converted-v8-trace.json');
    const data = await fs.promises.readFile(src);
    const jscJson = JSON.parse(data.toString());

    const traceAdapter = new TraceAdapter();
    const v8Json = traceAdapter.jsc2v8(jscJson);
    await fs.promises.writeFile(dest, JSON.stringify(v8Json));

    expect(v8Json.length).toBeGreaterThan(0);
  });
});
