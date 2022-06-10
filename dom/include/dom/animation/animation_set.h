#pragma once

#include <vector>

#include "dom/animation/animation.h"

namespace hippy {
inline namespace animation {

class AnimationSet : public Animation {
 public:
  struct AnimationSetChild {
    uint32_t animation_id;
    bool follow;
  };

  AnimationSet(std::vector<AnimationSetChild>&& children_set,
               int32_t cnt);
  AnimationSet();

  void Init();

 private:
  std::vector<AnimationSetChild> children_set_;
  std::shared_ptr<Animation> begin_animation_;
  std::shared_ptr<Animation> end_animation_;
};

}
}
