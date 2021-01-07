import React from 'react';
import App from '../app';
import renderer from 'react-test-renderer';

test('render app correctly', () => {
  const tree = renderer.create(<App />).toJSON();
  expect(tree).toMatchSnapshot();
});
