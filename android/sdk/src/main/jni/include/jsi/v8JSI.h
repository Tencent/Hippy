#include "v8/v8.h"

class HostObject{
    virture void get(string propertyName)=0;
}
void createHostObject(shared_ptr<Runtime> runtime,HostObject hostObject,string objectName);