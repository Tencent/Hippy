import React from 'react';
import { withRouter } from 'react-router-dom';
import HippyReact, {
  Image,
  StyleSheet,
  Text,
  View,
} from '@hippy/react';

import BACK_ICON from './back-icon.png';

const SKIN_COLOR = {
  mainLight: '#81D7F7',
  otherLight: '#f44837',
  textWhite: '#1E304A',
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 12,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    tintColor: SKIN_COLOR.textWhite,
    width: 15,
    height: 15,
  },
  headerButton: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    color: SKIN_COLOR.textWhite,
    lineHeight: 16,
  },
});

const Header = ({ history, route }) => {
  // home page Navigator
  if (history.index === 0) {
    return (
      <View style={[styles.container]}>
        <View>
          <Text numberOfLines={1} style={[styles.title]}>
            {route.name}
          </Text>
        </View>
        <View style={styles.headerButton}>
          <Text numberOfLines={1} style={styles.title}>
            {HippyReact.version !== 'unspecified' ? `${HippyReact.version}` : 'master'}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.container]}>
      <View
        onClick={() => history.goBack()}
        style={[styles.headerButton]}
      >
        <Image
          style={styles.backIcon}
          source={{ uri: BACK_ICON }}
        />
      </View>
      <View style={styles.headerButton}>
        <Text numberOfLines={1} style={styles.title}>
          {route.name}
        </Text>
      </View>
    </View>
  );
};

export default withRouter(Header);
