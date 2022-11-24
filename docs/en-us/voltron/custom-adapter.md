# Custom Adapters

If these third-party base libraries are integrated directly in the Voltron SDK, it is likely to conflict with the actual situation of your project. In order to solve this contradiction, Voltron SDK will interface all the basic capabilities, abstracted as Adapter, to facilitate the implementation of business injection. Meanwhile, for most of the basic capabilities, we also implement a default yet simplest solution.

Voltron SDK now provides these Adapters:

- `VoltronHttpAdapter`：Http request Adapter.
- `VoltronExceptionHandlerAdapter`：engine and JS exception handling Adapter.
- `VoltronStorageAdapter`：database (KEY-VALUE) Adapter.

# VoltronHttpAdapter

Voltron SDK provides a default implementation of DefaultHttpAdapter. If DefaultHttpAdapter does not meet your needs, please refer to the DefaultHttpAdapter code to access the VoltronHttpAdapter implementation.

# VoltronExceptionHandlerAdapter

Voltron SDK provides a default empty implementation of DefaultExceptionHandler. Voltron SDK will catch these JS exceptions and then throw them to the user through VoltronExceptionHandlerAdapter.

# VoltronStorageAdapter

Voltron SDK provides a default implementation of DefaultStorageAdapter.


