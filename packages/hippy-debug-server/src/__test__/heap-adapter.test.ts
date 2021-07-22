import fs from 'fs';
import path from 'path';
import HeapAdapter from '../adapter/ios/ios/heap-adapter';

describe('ios heap 适配器', () => {
  it('snapshot转换', async () => {
    const src = path.join(__dirname, '../mock/jsc-heap.json');
    // const dest = path.join(__dirname, '../mock/converted-v8-heap.heapsnapshot');
    const data = await fs.promises.readFile(src);
    const jscJson = JSON.parse(data.toString());
    const v8Json = new HeapAdapter().jsc2v8(jscJson);
    expect(v8Json.nodes.length).toBeGreaterThan(0);
    expect(v8Json.edges.length).toBeGreaterThan(0);
  });
});
