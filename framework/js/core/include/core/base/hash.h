#pragma once

#include <unordered_map>
#include <vector>

namespace std {
template <class T>
inline void hash_combine(size_t& seed, T const& v) {
  seed ^= hash<T>()(v) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
}

template <typename T>
struct hash<vector<T>> {
  size_t operator()(vector<T> const& in) const {
    size_t size = in.size();
    size_t seed = 0;
    for (size_t i = 0; i < size; i++)
      // Combine the hash of the current vector with the hashes of the previous
      // ones
      hash_combine(seed, in[i]);
    return seed;
  }
};

template <typename K, typename V>
struct hash<unordered_map<K, V>> {
  size_t operator()(unordered_map<K, V> const& in) const {
    size_t seed = 0;
    for (auto& v : in) {
      // Combine the hash of the current vector with the hashes of the previous
      // ones
      hash_combine(seed, v.first);
      hash_combine(seed, v.second);
    }
    return seed;
  }
};
}  // namespace std
