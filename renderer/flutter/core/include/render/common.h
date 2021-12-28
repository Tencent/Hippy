#pragma once

#include <cstdint>
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

namespace voltron {

template <typename T>
using List = std::vector<T>;

template <typename K, typename V>
using Map = std::unordered_map<K, V>;

template <typename T>
using Sp = std::shared_ptr<T>;

template <typename T>
using Wp = std::weak_ptr<T>;

using String = std::string;

template <typename T>
using SpList = List<std::shared_ptr<T>>;

template <typename T>
using SpMap = Map<String, std::shared_ptr<T>>;

}  // namespace voltron
