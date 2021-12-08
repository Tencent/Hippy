abstract class InstanceLifecycleEventListener {
  void onInstanceLoad(int instanceId);

  void onInstanceResume(int instanceId);

  void onInstancePause(int instanceId);

  void onInstanceDestroy(int instanceId);
}

abstract class EngineLifecycleEventListener {
  void onEngineResume();

  void onEnginePause();
}
