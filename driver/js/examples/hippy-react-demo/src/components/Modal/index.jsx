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
    alignItems: 'center'
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
    textAlign: 'center',
    textAlignVertical: 'center',
    marginLeft: 10,
    marginRight: 10,
    padding: 5,
    borderRadius: 5,
    borderWidth: 2,
  },
});


export default class ModalExpo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      press: false,
      animationType: 'fade',
      immerseStatusBar: false,
      hideStatusBar: false,
      hideNavigationBar: false,
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
        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
          <Text
            onClick={() => {this.setState({animationType: 'fade'})}}
            style={[styles.selectionText,
              {borderColor: this.state.animationType === 'fade' ? 'red' : SKIN_COLOR.mainLight},
              {color: this.state.animationType === 'fade' ? 'red' : SKIN_COLOR.mainLight}
            ]}
          >fade</Text>
          <Text
            onClick={() => {this.setState({animationType: 'slide'})}}
            style={[styles.selectionText,
              {borderColor: this.state.animationType === 'slide' ? 'red' : SKIN_COLOR.mainLight},
              {color: this.state.animationType === 'slide' ? 'red' : SKIN_COLOR.mainLight}
            ]}
          >slide</Text>
          <Text
            onClick={() => {this.setState({animationType: 'slide_fade'})}}
            style={[styles.selectionText,
              {borderColor: this.state.animationType === 'slide_fade' ? 'red' : SKIN_COLOR.mainLight},
              {color: this.state.animationType === 'slide_fade' ? 'red' : SKIN_COLOR.mainLight}
            ]}
          >slide_fade</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
          <Text
            onClick={() => {this.setState({hideStatusBar: !this.state.hideStatusBar})}}
            style={[styles.selectionText,
              {borderColor: this.state.hideStatusBar ? 'red' : SKIN_COLOR.mainLight},
              {color: this.state.hideStatusBar ? 'red' : SKIN_COLOR.mainLight}
            ]}
          >autoHideStatusBar</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
          <Text
            onClick={() => {this.setState({immerseStatusBar: !this.state.immerseStatusBar})}}
            style={[styles.selectionText,
              {borderColor: this.state.immerseStatusBar ? 'red' : SKIN_COLOR.mainLight},
              {color: this.state.immerseStatusBar ? 'red' : SKIN_COLOR.mainLight}
            ]}
          >immersionStatusBar</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
          <Text
            onClick={() => {this.setState({hideNavigationBar: !this.state.hideNavigationBar})}}
            style={[styles.selectionText,
              {borderColor: this.state.hideNavigationBar ? 'red' : SKIN_COLOR.mainLight},
              {color: this.state.hideNavigationBar ? 'red' : SKIN_COLOR.mainLight}
            ]}
          >autoHideNavigationBar</Text>
        </View>
        <Modal
          transparent={true}
          animationType={this.state.animationType}
          visible={visible}
          requestClose={() => { /* Trigger when hardware back pressed */ }}
          orientationChange={(evt) => { console.log('orientation changed', evt.orientation); }}
          supportedOrientations={['portrait']}
          immersionStatusBar={this.state.immerseStatusBar}
          autoHideStatusBar={this.state.hideStatusBar}
          autoHideNavigationBar={this.state.hideNavigationBar}
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
