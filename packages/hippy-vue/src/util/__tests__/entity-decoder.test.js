import test from 'ava';
import { decode } from '../entity-decoder';

test('[entity-decoder] should return the html it self', (t) => {
  const html = '<a>Hello world</a>';
  t.is(decode(html), html);
});
