// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef INCLUDE_V8_PERSISTENT_HANDLE_H_
#define INCLUDE_V8_PERSISTENT_HANDLE_H_

#include "v8-internal.h"            // NOLINT(build/include_directory)
#include "v8-local-handle.h"        // NOLINT(build/include_directory)
#include "v8-weak-callback-info.h"  // NOLINT(build/include_directory)
#include "v8config.h"               // NOLINT(build/include_directory)

namespace v8 {

class Isolate;
template <class K, class V, class T>
class PersistentValueMapBase;
template <class V, class T>
class PersistentValueVector;
template <class T>
class Global;
template <class T>
class PersistentBase;
template <class K, class V, class T>
class PersistentValueMap;
class Value;

namespace api_internal {
V8_EXPORT Value* Eternalize(v8::Isolate* isolate, Value* handle);
V8_EXPORT internal::Address* CopyGlobalReference(internal::Address* from);
V8_EXPORT void DisposeGlobal(internal::Address* global_handle);
V8_EXPORT void MakeWeak(internal::Address** location_addr);
V8_EXPORT void* ClearWeak(internal::Address* location);
V8_EXPORT void AnnotateStrongRetainer(internal::Address* location,
                                      const char* label);
V8_EXPORT internal::Address* GlobalizeReference(internal::Isolate* isolate,
                                                internal::Address* handle);
V8_EXPORT void MoveGlobalReference(internal::Address** from,
                                   internal::Address** to);
}  // namespace api_internal

/**
 * Eternal handles are set-once handles that live for the lifetime of the
 * isolate.
 */
template <class T>
class Eternal {
 public:
  V8_INLINE Eternal() : val_(nullptr) {}
  template <class S>
  V8_INLINE Eternal(Isolate* isolate, Local<S> handle) : val_(nullptr) {
    Set(isolate, handle);
  }
  // Can only be safely called if already set.
  V8_INLINE Local<T> Get(Isolate* isolate) const {
    // The eternal handle will never go away, so as with the roots, we don't
    // even need to open a handle.
    return Local<T>(val_);
  }

  V8_INLINE bool IsEmpty() const { return val_ == nullptr; }

  template <class S>
  void Set(Isolate* isolate, Local<S> handle) {
    static_assert(std::is_base_of<T, S>::value, "type check");
    val_ = reinterpret_cast<T*>(
        api_internal::Eternalize(isolate, reinterpret_cast<Value*>(*handle)));
  }

 private:
  T* val_;
};

namespace api_internal {
V8_EXPORT void MakeWeak(internal::Address* location, void* data,
                        WeakCallbackInfo<void>::Callback weak_callback,
                        WeakCallbackType type);
}  // namespace api_internal

/**
 * An object reference that is independent of any handle scope.  Where
 * a Local handle only lives as long as the HandleScope in which it was
 * allocated, a PersistentBase handle remains valid until it is explicitly
 * disposed using Reset().
 *
 * A persistent handle contains a reference to a storage cell within
 * the V8 engine which holds an object value and which is updated by
 * the garbage collector whenever the object is moved.  A new storage
 * cell can be created using the constructor or PersistentBase::Reset and
 * existing handles can be disposed using PersistentBase::Reset.
 *
 */
template <class T>
class PersistentBase {
 public:
  /**
   * If non-empty, destroy the underlying storage cell
   * IsEmpty() will return true after this call.
   */
  V8_INLINE void Reset();

  /**
   * If non-empty, destroy the underlying storage cell
   * and create a new one with the contents of other if other is non empty
   */
  template <class S>
  V8_INLINE void Reset(Isolate* isolate, const Local<S>& other);

  /**
   * If non-empty, destroy the underlying storage cell
   * and create a new one with the contents of other if other is non empty
   */
  template <class S>
  V8_INLINE void Reset(Isolate* isolate, const PersistentBase<S>& other);

  V8_INLINE bool IsEmpty() const { return val_ == nullptr; }
  V8_INLINE void Empty() { val_ = 0; }

