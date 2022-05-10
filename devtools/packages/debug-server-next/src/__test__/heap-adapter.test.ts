import fs from 'fs';
import path from 'path';
import HeapAdapter from '../middlewares/ios/adapter/heap-adapter';

describe('ios heap 适配器', () => {
  it('snapshot转换', async () => {
    const src = path.join(__dirname, '../__mock__/jsc-heap.json');
    const dest = path.join(__dirname, '../__mock__/converted-v8-heap.heapsnapshot');
    const data = await fs.promises.readFile(src);
    const jscJson = JSON.parse(data.toString());
    const v8Json = HeapAdapter.jsc2v8(jscJson);
    await fs.promises.writeFile(dest, JSON.stringify(v8Json));

    expect(v8Json.nodes.length).toBeGreaterThan(0);
    expect(v8Json.edges.length).toBeGreaterThan(0);
  });
});
