const { expect } = chai;

describe('view-pager', () => {
  it('view-pager load', (done)  => {
    __e2e__.route.replace('/view-pager-spec');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
  it('view-pager change pager', (done)  => {
    __e2e__.route.replace('/view-pager-spec');
    setTimeout(() => {
      globalThis.currentRef.changePage();
    }, 200);
    snapshot(0.5).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
