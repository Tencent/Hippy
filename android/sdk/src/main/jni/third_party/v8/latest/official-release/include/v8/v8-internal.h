// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef INCLUDE_V8_INTERNAL_H_
#define INCLUDE_V8_INTERNAL_H_

#include <stddef.h>
#include <stdint.h>
#include <string.h>
#include <type_traits>

#include "v8-version.h"  // NOLINT(build/include_directory)
#include "v8config.h"    // NOLINT(build/include_directory)

namespace v8 {

class Array;
class Context;
class Data;
class Isolate;
template <typename T>
class Local;

namespace internal {

class Isolate;

typedef uintptr_t Address;
static const Address kNullAddress = 0;

/**
 * Configuration of tagging scheme.
 */
const int kApiSystemPointerSize = sizeof(void*);
const int kApiDoubleSize = sizeof(double);
const int kApiInt32Size = sizeof(int32_t);
const int kApiInt64Size = sizeof(int64_t);
const int kApiSizetSize = sizeof(size_t);

// Tag information for HeapObject.
const int kHeapObjectTag = 1;
const int kWeakHeapObjectTag = 3;
const int kHeapObjectTagSize = 2;
const intptr_t kHeapObjectTagMask = (1 << kHeapObjectTagSize) - 1;

// Tag information for fowarding pointers stored in object headers.
// 0b00 at the lowest 2 bits in the header indicates that the map word is a
// forwarding pointer.
const int kForwardingTag = 0;
const int kForwardingTagSize = 2;
const intptr_t kForwardingTagMask = (1 << kForwardingTagSize) - 1;

// Tag information for Smi.
const int kSmiTag = 0;
const int kSmiTagSize = 1;
const intptr_t kSmiTagMask = (1 << kSmiTagSize) - 1;

template <size_t tagged_ptr_size>
struct SmiTagging;

constexpr intptr_t kIntptrAllBitsSet = intptr_t{-1};
constexpr uintptr_t kUintptrAllBitsSet =
    static_cast<uintptr_t>(kIntptrAllBitsSet);

// Smi constants for systems where tagged pointer is a 32-bit value.
template <>
struct SmiTagging<4> {
  enum { kSmiShiftSize = 0, kSmiValueSize = 31 };

  static constexpr intptr_t kSmiMinValue =
      static_cast<intptr_t>(kUintptrAllBitsSet << (kSmiValueSize - 1));
  static constexpr intptr_t kSmiMaxValue = -(kSmiMinValue + 1);

  V8_INLINE static int SmiToInt(const internal::Address value) {
    int shift_bits = kSmiTagSize + kSmiShiftSize;
    // Truncate and shift down (requires >> to be sign extending).
    return static_cast<int32_t>(static_cast<uint32_t>(value)) >> shift_bits;
  }
  V8_INLINE static constexpr bool IsValidSmi(intptr_t value) {
    // Is value in range [kSmiMinValue, kSmiMaxValue].
    // Use unsigned operations in order to avoid undefined behaviour in case of
    // signed integer overflow.
    return (static_cast<uintptr_t>(value) -
            static_cast<uintptr_t>(kSmiMinValue)) <=
           (static_cast<uintptr_t>(kSmiMaxValue) -
            static_cast<uintptr_t>(kSmiMinValue));
  }
};

// Smi constants for systems where tagged pointer is a 64-bit value.
template <>
struct SmiTagging<8> {
  enum { kSmiShiftSize = 31, kSmiValueSize = 32 };

  static constexpr intptr_t kSmiMinValue =
      static_cast<intptr_t>(kUintptrAllBitsSet << (kSmiValueSize - 1));
  static constexpr intptr_t kSmiMaxValue = -(kSmiMinValue + 1);

