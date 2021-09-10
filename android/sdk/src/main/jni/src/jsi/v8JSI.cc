#include "v8JSI.h"
#include <unordered_map>
using namespace std;

using namespace v8;
 
unordered_map<std::string,Handle<FunctionTemplate>> hostObjectMap;
 
Handle<Value> Get(const Arguments& args) {
	Handle<Object> self = args.Holder();
 
	Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
	void* ptr = wrap->Value();
	HostObject* hostObject = static_cast<HostObject*>(ptr);
	String::Utf8Value str(args[1]); 
	std::string name = ToCString(str); 

	hostObject->get(string propertyName);
 
	return Undefined();
}

void Regist2JsContext(Handle<ObjectTemplate>& object
							, Persistent<Context>& context) {
	context = Context::New(NULL, object);
}

void createHostObject(shared_ptr<Runtime> runtime,v8::Isolate* isolate,HostObject hostObject,string objectName){
  	v8::HandleScope handle_scope(isolate);
	Handle<ObjectTemplate> global = ObjectTemplate::New();
  	std::shared_ptr<hippy::napi::V8Ctx> v8_ctx =
      	std::static_pointer_cast<hippy::napi::V8Ctx>(
         	 runtime->GetScope()->GetContext());
 	 v8::Local<v8::Context> context = v8_ctx->context_persistent_.Get(isolate);
  	v8::Context::Scope context_scope(context);

	Handle<FunctionTemplate> hostobject_template = 
		FunctionTemplate::New(HostObjectConstructCallback);
	hostobject_template->SetClassName(String::New(objectName));
	hostObjectMap.emplace(objectName,hostobject_template);

	Handle<ObjectTemplate> hostobject_inst = hostobject_template->InstanceTemplate();
	hostobject_inst->SetInternalFieldCount(1);
	global->Set(String::New(objectName), hostobject_template);
	Handle<ObjectTemplate> hostobject_proto = hostobject_template->PrototypeTemplate();
	hostobject_proto->Set(String::New("get"), FunctionTemplate::New(Get));

	Regist2JsContext(global,context);
}

void HostObjectWeakReferenceCallback(Persistent<Value> object
												, void * param) {
	if (HostObject* hostObject = static_cast<HostObject*>(param)) {
		delete hostObject;
	}
}

Handle<External> MakeWeakHostObject(void* parameter) {
	Persistent<External> persistentObject = 
		Persistent<External>::New(External::New(parameter));
		

	persistentObject.MakeWeak(parameter, HostObjectWeakReferenceCallback);
 
	return persistentObject;
}
 

HostObject* NewHostObject(const Arguments& args) {
	HostObject* hostObject = NULL;
	
	if (args.Length() == 0) {
		hostObject = new HostObject();	
	} else {
		v8::ThrowException(String::New("Too many parameters for NewCloudApp"));
	}
 
	return hostObject;
}
 

Handle<Value> HostObjectConstructCallback(const Arguments& args) {
	if (!args.IsConstructCall())
		return Undefined();
	
	HostObject* hostObject = NewHostObject(args);
	Handle<Object> object = args.This();
 
	object->SetInternalField(0, MakeWeakHostObject(hostObject));
 
	return Undefined();
}
 
Handle<Value> GetState(const Arguments& args) {
	Handle<Object> self = args.Holder();
 
	Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
	void* ptr = wrap->Value();
	CloudApp* cloudapp = static_cast<CloudApp*>(ptr);
 
	return Integer::New(cloudapp->getState());
}
 
Handle<Value> GetAppId(const Arguments& args) {
	Handle<Object> self = args.Holder();
 
	Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
	void* ptr = wrap->Value();
	CloudApp* cloudapp = static_cast<CloudApp*>(ptr);
 
	return Integer::New(cloudapp->getAppId());
} 
 
Handle<Value> Start(const Arguments& args) {
	Handle<Object> self = args.Holder();
 
	Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
	void* ptr = wrap->Value();
	CloudApp* cloudapp = static_cast<CloudApp*>(ptr);
 
	cloudapp->start();
 
	return Undefined();
}
 

 

 


