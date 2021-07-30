import test from 'ava';
import { isRTL } from '../i18n';

test('isRTL check should return false by default', (t) => {
  t.is(isRTL(), false);
});
