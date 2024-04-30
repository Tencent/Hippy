const { expect } = chai;

describe('scroll-view', () => {
  it('scroll-view load', (done)  => {
    __e2e__.route.replace('/scroll-view');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
  it('scroll-view scroll', (done)  => {
    __e2e__.route.replace('/scroll-view');
    globalThis.currentRef.scroll();
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
