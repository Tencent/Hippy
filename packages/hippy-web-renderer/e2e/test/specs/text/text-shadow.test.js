const { expect } = chai;

describe('text', () => {
  it('text shadow', (done)  => {
    e2e.route.replace('/text-shadow');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
