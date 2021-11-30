import test from 'ava';
import parseSelector from '../parser';

test('Id selector parser', (t) => {
  t.deepEqual(parseSelector('#test'), {
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
        undefined, // FIXME: Strange undefined
      ],
    ],
  });
});

test('Class selector parser', (t) => {
  t.deepEqual(parseSelector('.row'), {
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
        undefined, // FIXME: Strange undefined
      ],
    ],
  });
});

test('Union combinator selector parser', (t) => {
  t.deepEqual(parseSelector('.button-demo-1.is-pressing'), {
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
        undefined, // FIXME: Strange undefined
      ],
    ],
  });
});

test('Space combinator selector parser', (t) => {
  t.deepEqual(parseSelector('#demo-img .image'), {
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
        ' ', // FIXME: Strange space
      ],
      [
        [
          {
            type: '.',
            identifier: 'image',
          },
        ],
        undefined, // FIXME: Strange undefined
      ],
    ],
  });
});
