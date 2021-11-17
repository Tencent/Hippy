// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef INCLUDE_V8_ISOLATE_CALLBACKS_H_
#define INCLUDE_V8_ISOLATE_CALLBACKS_H_

#include <stddef.h>

#include <string>

#include "cppgc/common.h"
#include "v8-data.h"          // NOLINT(build/include_directory)
#include "v8-local-handle.h"  // NOLINT(build/include_directory)
#include "v8config.h"         // NOLINT(build/include_directory)

#if defined(V8_OS_WIN)
struct _EXCEPTION_POINTERS;
#endif

namespace v8 {

template <typename T>
class FunctionCallbackInfo;
class Isolate;
class Message;
class Module;
class Object;
class Promise;
class ScriptOrModule;
class String;
class UnboundScript;
class Value;

/**
 * A JIT code event is issued each time code is added, moved or removed.
 *
 * \note removal events are not currently issued.
 */
struct JitCodeEvent {
  enum EventType {
    CODE_ADDED,
    CODE_MOVED,
    CODE_REMOVED,
    CODE_ADD_LINE_POS_INFO,
    CODE_START_LINE_INFO_RECORDING,
    CODE_END_LINE_INFO_RECORDING
  };
  // Definition of the code position type. The "POSITION" type means the place
  // in the source code which are of interest when making stack traces to
  // pin-point the source location of a stack frame as close as possible.
  // The "STATEMENT_POSITION" means the place at the beginning of each
  // statement, and is used to indicate possible break locations.
  enum PositionType { POSITION, STATEMENT_POSITION };

  // There are three different kinds of CodeType, one for JIT code generated
  // by the optimizing compiler, one for byte code generated for the
  // interpreter, and one for code generated from Wasm. For JIT_CODE and
  // WASM_CODE, |code_start| points to the beginning of jitted assembly code,
  // while for BYTE_CODE events, |code_start| points to the first bytecode of
  // the interpreted function.
  enum CodeType { BYTE_CODE, JIT_CODE, WASM_CODE };

  // Type of event.
  EventType type;
  CodeType code_type;
  // Start of the instructions.
  void* code_start;
  // Size of the instructions.
  size_t code_len;
  // Script info for CODE_ADDED event.
  Local<UnboundScript> script;
  // User-defined data for *_LINE_INFO_* event. It's used to hold the source
  // code line information which is returned from the
  // CODE_START_LINE_INFO_RECORDING event. And it's passed to subsequent
  // CODE_ADD_LINE_POS_INFO and CODE_END_LINE_INFO_RECORDING events.
  void* user_data;

  struct name_t {
    // Name of the object associated with the code, note that the string is not
    // zero-terminated.
    const char* str;
    // Number of chars in str.
    size_t len;
  };

  struct line_info_t {
    // PC offset
    size_t offset;
    // Code position
    size_t pos;
    // The position type.
    PositionType position_type;
  };

  struct wasm_source_info_t {
    // Source file name.
    const char* filename;
    // Length of filename.
    size_t filename_size;
    // Line number table, which maps offsets of JITted code to line numbers of
    // source file.
    const line_info_t* line_number_table;
    // Number of entries in the line number table.
    size_t line_number_table_size;
  };

  wasm_source_info_t* wasm_source_info;

  union {
    // Only valid for CODE_ADDED.
    struct name_t name;

    // Only valid for CODE_ADD_LINE_POS_INFO
    struct line_info_t line_info;

    // New location of instructions. Only valid for CODE_MOVED.
    void* new_code_start;
  };

