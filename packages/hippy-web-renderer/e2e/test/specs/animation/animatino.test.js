const { expect } = chai;

describe('animation', () => {
  it('animation play', (done)  => {
    __e2e__.route.replace('/animation-spec');
    setTimeout(() => {
      globalThis.currentRef.horizonAnimation();
      globalThis.currentRef.verticalAnimation();
      globalThis.currentRef.scaleAnimationSet();
      globalThis.currentRef.rotateAnimationSet();
    }, 500);
    snapshot(1).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
