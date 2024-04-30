import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from '@hippy/react';

const SKIN_COLOR = {
  mainLight: '#4c9afa',
  otherLight: '#4c9afa',
  textWhite: 'white',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  buttonView: {
    borderColor: SKIN_COLOR.mainLight,
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 250,
    height: 50,
    marginTop: 30,
  },
  buttonText: {
    fontSize: 20,
    color: SKIN_COLOR.mainLight,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  selectionText: {
    fontSize: 20,
    color: SKIN_COLOR.mainLight,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
});


export default class ModalExpo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      press: false,
      animationType: 'fade',
    };
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  feedback(state) {
    this.setState({
      press: state === 'in',
    });
  }

  show() {
    this.setState({
      visible: true,
    });
  }

  hide() {
    this.setState({
      visible: false,
    });
  }

  render() {
    const { press, visible } = this.state;
    return (
      <ScrollView>
        <View style={styles.container}>
          <View
            onPressIn={() => this.feedback('in')}
            onPressOut={() => this.feedback('out')}
            onClick={this.show}
            style={[styles.buttonView, {
              borderColor: SKIN_COLOR.mainLight,
              opacity: (press ? 0.5 : 1),
            }]}
          >
            <Text style={[styles.buttonText, { color: SKIN_COLOR.mainLight }]}>点击弹出浮层</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
          <Text
            onClick={() => {
              this.setState({ animationType: 'fade' });
            }}
            style={[styles.selectionText, { backgroundColor: this.state.animationType === 'fade' ? 'rgba(255, 0, 0, 0.5)' : '#FFFFFF' }]}
          >fade</Text>
          <Text
            onClick={() => {
              this.setState({ animationType: 'slide' });
            }}
            style={[styles.selectionText, { backgroundColor: this.state.animationType === 'slide' ? 'rgba(255, 0, 0, 0.5)' : '#FFFFFF' }]}
          >slide</Text>
          <Text
            onClick={() => {
              this.setState({ animationType: 'slide_fade' });
            }}
            style={[styles.selectionText, { backgroundColor: this.state.animationType === 'slide_fade' ? 'rgba(255, 0, 0, 0.5)' : '#FFFFFF' }]}
          >slide_fade</Text>
        </View>
        <Modal
          transparent={true}
          animationType={this.state.animationType}
          visible={visible}
          onRequestClose={() => { /* Trigger when hardware back pressed */ }}
          supportedOrientations={['portrait']}
          immersionStatusBar={true}
        >
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center',  backgroundColor: '#4c9afa88' }}>
            <View
              onClick={this.hide}
              style={{
                width: 200,
                height: 200,
                backgroundColor: SKIN_COLOR.otherLight,
                marginTop: 300,
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: SKIN_COLOR.textWhite, fontSize: 22, marginTop: 80 }}>
                点击关闭浮层
              </Text>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}
