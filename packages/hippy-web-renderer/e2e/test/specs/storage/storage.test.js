const { expect } = chai;

describe('Storage', () => {
  it('Storage get default value', (done)  => {
    __e2e__.route.replace('/storage-spec');
    setTimeout(async () => {
      const data = await globalThis.currentRef.getValue('useKey');
      expect(JSON.parse(JSON.parse(data))).to.equal('defaultValue');
      done();
    }, 200);
  });
  it('Storage set  value', (done)  => {
    __e2e__.route.replace('/storage-spec');
    setTimeout(async () => {
      globalThis.currentRef.setValue('newDefaultValue');
      const data = await globalThis.currentRef.getValue('useKey');
      expect(JSON.parse(JSON.parse(data))).to.equal('newDefaultValue');
      done();
    }, 200);
  });
});