  Isolate* isolate;
};

/**
 * Option flags passed to the SetJitCodeEventHandler function.
 */
enum JitCodeEventOptions {
  kJitCodeEventDefault = 0,
  // Generate callbacks for already existent code.
  kJitCodeEventEnumExisting = 1
};

/**
 * Callback function passed to SetJitCodeEventHandler.
 *
 * \param event code add, move or removal event.
 */
using JitCodeEventHandler = void (*)(const JitCodeEvent* event);

// --- Garbage Collection Callbacks ---

/**
 * Applications can register callback functions which will be called before and
 * after certain garbage collection operations.  Allocations are not allowed in
 * the callback functions, you therefore cannot manipulate objects (set or
 * delete properties for example) since it is possible such operations will
 * result in the allocation of objects.
 */
enum GCType {
  kGCTypeScavenge = 1 << 0,
  kGCTypeMarkSweepCompact = 1 << 1,
  kGCTypeIncrementalMarking = 1 << 2,
  kGCTypeProcessWeakCallbacks = 1 << 3,
  kGCTypeAll = kGCTypeScavenge | kGCTypeMarkSweepCompact |
               kGCTypeIncrementalMarking | kGCTypeProcessWeakCallbacks
};

/**
 * GCCallbackFlags is used to notify additional information about the GC
 * callback.
 *   - kGCCallbackFlagConstructRetainedObjectInfos: The GC callback is for
 *     constructing retained object infos.
 *   - kGCCallbackFlagForced: The GC callback is for a forced GC for testing.
 *   - kGCCallbackFlagSynchronousPhantomCallbackProcessing: The GC callback
 *     is called synchronously without getting posted to an idle task.
 *   - kGCCallbackFlagCollectAllAvailableGarbage: The GC callback is called
 *     in a phase where V8 is trying to collect all available garbage
 *     (e.g., handling a low memory notification).
 *   - kGCCallbackScheduleIdleGarbageCollection: The GC callback is called to
 *     trigger an idle garbage collection.
 */
enum GCCallbackFlags {
  kNoGCCallbackFlags = 0,
  kGCCallbackFlagConstructRetainedObjectInfos = 1 << 1,
  kGCCallbackFlagForced = 1 << 2,
  kGCCallbackFlagSynchronousPhantomCallbackProcessing = 1 << 3,
  kGCCallbackFlagCollectAllAvailableGarbage = 1 << 4,
  kGCCallbackFlagCollectAllExternalMemory = 1 << 5,
  kGCCallbackScheduleIdleGarbageCollection = 1 << 6,
};

using GCCallback = void (*)(GCType type, GCCallbackFlags flags);

using InterruptCallback = void (*)(Isolate* isolate, void* data);

/**
 * This callback is invoked when the heap size is close to the heap limit and
 * V8 is likely to abort with out-of-memory error.
 * The callback can extend the heap limit by returning a value that is greater
 * than the current_heap_limit. The initial heap limit is the limit that was
 * set after heap setup.
 */
using NearHeapLimitCallback = size_t (*)(void* data, size_t current_heap_limit,
                                         size_t initial_heap_limit);

/**
 * Callback function passed to SetUnhandledExceptionCallback.
 */
#if defined(V8_OS_WIN)
using UnhandledExceptionCallback =
    int (*)(_EXCEPTION_POINTERS* exception_pointers);
#endif

// --- Counters Callbacks ---

using CounterLookupCallback = int* (*)(const char* name);

using CreateHistogramCallback = void* (*)(const char* name, int min, int max,
                                          size_t buckets);

using AddHistogramSampleCallback = void (*)(void* histogram, int sample);

/**
 * HostImportModuleDynamicallyCallback is called when we require the
 * embedder to load a module. This is used as part of the dynamic
 * import syntax.
 *
 * The referrer contains metadata about the script/module that calls
 * import.
 *
 * The specifier is the name of the module that should be imported.
 *
 * The embedder must compile, instantiate, evaluate the Module, and
 * obtain its namespace object.
 *
 * The Promise returned from this function is forwarded to userland
 * JavaScript. The embedder must resolve this promise with the module
 * namespace object. In case of an exception, the embedder must reject
 * this promise with the exception. If the promise creation itself
 * fails (e.g. due to stack overflow), the embedder must propagate
 * that exception by returning an empty MaybeLocal.
 */
using HostImportModuleDynamicallyCallback V8_DEPRECATED(
    "Use HostImportModuleDynamicallyWithImportAssertionsCallback instead") =
    MaybeLocal<Promise> (*)(Local<Context> context,
                            Local<ScriptOrModule> referrer,
                            Local<String> specifier);

// --- Exceptions ---

using FatalErrorCallback = void (*)(const char* location, const char* message);

using OOMErrorCallback = void (*)(const char* location, bool is_heap_oom);

using MessageCallback = void (*)(Local<Message> message, Local<Value> data);

// --- Tracing ---

enum LogEventStatus : int { kStart = 0, kEnd = 1, kStamp = 2 };
using LogEventCallback = void (*)(const char* name,
                                  int /* LogEventStatus */ status);

// --- Crashkeys Callback ---
enum class CrashKeyId {
  kIsolateAddress,
  kReadonlySpaceFirstPageAddress,
  kMapSpaceFirstPageAddress,
  kCodeSpaceFirstPageAddress,
  kDumpType,
};

using AddCrashKeyCallback = void (*)(CrashKeyId id, const std::string& value);

// --- Enter/Leave Script Callback ---
using BeforeCallEnteredCallback = void (*)(Isolate*);
using CallCompletedCallback = void (*)(Isolate*);

// --- AllowCodeGenerationFromStrings callbacks ---

/**
 * Callback to check if code generation from strings is allowed. See
 * Context::AllowCodeGenerationFromStrings.
 */
using AllowCodeGenerationFromStringsCallback = bool (*)(Local<Context> context,
                                                        Local<String> source);

struct ModifyCodeGenerationFromStringsResult {
  // If true, proceed with the codegen algorithm. Otherwise, block it.
  bool codegen_allowed = false;
  // Overwrite the original source with this string, if present.
  // Use the original source if empty.
  // This field is considered only if codegen_allowed is true.
  MaybeLocal<String> modified_source;
};

/**
 * Access type specification.
 */
enum AccessType {
  ACCESS_GET,
  ACCESS_SET,
  ACCESS_HAS,
  ACCESS_DELETE,
  ACCESS_KEYS
};

// --- Failed Access Check Callback ---

using FailedAccessCheckCallback = void (*)(Local<Object> target,
                                           AccessType type, Local<Value> data);

/**
 * Callback to check if codegen is allowed from a source object, and convert
 * the source to string if necessary. See: ModifyCodeGenerationFromStrings.
 */
using ModifyCodeGenerationFromStringsCallback =
    ModifyCodeGenerationFromStringsResult (*)(Local<Context> context,
                                              Local<Value> source);
using ModifyCodeGenerationFromStringsCallback2 =
    ModifyCodeGenerationFromStringsResult (*)(Local<Context> context,
                                              Local<Value> source,
                                              bool is_code_like);

// --- WebAssembly compilation callbacks ---
using ExtensionCallback = bool (*)(const FunctionCallbackInfo<Value>&);

using AllowWasmCodeGenerationCallback = bool (*)(Local<Context> context,
                                                 Local<String> source);

// --- Callback for APIs defined on v8-supported objects, but implemented
// by the embedder. Example: WebAssembly.{compile|instantiate}Streaming ---
using ApiImplementationCallback = void (*)(const FunctionCallbackInfo<Value>&);

// --- Callback for WebAssembly.compileStreaming ---
using WasmStreamingCallback = void (*)(const FunctionCallbackInfo<Value>&);

// --- Callback for loading source map file for Wasm profiling support
using WasmLoadSourceMapCallback = Local<String> (*)(Isolate* isolate,
                                                    const char* name);

// --- Callback for checking if WebAssembly Simd is enabled ---
using WasmSimdEnabledCallback = bool (*)(Local<Context> context);

// --- Callback for checking if WebAssembly exceptions are enabled ---
using WasmExceptionsEnabledCallback = bool (*)(Local<Context> context);

// --- Callback for checking if the SharedArrayBuffer constructor is enabled ---
using SharedArrayBufferConstructorEnabledCallback =
    bool (*)(Local<Context> context);

/**
 * HostImportModuleDynamicallyWithImportAssertionsCallback is called when we
 * require the embedder to load a module. This is used as part of the dynamic
 * import syntax.
 *
 * The referrer contains metadata about the script/module that calls
 * import.
 *
 * The specifier is the name of the module that should be imported.
 *
 * The import_assertions are import assertions for this request in the form:
 * [key1, value1, key2, value2, ...] where the keys and values are of type
 * v8::String. Note, unlike the FixedArray passed to ResolveModuleCallback and
 * returned from ModuleRequest::GetImportAssertions(), this array does not
 * contain the source Locations of the assertions.
 *
 * The embedder must compile, instantiate, evaluate the Module, and
 * obtain its namespace object.
 *
 * The Promise returned from this function is forwarded to userland
 * JavaScript. The embedder must resolve this promise with the module
 * namespace object. In case of an exception, the embedder must reject
 * this promise with the exception. If the promise creation itself
 * fails (e.g. due to stack overflow), the embedder must propagate
 * that exception by returning an empty MaybeLocal.
 */
using HostImportModuleDynamicallyWithImportAssertionsCallback =
    MaybeLocal<Promise> (*)(Local<Context> context,
                            Local<ScriptOrModule> referrer,
                            Local<String> specifier,
                            Local<FixedArray> import_assertions);

/**
 * HostInitializeImportMetaObjectCallback is called the first time import.meta
 * is accessed for a module. Subsequent access will reuse the same value.
 *
 * The method combines two implementation-defined abstract operations into one:
 * HostGetImportMetaProperties and HostFinalizeImportMeta.
 *
 * The embedder should use v8::Object::CreateDataProperty to add properties on
 * the meta object.
 */
using HostInitializeImportMetaObjectCallback = void (*)(Local<Context> context,
                                                        Local<Module> module,
                                                        Local<Object> meta);

/**
 * PrepareStackTraceCallback is called when the stack property of an error is
 * first accessed. The return value will be used as the stack value. If this
 * callback is registed, the |Error.prepareStackTrace| API will be disabled.
 * |sites| is an array of call sites, specified in
 * https://v8.dev/docs/stack-trace-api
 */
using PrepareStackTraceCallback = MaybeLocal<Value> (*)(Local<Context> context,
                                                        Local<Value> error,
                                                        Local<Array> sites);

}  // namespace v8

#endif  // INCLUDE_V8_ISOLATE_CALLBACKS_H_