  V8_INLINE static int SmiToInt(const internal::Address value) {
    int shift_bits = kSmiTagSize + kSmiShiftSize;
    // Shift down and throw away top 32 bits.
    return static_cast<int>(static_cast<intptr_t>(value) >> shift_bits);
  }
  V8_INLINE static constexpr bool IsValidSmi(intptr_t value) {
    // To be representable as a long smi, the value must be a 32-bit integer.
    return (value == static_cast<int32_t>(value));
  }
};

#ifdef V8_COMPRESS_POINTERS
static_assert(
    kApiSystemPointerSize == kApiInt64Size,
    "Pointer compression can be enabled only for 64-bit architectures");
const int kApiTaggedSize = kApiInt32Size;
#else
const int kApiTaggedSize = kApiSystemPointerSize;
#endif

constexpr bool PointerCompressionIsEnabled() {
  return kApiTaggedSize != kApiSystemPointerSize;
}

constexpr bool HeapSandboxIsEnabled() {
#ifdef V8_HEAP_SANDBOX
  return true;
#else
  return false;
#endif
}

using ExternalPointer_t = Address;

// If the heap sandbox is enabled, these tag values will be ORed with the
// external pointers in the external pointer table to prevent use of pointers of
// the wrong type. When a pointer is loaded, it is ANDed with the inverse of the
// expected type's tag. The tags are constructed in a way that guarantees that a
// failed type check will result in one or more of the top bits of the pointer
// to be set, rendering the pointer inacessible. This construction allows
// performing the type check and removing GC marking bits from the pointer at
// the same time.
enum ExternalPointerTag : uint64_t {
  kExternalPointerNullTag = 0x0000000000000000,
  kExternalStringResourceTag = 0x00ff000000000000,       // 0b000000011111111
  kExternalStringResourceDataTag = 0x017f000000000000,   // 0b000000101111111
  kForeignForeignAddressTag = 0x01bf000000000000,        // 0b000000110111111
  kNativeContextMicrotaskQueueTag = 0x01df000000000000,  // 0b000000111011111
  kEmbedderDataSlotPayloadTag = 0x01ef000000000000,      // 0b000000111101111
  kCodeEntryPointTag = 0x01f7000000000000,               // 0b000000111110111
};

constexpr uint64_t kExternalPointerTagMask = 0xffff000000000000;

#ifdef V8_31BIT_SMIS_ON_64BIT_ARCH
using PlatformSmiTagging = SmiTagging<kApiInt32Size>;
#else
using PlatformSmiTagging = SmiTagging<kApiTaggedSize>;
#endif

// TODO(ishell): Consinder adding kSmiShiftBits = kSmiShiftSize + kSmiTagSize
// since it's used much more often than the inividual constants.
const int kSmiShiftSize = PlatformSmiTagging::kSmiShiftSize;
const int kSmiValueSize = PlatformSmiTagging::kSmiValueSize;
const int kSmiMinValue = static_cast<int>(PlatformSmiTagging::kSmiMinValue);
const int kSmiMaxValue = static_cast<int>(PlatformSmiTagging::kSmiMaxValue);
constexpr bool SmiValuesAre31Bits() { return kSmiValueSize == 31; }
constexpr bool SmiValuesAre32Bits() { return kSmiValueSize == 32; }

V8_INLINE static constexpr internal::Address IntToSmi(int value) {
  return (static_cast<Address>(value) << (kSmiTagSize + kSmiShiftSize)) |
         kSmiTag;
}

// Converts encoded external pointer to address.
V8_EXPORT Address DecodeExternalPointerImpl(const Isolate* isolate,
                                            ExternalPointer_t pointer,
                                            ExternalPointerTag tag);

// {obj} must be the raw tagged pointer representation of a HeapObject
// that's guaranteed to never be in ReadOnlySpace.
V8_EXPORT internal::Isolate* IsolateFromNeverReadOnlySpaceObject(Address obj);

// Returns if we need to throw when an error occurs. This infers the language
// mode based on the current context and the closure. This returns true if the
// language mode is strict.
V8_EXPORT bool ShouldThrowOnError(v8::internal::Isolate* isolate);

V8_EXPORT bool CanHaveInternalField(int instance_type);

/**
 * This class exports constants and functionality from within v8 that
 * is necessary to implement inline functions in the v8 api.  Don't
 * depend on functions and constants defined here.
 */
class Internals {
#ifdef V8_MAP_PACKING
  V8_INLINE static constexpr internal::Address UnpackMapWord(
      internal::Address mapword) {
    // TODO(wenyuzhao): Clear header metadata.
    return mapword ^ kMapWordXorMask;
  }
#endif

 public:
  // These values match non-compiler-dependent values defined within
  // the implementation of v8.
  static const int kHeapObjectMapOffset = 0;
  static const int kMapInstanceTypeOffset = 1 * kApiTaggedSize + kApiInt32Size;
  static const int kStringResourceOffset =
      1 * kApiTaggedSize + 2 * kApiInt32Size;

