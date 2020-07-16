import test from 'ava';
import translateColor, { translateColors } from '../color-parser';

test('Test color translation', (t) => {
  t.is(translateColor('#abc'), 4289379276);
  t.is(translateColor('#abcd'), 3718953932);
  t.is(translateColor('#abcdef'), 4289449455);
  t.is(translateColor('#11223344'), 1141973555);
  t.is(translateColor('#123'), 4279312947);
  t.is(translateColor('rgb(10, 20, 30)'), 4278850590);
  t.is(translateColor('rgb(-10, 300, 30)'), 4278255390);
  t.is(translateColor('rgba(10, 20, 30, .8)'), 3423212574);
  t.is(translateColor('rgba(10, 20, 30, -.3)'), 660510);
  t.is(translateColor('rgba(10, 20, 30, 1.8)'), 4278850590);
  t.is(translateColor('hsl(100, 20%, 30%)'), 4282866749);
  t.is(translateColor('hsl(100000, 20%, 30%)'), 4283579740);
  t.is(translateColor('hsla(100, 40%, 50%, .8)'), 3429806925);
  t.is(translateColor('hsla(100, -10%, 120%, .8)'), 3439329279);
  t.is(translateColor('transparent'), 0);
  t.is(translateColor('blueviolet'), 4287245282);
  t.is(translateColor(4287245282), 3808397867);
});

test('Test colors translation', (t) => {
  // single color
  t.deepEqual(translateColors('#abc'), [4289379276]);
  t.deepEqual(translateColors('transparent'), [0]);
  t.deepEqual(translateColors('rgb(10, 20, 30)'), [4278850590]);
  t.deepEqual(translateColors('rgba(10, 20, 30, .8)'), [3423212574]);
  t.deepEqual(translateColors('hsla(100, 40%, 50%, .8)'), [3429806925]);
  t.deepEqual(translateColors('hsla(100, -10%, 120%, .8)'), [3439329279]);
  // multi colors
  t.deepEqual(translateColors('#abc, #abcd'), [4289379276, 3718953932]);
  t.deepEqual(translateColors('transparent, #abcd'), [0, 3718953932]);
  t.deepEqual(translateColors('#abc, rgb(10, 20, 30)'), [4289379276, 4278850590]);
  t.deepEqual(translateColors('#abc, rgb(10, 20, 30), hsla(100, 40%, 50%, .8)'), [4289379276, 4278850590, 3429806925]);
});

test('Test color translation error handle NaN', (t) => {
  const err = t.throws(() => translateColor(NaN));
  t.is(err.message, 'Bad color value: NaN');
});

test('Test color translation error handle #abz', (t) => {
  const err = t.throws(() => translateColor('#abz'));
  t.is(err.message, 'Bad color value: #abz');
});

test('Test color translation error handle #abcdefz', (t) => {
  const err = t.throws(() => translateColor('#abcdefz'));
  t.is(err.message, 'Bad color value: #abcdefz');
});

test('Test color translation error handle #0 and #01', (t) => {
  const err = t.throws(() => translateColor('#0'));
  t.is(err.message, 'Bad color value: #0');
  const err2 = t.throws(() => translateColor('#01'));
  t.is(err2.message, 'Bad color value: #01');
});

test('Test color translation error handle abc', (t) => {
  const err = t.throws(() => translateColor('abc'));
  t.is(err.message, 'Bad color value: abc');
});

test('Test colors translation error handle "red, blue, , yellow"', (t) => {
  const err = t.throws(() => translateColors('red, blue, , yellow'));
  t.is(err.message, 'Bad color value: ');
});
