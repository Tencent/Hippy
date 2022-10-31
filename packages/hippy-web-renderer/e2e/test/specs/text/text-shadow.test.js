const { expect } = chai;

describe('text', () => {
  it('text shadow', (done)  => {
    __e2e__.route.replace('/text-shadow');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
