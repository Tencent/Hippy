const { expect } = chai;

describe('image', () => {
  it('tintColor', (done)  => {
    __e2e__.route.replace('/image-tintcolor');
    snapshot(0.5).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