  V8_INLINE Local<T> Get(Isolate* isolate) const {
    return Local<T>::New(isolate, *this);
  }

  template <class S>
  V8_INLINE bool operator==(const PersistentBase<S>& that) const {
    internal::Address* a = reinterpret_cast<internal::Address*>(this->val_);
    internal::Address* b = reinterpret_cast<internal::Address*>(that.val_);
    if (a == nullptr) return b == nullptr;
    if (b == nullptr) return false;
    return *a == *b;
  }

  template <class S>
  V8_INLINE bool operator==(const Local<S>& that) const {
    internal::Address* a = reinterpret_cast<internal::Address*>(this->val_);
    internal::Address* b = reinterpret_cast<internal::Address*>(that.val_);
    if (a == nullptr) return b == nullptr;
    if (b == nullptr) return false;
    return *a == *b;
  }

  template <class S>
  V8_INLINE bool operator!=(const PersistentBase<S>& that) const {
    return !operator==(that);
  }

  template <class S>
  V8_INLINE bool operator!=(const Local<S>& that) const {
    return !operator==(that);
  }

  /**
   * Install a finalization callback on this object.
   * NOTE: There is no guarantee as to *when* or even *if* the callback is
   * invoked. The invocation is performed solely on a best effort basis.
   * As always, GC-based finalization should *not* be relied upon for any
   * critical form of resource management!
   *
   * The callback is supposed to reset the handle. No further V8 API may be
   * called in this callback. In case additional work involving V8 needs to be
   * done, a second callback can be scheduled using
   * WeakCallbackInfo<void>::SetSecondPassCallback.
   */
  template <typename P>
  V8_INLINE void SetWeak(P* parameter,
                         typename WeakCallbackInfo<P>::Callback callback,
                         WeakCallbackType type);

  /**
   * Turns this handle into a weak phantom handle without finalization callback.
   * The handle will be reset automatically when the garbage collector detects
   * that the object is no longer reachable.
   * A related function Isolate::NumberOfPhantomHandleResetsSinceLastCall
   * returns how many phantom handles were reset by the garbage collector.
   */
  V8_INLINE void SetWeak();

  template <typename P>
  V8_INLINE P* ClearWeak();

  // TODO(dcarney): remove this.
  V8_INLINE void ClearWeak() { ClearWeak<void>(); }

  /**
   * Annotates the strong handle with the given label, which is then used by the
   * heap snapshot generator as a name of the edge from the root to the handle.
   * The function does not take ownership of the label and assumes that the
   * label is valid as long as the handle is valid.
   */
  V8_INLINE void AnnotateStrongRetainer(const char* label);

  /** Returns true if the handle's reference is weak.  */
  V8_INLINE bool IsWeak() const;

  /**
   * Assigns a wrapper class ID to the handle.
   */
  V8_INLINE void SetWrapperClassId(uint16_t class_id);

  /**
   * Returns the class ID previously assigned to this handle or 0 if no class ID
   * was previously assigned.
   */
  V8_INLINE uint16_t WrapperClassId() const;

  PersistentBase(const PersistentBase& other) = delete;
  void operator=(const PersistentBase&) = delete;

 private:
  friend class Isolate;
  friend class Utils;
  template <class F>
  friend class Local;
  template <class F1, class F2>
  friend class Persistent;
  template <class F>
  friend class Global;
  template <class F>
  friend class PersistentBase;
  template <class F>
  friend class ReturnValue;
  template <class F1, class F2, class F3>
  friend class PersistentValueMapBase;
  template <class F1, class F2>
  friend class PersistentValueVector;
  friend class Object;

  explicit V8_INLINE PersistentBase(T* val) : val_(val) {}
  V8_INLINE static T* New(Isolate* isolate, T* that);

