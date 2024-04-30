/* eslint-disable */

import { HippyView, HippyWebEngine, HippyWebModule } from '@hippy/web-renderer';

/**
 * custom module
 */
class CustomModule extends HippyWebModule {
   name = 'camp_common_ability_module'; // the name's value associate hippy-react or hippy-vue module name

  getSwScale(param1,param2,callBack) { // function's moduel
    callBack.resolve({ swScale: 1 })
  }
}

/**
 * custom component
 */
class CustomView extends HippyView {
  constructor(context,id,pId) {
    super(context,id,pId);
    this.tagName = 'CustomView'; // the prop's value associate hippy-react or hippy-vue component's native name
    this.dom = document.createElement('div'); // must create dom on constructor,the next step will update style and insert dom
  }

  // before the component's dom insert, the defaultStyle will assign dom,only once
  // default's value { display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box', outline: 'none', fontFamily: '' };
  defaultStyle ()
  {
    return {display:'flex'};
  }

  // data is hippy-react or hippy-vue set props or style ,
  // defaultProcess is hippyView implement, set props to component's props and invoke component's function which have same key with prop
  // and assign style to component's dom
  // you can also not use defaultProcess,
  updateProps(data , defaultProcess ) {
    const newData = [...data];
    newData.info = 'fi';
    if(!newData.style.backgroundColor)
      newData.style.backgroundColor = '#fff';
    defaultProcess(this ,newData );
  }

  // the method will invoke, when update props every time, because updateProps() set the info =' fi'
  set info(value) {
  }

  // the method will invoke, when update prop's key is 'origin'
  set origin(value){

    const module1 = this.context.getModuleByName('modulename'); //get module by name
    module1.fun(); //invoke module function

    this.context.sendUiEvent(this.id,'uieventname',{}); // send a ui event by id

  }

  // component api
  // can invoke by user.Use hippy-react or hippy-vue function callUIFunction(), example:callUIFunction(this.instance, 'openNewPage', [param1])
  // callBack.resolve() send right result
  // callBac.reject() sed error result
  openNewPage(param1,callBack){
    callBack.resolve({status:'success'});
  }

  // component api
  // can invoke by user.Use hippy-react or hippy-vue function callUIFunction(), example:callUIFunction(this.instance, 'sharePage', [param1,param2,param3])
  // callBack.resolve() send right result
  // callBac.reject() sed error result
  sharePage(param1,param2,param3,callBack){
    callBack.resolve({status:'success'});

  }

  // component self manager child append api
  // if implement the method, the customer must insert child dom by self
  // if not implement the method, will use component's dom as parent dom,to insert child dom
  insertChild(component,position) {

  }
  // component self manager child remove api
  // if implement the method, the customer must remove child dom by self
  // if not implement the method, will use component's parent component to remove child dom
  removeChild(component) {

  }

}

// create engine, register component and module
HippyWebEngine.create({
  modules: {
    CustomModule,
  },
  components: {
    CustomView
  }
});
