const { expect } = chai;

describe('web-view', () => {
  it('web-view load', (done)  => {
    __e2e__.route.replace('/web-view-spec');
    snapshot(1).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
