import React from 'react';
import { withRouter } from 'react-router-dom';
import HippyReact, {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from '@hippy/react';


import BACK_ICON from '!!url-loader?modules!./back-icon.png';

const SKIN_COLOR = {
  mainLight: '#4c9afa',
  otherLight: '#f44837',
  textWhite: '#fff',
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: SKIN_COLOR.mainLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerButton: {
    height: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    color: SKIN_COLOR.textWhite,
    lineHeight: 24,
  },
});

const Header = ({ history, route }) => {
  // home page Navigator
  if (history.index === 0) {
    return (
      <View style={[styles.container]}>
        <View style={{ backgroundColor: styles.title.backgroundColor, marginLeft: 12 }}>
          <Text numberOfLines={1} style={[styles.title, { fontWeight: 'bold' }]}>
            {route.name}
          </Text>
        </View>
        <View style={styles.headerButton}>
          <Text numberOfLines={1} style={styles.title}>
            v
            {HippyReact.version}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.container]}>
      <View
        onClick={() => history.goBack()}
        style={[styles.headerButton, Platform.OS === 'ios' ? null : { marginLeft: 20 }]}
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
