#ifndef CORE_BASE_COMMON_H_
#define CORE_BASE_COMMON_H_

#include <functional>
#include <unordered_map>
#include <string>

namespace hippy {
namespace base {

using RegisterFunction = std::function<void(void*)>;
using RegisterMap = std::unordered_map<std::string, RegisterFunction>;

template<class F>
auto MakeCopyable(F&& f) {
  auto s = std::make_shared<std::decay_t<F>>(std::forward<F>(f));
  return [s](auto&&... args) -> decltype(auto) {
    return (*s)(decltype(args)(args)...);
  };
}

}
}

#endif
