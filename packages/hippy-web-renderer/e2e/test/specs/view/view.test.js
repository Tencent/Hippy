const { expect } = chai;

describe('view', () => {
  it('view background', (done)  => {
    __e2e__.route.replace('/view-background');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
  it('view border', (done)  => {
    __e2e__.route.replace('/view-border');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
  it('view flex', (done)  => {
    __e2e__.route.replace('/view-flex');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
