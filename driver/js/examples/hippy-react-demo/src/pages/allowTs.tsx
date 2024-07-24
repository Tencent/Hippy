import React from 'react';
import { connect } from 'react-redux';
import {
  View,
} from '@hippy/react';
import png from './back-icon.png';

interface AllowTsProps {
  test: string;
}

const AllowTs: React.FC<AllowTsProps> = ({ test }) => {
  return (
    <View>
      AllowTs
      <img src={png} />
    </View>
  );
}
export default connect()(AllowTs);