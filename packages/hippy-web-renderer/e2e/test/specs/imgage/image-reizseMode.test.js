const { expect } = chai;

describe('image', () => {
  it('resizeMode', (done)  => {
    __e2e__.route.replace('/image-resizemode');
    snapshot(0.5).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