  T* val_;
};

/**
 * Default traits for Persistent. This class does not allow
 * use of the copy constructor or assignment operator.
 * At present kResetInDestructor is not set, but that will change in a future
 * version.
 */
template <class T>
class NonCopyablePersistentTraits {
 public:
  using NonCopyablePersistent = Persistent<T, NonCopyablePersistentTraits<T>>;
  static const bool kResetInDestructor = false;
  template <class S, class M>
  V8_INLINE static void Copy(const Persistent<S, M>& source,
                             NonCopyablePersistent* dest) {
    static_assert(sizeof(S) < 0,
                  "NonCopyablePersistentTraits::Copy is not instantiable");
  }
};

/**
 * Helper class traits to allow copying and assignment of Persistent.
 * This will clone the contents of storage cell, but not any of the flags, etc.
 */
template <class T>
struct CopyablePersistentTraits {
  using CopyablePersistent = Persistent<T, CopyablePersistentTraits<T>>;
  static const bool kResetInDestructor = true;
  template <class S, class M>
  static V8_INLINE void Copy(const Persistent<S, M>& source,
                             CopyablePersistent* dest) {
    // do nothing, just allow copy
  }
};

/**
 * A PersistentBase which allows copy and assignment.
 *
 * Copy, assignment and destructor behavior is controlled by the traits
 * class M.
 *
 * Note: Persistent class hierarchy is subject to future changes.
 */
template <class T, class M>
class Persistent : public PersistentBase<T> {
 public:
  /**
   * A Persistent with no storage cell.
   */
  V8_INLINE Persistent() : PersistentBase<T>(nullptr) {}
  /**
   * Construct a Persistent from a Local.
   * When the Local is non-empty, a new storage cell is created
   * pointing to the same object, and no flags are set.
   */
  template <class S>
  V8_INLINE Persistent(Isolate* isolate, Local<S> that)
      : PersistentBase<T>(PersistentBase<T>::New(isolate, *that)) {
    static_assert(std::is_base_of<T, S>::value, "type check");
  }
  /**
   * Construct a Persistent from a Persistent.
   * When the Persistent is non-empty, a new storage cell is created
   * pointing to the same object, and no flags are set.
   */
  template <class S, class M2>
  V8_INLINE Persistent(Isolate* isolate, const Persistent<S, M2>& that)
      : PersistentBase<T>(PersistentBase<T>::New(isolate, *that)) {
    static_assert(std::is_base_of<T, S>::value, "type check");
  }
  /**
   * The copy constructors and assignment operator create a Persistent
   * exactly as the Persistent constructor, but the Copy function from the
   * traits class is called, allowing the setting of flags based on the
   * copied Persistent.
   */
  V8_INLINE Persistent(const Persistent& that) : PersistentBase<T>(nullptr) {
    Copy(that);
  }
  template <class S, class M2>
  V8_INLINE Persistent(const Persistent<S, M2>& that) : PersistentBase<T>(0) {
    Copy(that);
  }
  V8_INLINE Persistent& operator=(const Persistent& that) {
    Copy(that);
    return *this;
  }
  template <class S, class M2>
  V8_INLINE Persistent& operator=(const Persistent<S, M2>& that) {
    Copy(that);
    return *this;
  }
  /**
   * The destructor will dispose the Persistent based on the
   * kResetInDestructor flags in the traits class.  Since not calling dispose
   * can result in a memory leak, it is recommended to always set this flag.
   */
  V8_INLINE ~Persistent() {
    if (M::kResetInDestructor) this->Reset();
  }

  // TODO(dcarney): this is pretty useless, fix or remove
  template <class S>
  V8_INLINE static Persistent<T>& Cast(const Persistent<S>& that) {
#ifdef V8_ENABLE_CHECKS
    // If we're going to perform the type check then we have to check
    // that the handle isn't empty before doing the checked cast.
    if (!that.IsEmpty()) T::Cast(*that);
#endif
    return reinterpret_cast<Persistent<T>&>(const_cast<Persistent<S>&>(that));
  }

  // TODO(dcarney): this is pretty useless, fix or remove
  template <class S>
  V8_INLINE Persistent<S>& As() const {
    return Persistent<S>::Cast(*this);
  }

