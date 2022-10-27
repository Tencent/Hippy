const { expect } = chai;

describe('text', () => {
  it('text font', (done)  => {
    __e2e__.route.replace('/text-font');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