  static const int kOddballKindOffset = 4 * kApiTaggedSize + kApiDoubleSize;
  static const int kJSObjectHeaderSize = 3 * kApiTaggedSize;
  static const int kFixedArrayHeaderSize = 2 * kApiTaggedSize;
  static const int kEmbedderDataArrayHeaderSize = 2 * kApiTaggedSize;
  static const int kEmbedderDataSlotSize = kApiSystemPointerSize;
#ifdef V8_HEAP_SANDBOX
  static const int kEmbedderDataSlotRawPayloadOffset = kApiTaggedSize;
#endif
  static const int kNativeContextEmbedderDataOffset = 6 * kApiTaggedSize;
  static const int kFullStringRepresentationMask = 0x0f;
  static const int kStringEncodingMask = 0x8;
  static const int kExternalTwoByteRepresentationTag = 0x02;
  static const int kExternalOneByteRepresentationTag = 0x0a;

  static const uint32_t kNumIsolateDataSlots = 4;
  static const int kStackGuardSize = 7 * kApiSystemPointerSize;
  static const int kBuiltinTier0EntryTableSize = 13 * kApiSystemPointerSize;
  static const int kBuiltinTier0TableSize = 13 * kApiSystemPointerSize;

  // IsolateData layout guarantees.
  static const int kIsolateCageBaseOffset = 0;
  static const int kIsolateStackGuardOffset =
      kIsolateCageBaseOffset + kApiSystemPointerSize;
  static const int kBuiltinTier0EntryTableOffset =
      kIsolateStackGuardOffset + kStackGuardSize;
  static const int kBuiltinTier0TableOffset =
      kBuiltinTier0EntryTableOffset + kBuiltinTier0EntryTableSize;
  static const int kIsolateEmbedderDataOffset =
      kBuiltinTier0TableOffset + kBuiltinTier0TableSize;
  static const int kIsolateFastCCallCallerFpOffset =
      kIsolateEmbedderDataOffset + kNumIsolateDataSlots * kApiSystemPointerSize;
  static const int kIsolateFastCCallCallerPcOffset =
      kIsolateFastCCallCallerFpOffset + kApiSystemPointerSize;
  static const int kIsolateFastApiCallTargetOffset =
      kIsolateFastCCallCallerPcOffset + kApiSystemPointerSize;
  static const int kIsolateLongTaskStatsCounterOffset =
      kIsolateFastApiCallTargetOffset + kApiSystemPointerSize;
  static const int kIsolateRootsOffset =
      kIsolateLongTaskStatsCounterOffset + kApiSizetSize;

  static const int kExternalPointerTableBufferOffset = 0;
  static const int kExternalPointerTableLengthOffset =
      kExternalPointerTableBufferOffset + kApiSystemPointerSize;
  static const int kExternalPointerTableCapacityOffset =
      kExternalPointerTableLengthOffset + kApiInt32Size;

  static const int kUndefinedValueRootIndex = 4;
  static const int kTheHoleValueRootIndex = 5;
  static const int kNullValueRootIndex = 6;
  static const int kTrueValueRootIndex = 7;
  static const int kFalseValueRootIndex = 8;
  static const int kEmptyStringRootIndex = 9;

  static const int kNodeClassIdOffset = 1 * kApiSystemPointerSize;
  static const int kNodeFlagsOffset = 1 * kApiSystemPointerSize + 3;
  static const int kNodeStateMask = 0x7;
  static const int kNodeStateIsWeakValue = 2;
  static const int kNodeStateIsPendingValue = 3;

  static const int kFirstNonstringType = 0x40;
  static const int kOddballType = 0x43;
  static const int kForeignType = 0x46;
  static const int kJSSpecialApiObjectType = 0x410;
  static const int kJSObjectType = 0x421;
  static const int kFirstJSApiObjectType = 0x422;
  static const int kLastJSApiObjectType = 0x80A;

  static const int kUndefinedOddballKind = 5;
  static const int kNullOddballKind = 3;

  // Constants used by PropertyCallbackInfo to check if we should throw when an
  // error occurs.
  static const int kThrowOnError = 0;
  static const int kDontThrow = 1;
  static const int kInferShouldThrowMode = 2;

  // Soft limit for AdjustAmountofExternalAllocatedMemory. Trigger an
  // incremental GC once the external memory reaches this limit.
  static constexpr int kExternalAllocationSoftLimit = 64 * 1024 * 1024;

#ifdef V8_MAP_PACKING
  static const uintptr_t kMapWordMetadataMask = 0xffffULL << 48;
  // The lowest two bits of mapwords are always `0b10`
  static const uintptr_t kMapWordSignature = 0b10;
  // XORing a (non-compressed) map with this mask ensures that the two
  // low-order bits are 0b10. The 0 at the end makes this look like a Smi,
  // although real Smis have all lower 32 bits unset. We only rely on these
  // values passing as Smis in very few places.
  static const int kMapWordXorMask = 0b11;
#endif