 private:
  friend class Isolate;
  friend class Utils;
  template <class F>
  friend class Local;
  template <class F1, class F2>
  friend class Persistent;
  template <class F>
  friend class ReturnValue;

  explicit V8_INLINE Persistent(T* that) : PersistentBase<T>(that) {}
  V8_INLINE T* operator*() const { return this->val_; }
  template <class S, class M2>
  V8_INLINE void Copy(const Persistent<S, M2>& that);
};

/**
 * A PersistentBase which has move semantics.
 *
 * Note: Persistent class hierarchy is subject to future changes.
 */
template <class T>
class Global : public PersistentBase<T> {
 public:
  /**
   * A Global with no storage cell.
   */
  V8_INLINE Global() : PersistentBase<T>(nullptr) {}

  /**
   * Construct a Global from a Local.
   * When the Local is non-empty, a new storage cell is created
   * pointing to the same object, and no flags are set.
   */
  template <class S>
  V8_INLINE Global(Isolate* isolate, Local<S> that)
      : PersistentBase<T>(PersistentBase<T>::New(isolate, *that)) {
    static_assert(std::is_base_of<T, S>::value, "type check");
  }

  /**
   * Construct a Global from a PersistentBase.
   * When the Persistent is non-empty, a new storage cell is created
   * pointing to the same object, and no flags are set.
   */
  template <class S>
  V8_INLINE Global(Isolate* isolate, const PersistentBase<S>& that)
      : PersistentBase<T>(PersistentBase<T>::New(isolate, that.val_)) {
    static_assert(std::is_base_of<T, S>::value, "type check");
  }

  /**
   * Move constructor.
   */
  V8_INLINE Global(Global&& other);

  V8_INLINE ~Global() { this->Reset(); }

  /**
   * Move via assignment.
   */
  template <class S>
  V8_INLINE Global& operator=(Global<S>&& rhs);

  /**
   * Pass allows returning uniques from functions, etc.
   */
  Global Pass() { return static_cast<Global&&>(*this); }

  /*
   * For compatibility with Chromium's base::Bind (base::Passed).
   */
  using MoveOnlyTypeForCPP03 = void;

  Global(const Global&) = delete;
  void operator=(const Global&) = delete;

