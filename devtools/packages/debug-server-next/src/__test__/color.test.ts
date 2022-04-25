import { CssDomainAdapter } from '../middlewares/common/css-middleware';

describe('CSS adapter', () => {
  it('rgba formatter', async () => {
    const cases = [
      'rgb(128 128 0)',
      'rgb(128 128 0 / 100%)',
      'rgb(50% 50% 0% / 100%)',
      'rgba(128 128 0 / 100%)',
      'rgba(128, 128, 0, 1)',
      'rgba(50%, 50%, 0%, 100%)',
    ];
    const results = cases.map(CssDomainAdapter.transformRGBA);
    expect(results.every((item) => item === 'rgba(128, 128, 0, 1)' || item === 'rgba(127, 127, 0, 1)')).toBeTruthy();
  });
});