  V8_EXPORT static void CheckInitializedImpl(v8::Isolate* isolate);
  V8_INLINE static void CheckInitialized(v8::Isolate* isolate) {
#ifdef V8_ENABLE_CHECKS
    CheckInitializedImpl(isolate);
#endif
  }

  V8_INLINE static bool HasHeapObjectTag(const internal::Address value) {
    return (value & kHeapObjectTagMask) == static_cast<Address>(kHeapObjectTag);
  }

  V8_INLINE static int SmiValue(const internal::Address value) {
    return PlatformSmiTagging::SmiToInt(value);
  }

  V8_INLINE static constexpr internal::Address IntToSmi(int value) {
    return internal::IntToSmi(value);
  }

  V8_INLINE static constexpr bool IsValidSmi(intptr_t value) {
    return PlatformSmiTagging::IsValidSmi(value);
  }

  V8_INLINE static int GetInstanceType(const internal::Address obj) {
    typedef internal::Address A;
    A map = ReadTaggedPointerField(obj, kHeapObjectMapOffset);
#ifdef V8_MAP_PACKING
    map = UnpackMapWord(map);
#endif
    return ReadRawField<uint16_t>(map, kMapInstanceTypeOffset);
  }

  V8_INLINE static int GetOddballKind(const internal::Address obj) {
    return SmiValue(ReadTaggedSignedField(obj, kOddballKindOffset));
  }

  V8_INLINE static bool IsExternalTwoByteString(int instance_type) {
    int representation = (instance_type & kFullStringRepresentationMask);
    return representation == kExternalTwoByteRepresentationTag;
  }

  V8_INLINE static uint8_t GetNodeFlag(internal::Address* obj, int shift) {
    uint8_t* addr = reinterpret_cast<uint8_t*>(obj) + kNodeFlagsOffset;
    return *addr & static_cast<uint8_t>(1U << shift);
  }

  V8_INLINE static void UpdateNodeFlag(internal::Address* obj, bool value,
                                       int shift) {
    uint8_t* addr = reinterpret_cast<uint8_t*>(obj) + kNodeFlagsOffset;
    uint8_t mask = static_cast<uint8_t>(1U << shift);
    *addr = static_cast<uint8_t>((*addr & ~mask) | (value << shift));
  }

  V8_INLINE static uint8_t GetNodeState(internal::Address* obj) {
    uint8_t* addr = reinterpret_cast<uint8_t*>(obj) + kNodeFlagsOffset;
    return *addr & kNodeStateMask;
  }

  V8_INLINE static void UpdateNodeState(internal::Address* obj, uint8_t value) {
    uint8_t* addr = reinterpret_cast<uint8_t*>(obj) + kNodeFlagsOffset;
    *addr = static_cast<uint8_t>((*addr & ~kNodeStateMask) | value);
  }

  V8_INLINE static void SetEmbedderData(v8::Isolate* isolate, uint32_t slot,
                                        void* data) {
    internal::Address addr = reinterpret_cast<internal::Address>(isolate) +
                             kIsolateEmbedderDataOffset +
                             slot * kApiSystemPointerSize;
    *reinterpret_cast<void**>(addr) = data;
  }

  V8_INLINE static void* GetEmbedderData(const v8::Isolate* isolate,
                                         uint32_t slot) {
    internal::Address addr = reinterpret_cast<internal::Address>(isolate) +
                             kIsolateEmbedderDataOffset +
                             slot * kApiSystemPointerSize;
    return *reinterpret_cast<void* const*>(addr);
  }

  V8_INLINE static void IncrementLongTasksStatsCounter(v8::Isolate* isolate) {
    internal::Address addr = reinterpret_cast<internal::Address>(isolate) +
                             kIsolateLongTaskStatsCounterOffset;
    ++(*reinterpret_cast<size_t*>(addr));
  }

  V8_INLINE static internal::Address* GetRoot(v8::Isolate* isolate, int index) {
    internal::Address addr = reinterpret_cast<internal::Address>(isolate) +
                             kIsolateRootsOffset +
                             index * kApiSystemPointerSize;
    return reinterpret_cast<internal::Address*>(addr);
  }

