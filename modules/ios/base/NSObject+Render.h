//
//  NSObject+Render.h
//  hippy
//
//  Created by mengyanluo on 2023/6/14.
//

#import <Foundation/Foundation.h>

#include <memory>

NS_ASSUME_NONNULL_BEGIN

namespace hippy {
inline namespace dom {
class RenderManager;
};
};

@interface NSObject (Render)

@property(nonatomic, assign) std::weak_ptr<hippy::RenderManager> renderManager;

@end

NS_ASSUME_NONNULL_END
