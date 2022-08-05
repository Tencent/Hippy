/**
 * runtime/style/parser 样式parser模块
 * 选择器parser测试
 *
 */
import { parseSelector } from '../../../src/runtime/style/parser';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('runtime/style/parser.ts', () => {
  // id选择器parser
  it('id selector should parser correctly', async () => {
    const parsedValue = {
      end: 5,
      start: undefined,
      value: [
        [
          [
            {
              type: '#',
              identifier: 'test',
            },
          ],
          undefined,
        ],
      ],
    };

    expect(parseSelector('#test', undefined)).toStrictEqual(parsedValue);
  });

  // 类选择器parser
  it('class selector should parser correctly', async () => {
    const parsedValue = {
      end: 4,
      start: undefined,
      value: [
        [
          [
            {
              type: '.',
              identifier: 'row',
            },
          ],
          undefined,
        ],
      ],
    };

    expect(parseSelector('.row', undefined)).toStrictEqual(parsedValue);
  });

  // 联合选择器parser
  it('union combinator selector should parser correctly', async () => {
    const parsedValue = {
      end: 26,
      start: undefined,
      value: [
        [
          [
            {
              type: '.',
              identifier: 'button-demo-1',
            },
            {
              type: '.',
              identifier: 'is-pressing',
            },
          ],
          undefined,
        ],
      ],
    };

    expect(parseSelector('.button-demo-1.is-pressing', undefined)).toStrictEqual(parsedValue);
  });

  // 空格选择器parser
  it('space selector should parser correctly', async () => {
    const parsedValue = {
      end: 16,
      start: undefined,
      value: [
        [
          [
            {
              type: '#',
              identifier: 'demo-img',
            },
          ],
          ' ',
        ],
        [
          [
            {
              type: '.',
              identifier: 'image',
            },
          ],
          undefined,
        ],
      ],
    };

    expect(parseSelector('#demo-img .image', undefined)).toStrictEqual(parsedValue);
  });
});