  template <typename T>
  V8_INLINE static T ReadRawField(internal::Address heap_object_ptr,
                                  int offset) {
    internal::Address addr = heap_object_ptr + offset - kHeapObjectTag;
#ifdef V8_COMPRESS_POINTERS
    if (sizeof(T) > kApiTaggedSize) {
      // TODO(ishell, v8:8875): When pointer compression is enabled 8-byte size
      // fields (external pointers, doubles and BigInt data) are only
      // kTaggedSize aligned so we have to use unaligned pointer friendly way of
      // accessing them in order to avoid undefined behavior in C++ code.
      T r;
      memcpy(&r, reinterpret_cast<void*>(addr), sizeof(T));
      return r;
    }
#endif
    return *reinterpret_cast<const T*>(addr);
  }

  V8_INLINE static internal::Address ReadTaggedPointerField(
      internal::Address heap_object_ptr, int offset) {
#ifdef V8_COMPRESS_POINTERS
    uint32_t value = ReadRawField<uint32_t>(heap_object_ptr, offset);
    internal::Address base =
        GetPtrComprCageBaseFromOnHeapAddress(heap_object_ptr);
    return base + static_cast<internal::Address>(static_cast<uintptr_t>(value));
#else
    return ReadRawField<internal::Address>(heap_object_ptr, offset);
#endif
  }

  V8_INLINE static internal::Address ReadTaggedSignedField(
      internal::Address heap_object_ptr, int offset) {
#ifdef V8_COMPRESS_POINTERS
    uint32_t value = ReadRawField<uint32_t>(heap_object_ptr, offset);
    return static_cast<internal::Address>(static_cast<uintptr_t>(value));
#else
    return ReadRawField<internal::Address>(heap_object_ptr, offset);
#endif
  }

  V8_INLINE static internal::Isolate* GetIsolateForHeapSandbox(
      internal::Address obj) {
#ifdef V8_HEAP_SANDBOX
    return internal::IsolateFromNeverReadOnlySpaceObject(obj);
#else
    // Not used in non-sandbox mode.
    return nullptr;
#endif
  }

  V8_INLINE static Address DecodeExternalPointer(
      const Isolate* isolate, ExternalPointer_t encoded_pointer,
      ExternalPointerTag tag) {
#ifdef V8_HEAP_SANDBOX
    return internal::DecodeExternalPointerImpl(isolate, encoded_pointer, tag);
#else
    return encoded_pointer;
#endif
  }

  V8_INLINE static internal::Address ReadExternalPointerField(
      internal::Isolate* isolate, internal::Address heap_object_ptr, int offset,
      ExternalPointerTag tag) {
#ifdef V8_HEAP_SANDBOX
    internal::ExternalPointer_t encoded_value =
        ReadRawField<uint32_t>(heap_object_ptr, offset);
    // We currently have to treat zero as nullptr in embedder slots.
    return encoded_value ? DecodeExternalPointer(isolate, encoded_value, tag)
                         : 0;
#else
    return ReadRawField<Address>(heap_object_ptr, offset);
#endif
  }

#ifdef V8_COMPRESS_POINTERS
  // See v8:7703 or src/ptr-compr.* for details about pointer compression.
  static constexpr size_t kPtrComprCageReservationSize = size_t{1} << 32;
  static constexpr size_t kPtrComprCageBaseAlignment = size_t{1} << 32;

  V8_INLINE static internal::Address GetPtrComprCageBaseFromOnHeapAddress(
      internal::Address addr) {
    return addr & -static_cast<intptr_t>(kPtrComprCageBaseAlignment);
  }

