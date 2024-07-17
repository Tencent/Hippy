import React from 'react';
import {
  View,
} from '@hippy/react';

interface AllowTsProps {
  test: string;
}

const AllowTs: React.FC<AllowTsProps> = ({ test }) => {
  return (
    <View>
      AllowTs
    </View>
  );
}
export default AllowTs;