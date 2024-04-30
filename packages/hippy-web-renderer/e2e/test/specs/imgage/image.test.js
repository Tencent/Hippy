const { expect } = chai;

describe('image', () => {
  it('image-load', (done)  => {
    __e2e__.route.replace('/image-load');
    setTimeout(async () => {
      const data = await globalThis.currentRef.getSize();
      expect(data).to.have.own.property('width');
      expect(data).to.have.own.property('height');
      done();
    }, 500);
  });
});