 private:
  template <class F>
  friend class ReturnValue;
  V8_INLINE T* operator*() const { return this->val_; }
};

// UniquePersistent is an alias for Global for historical reason.
template <class T>
using UniquePersistent = Global<T>;

/**
 * Interface for iterating through all the persistent handles in the heap.
 */
class V8_EXPORT PersistentHandleVisitor {
 public:
  virtual ~PersistentHandleVisitor() = default;
  virtual void VisitPersistentHandle(Persistent<Value>* value,
                                     uint16_t class_id) {}
};

template <class T>
T* PersistentBase<T>::New(Isolate* isolate, T* that) {
  if (that == nullptr) return nullptr;
  internal::Address* p = reinterpret_cast<internal::Address*>(that);
  return reinterpret_cast<T*>(api_internal::GlobalizeReference(
      reinterpret_cast<internal::Isolate*>(isolate), p));
}

template <class T, class M>
template <class S, class M2>
void Persistent<T, M>::Copy(const Persistent<S, M2>& that) {
  static_assert(std::is_base_of<T, S>::value, "type check");
  this->Reset();
  if (that.IsEmpty()) return;
  internal::Address* p = reinterpret_cast<internal::Address*>(that.val_);
  this->val_ = reinterpret_cast<T*>(api_internal::CopyGlobalReference(p));
  M::Copy(that, this);
}

template <class T>
bool PersistentBase<T>::IsWeak() const {
  using I = internal::Internals;
  if (this->IsEmpty()) return false;
  return I::GetNodeState(reinterpret_cast<internal::Address*>(this->val_)) ==
         I::kNodeStateIsWeakValue;
}

template <class T>
void PersistentBase<T>::Reset() {
  if (this->IsEmpty()) return;
  api_internal::DisposeGlobal(reinterpret_cast<internal::Address*>(this->val_));
  val_ = nullptr;
}

/**
 * If non-empty, destroy the underlying storage cell
 * and create a new one with the contents of other if other is non empty
 */
template <class T>
template <class S>
void PersistentBase<T>::Reset(Isolate* isolate, const Local<S>& other) {
  static_assert(std::is_base_of<T, S>::value, "type check");
  Reset();
  if (other.IsEmpty()) return;
  this->val_ = New(isolate, other.val_);
}

/**
 * If non-empty, destroy the underlying storage cell
 * and create a new one with the contents of other if other is non empty
 */
template <class T>
template <class S>
void PersistentBase<T>::Reset(Isolate* isolate,
                              const PersistentBase<S>& other) {
  static_assert(std::is_base_of<T, S>::value, "type check");
  Reset();
  if (other.IsEmpty()) return;
  this->val_ = New(isolate, other.val_);
}

template <class T>
template <typename P>
V8_INLINE void PersistentBase<T>::SetWeak(
    P* parameter, typename WeakCallbackInfo<P>::Callback callback,
    WeakCallbackType type) {
  using Callback = WeakCallbackInfo<void>::Callback;
#if (__GNUC__ >= 8) && !defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wcast-function-type"
#endif
  api_internal::MakeWeak(reinterpret_cast<internal::Address*>(this->val_),
                         parameter, reinterpret_cast<Callback>(callback), type);
#if (__GNUC__ >= 8) && !defined(__clang__)
#pragma GCC diagnostic pop
#endif
}

template <class T>
void PersistentBase<T>::SetWeak() {
  api_internal::MakeWeak(reinterpret_cast<internal::Address**>(&this->val_));
}

template <class T>
template <typename P>
P* PersistentBase<T>::ClearWeak() {
  return reinterpret_cast<P*>(api_internal::ClearWeak(
      reinterpret_cast<internal::Address*>(this->val_)));
}

template <class T>
void PersistentBase<T>::AnnotateStrongRetainer(const char* label) {
  api_internal::AnnotateStrongRetainer(
      reinterpret_cast<internal::Address*>(this->val_), label);
}

template <class T>
void PersistentBase<T>::SetWrapperClassId(uint16_t class_id) {
  using I = internal::Internals;
  if (this->IsEmpty()) return;
  internal::Address* obj = reinterpret_cast<internal::Address*>(this->val_);
  uint8_t* addr = reinterpret_cast<uint8_t*>(obj) + I::kNodeClassIdOffset;
  *reinterpret_cast<uint16_t*>(addr) = class_id;
}

template <class T>
uint16_t PersistentBase<T>::WrapperClassId() const {
  using I = internal::Internals;
  if (this->IsEmpty()) return 0;
  internal::Address* obj = reinterpret_cast<internal::Address*>(this->val_);
  uint8_t* addr = reinterpret_cast<uint8_t*>(obj) + I::kNodeClassIdOffset;
  return *reinterpret_cast<uint16_t*>(addr);
}

template <class T>
Global<T>::Global(Global&& other) : PersistentBase<T>(other.val_) {
  if (other.val_ != nullptr) {
    api_internal::MoveGlobalReference(
        reinterpret_cast<internal::Address**>(&other.val_),
        reinterpret_cast<internal::Address**>(&this->val_));
    other.val_ = nullptr;
  }
}

template <class T>
template <class S>
Global<T>& Global<T>::operator=(Global<S>&& rhs) {
  static_assert(std::is_base_of<T, S>::value, "type check");
  if (this != &rhs) {
    this->Reset();
    if (rhs.val_ != nullptr) {
      this->val_ = rhs.val_;
      api_internal::MoveGlobalReference(
          reinterpret_cast<internal::Address**>(&rhs.val_),
          reinterpret_cast<internal::Address**>(&this->val_));
      rhs.val_ = nullptr;
    }
  }
  return *this;
}

}  // namespace v8

#endif  // INCLUDE_V8_PERSISTENT_HANDLE_H_
