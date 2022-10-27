const { expect } = chai;

describe('text', () => {
  it('text color', (done)  => {
    __e2e__.route.replace('/text-color');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