  V8_INLINE static internal::Address DecompressTaggedAnyField(
      internal::Address heap_object_ptr, uint32_t value) {
    internal::Address base =
        GetPtrComprCageBaseFromOnHeapAddress(heap_object_ptr);
    return base + static_cast<internal::Address>(static_cast<uintptr_t>(value));
  }

#endif  // V8_COMPRESS_POINTERS
};

constexpr bool VirtualMemoryCageIsEnabled() {
#ifdef V8_VIRTUAL_MEMORY_CAGE
  return true;
#else
  return false;
#endif
}

#ifdef V8_VIRTUAL_MEMORY_CAGE_IS_AVAILABLE

#define GB (1ULL << 30)
#define TB (1ULL << 40)

// Size of the virtual memory cage, excluding the guard regions surrounding it.
constexpr size_t kVirtualMemoryCageSizeLog2 = 40;  // 1 TB
constexpr size_t kVirtualMemoryCageSize = 1ULL << kVirtualMemoryCageSizeLog2;

// Required alignment of the virtual memory cage. For simplicity, we require the
// size of the guard regions to be a multiple of this, so that this specifies
// the alignment of the cage including and excluding surrounding guard regions.
// The alignment requirement is due to the pointer compression cage being
// located at the start of the virtual memory cage.
constexpr size_t kVirtualMemoryCageAlignment =
    Internals::kPtrComprCageBaseAlignment;

#ifdef V8_CAGED_POINTERS
// CagedPointers are guaranteed to point into the virtual memory cage. This is
// achieved by storing them as offset from the cage base rather than as raw
// pointers.
using CagedPointer_t = Address;

// For efficiency, the offset is stored shifted to the left, so that
// it is guaranteed that the offset is smaller than the cage size after
// shifting it to the right again. This constant specifies the shift amount.
constexpr uint64_t kCagedPointerShift = 64 - kVirtualMemoryCageSizeLog2;
#endif

// Size of the guard regions surrounding the virtual memory cage. This assumes a
// worst-case scenario of a 32-bit unsigned index being used to access an array
// of 64-bit values.
constexpr size_t kVirtualMemoryCageGuardRegionSize = 32ULL * GB;

static_assert((kVirtualMemoryCageGuardRegionSize %
               kVirtualMemoryCageAlignment) == 0,
              "The size of the virtual memory cage guard region must be a "
              "multiple of its required alignment.");

// Minimum size of the virtual memory cage, excluding the guard regions
// surrounding it. If the cage reservation fails, its size is currently halved
// until either the reservation succeeds or the minimum size is reached. A
// minimum of 32GB allows the 4GB pointer compression region as well as the
// ArrayBuffer partition and two 10GB WASM memory cages to fit into the cage.
// 32GB should also be the minimum possible size of the userspace address space
// as there are some machine configurations with only 36 virtual address bits.
constexpr size_t kVirtualMemoryCageMinimumSize = 32ULL * GB;

static_assert(kVirtualMemoryCageMinimumSize <= kVirtualMemoryCageSize,
              "The minimal size of the virtual memory cage must be smaller or "
              "equal to the regular size.");

// On OSes where reservation virtual memory is too expensive to create a real
// cage, notably Windows pre 8.1, we create a fake cage that doesn't actually
// reserve most of the memory, and so doesn't have the desired security
// properties, but still ensures that objects that should be located inside the
// cage are allocated within kVirtualMemoryCageSize bytes from the start of the
// cage, and so appear to be inside the cage. The minimum size of the virtual
// memory range that is actually reserved for a fake cage is specified by this
// constant and should be big enough to contain the pointer compression region
// as well as the ArrayBuffer partition.
constexpr size_t kFakeVirtualMemoryCageMinReservationSize = 8ULL * GB;

static_assert(kVirtualMemoryCageMinimumSize >
                  Internals::kPtrComprCageReservationSize,
              "The virtual memory cage must be larger than the pointer "
              "compression cage contained within it.");
static_assert(kFakeVirtualMemoryCageMinReservationSize >
                  Internals::kPtrComprCageReservationSize,
              "The reservation for a fake virtual memory cage must be larger "
              "than the pointer compression cage contained within it.");

// For now, even if the virtual memory cage is enabled, we still allow backing
// stores to be allocated outside of it as fallback. This will simplify the
// initial rollout. However, if the heap sandbox is also enabled, we already use
// the "enforcing mode" of the virtual memory cage. This is useful for testing.
#ifdef V8_HEAP_SANDBOX
constexpr bool kAllowBackingStoresOutsideCage = false;
#else
constexpr bool kAllowBackingStoresOutsideCage = true;
#endif  // V8_HEAP_SANDBOX

#undef GB
#undef TB

#endif  // V8_VIRTUAL_MEMORY_CAGE_IS_AVAILABLE

// Only perform cast check for types derived from v8::Data since
// other types do not implement the Cast method.
template <bool PerformCheck>
struct CastCheck {
  template <class T>
  static void Perform(T* data);
};

template <>
template <class T>
void CastCheck<true>::Perform(T* data) {
  T::Cast(data);
}

template <>
template <class T>
void CastCheck<false>::Perform(T* data) {}

template <class T>
V8_INLINE void PerformCastCheck(T* data) {
  CastCheck<std::is_base_of<Data, T>::value &&
            !std::is_same<Data, std::remove_cv_t<T>>::value>::Perform(data);
}

// A base class for backing stores, which is needed due to vagaries of
// how static casts work with std::shared_ptr.
class BackingStoreBase {};

}  // namespace internal

}  // namespace v8

#endif  // INCLUDE_V8_INTERNAL_H_
