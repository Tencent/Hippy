//
//  NSObject+Render.m
//  hippy
//
//  Created by mengyanluo on 2023/6/14.
//

#import "NSObject+Render.h"
#import "objc/runtime.h"

#include "dom/render_manager.h"

@interface RenderManagerWrapper : NSObject

@property(nonatomic, assign) std::weak_ptr<hippy::RenderManager> renderManager;

@end

@implementation RenderManagerWrapper

@end

@implementation NSObject (Render)

- (void)setRenderManager:(std::weak_ptr<hippy::RenderManager>)renderManager {
    RenderManagerWrapper *wrapper = [[RenderManagerWrapper alloc] init];
    wrapper.renderManager = renderManager;
    objc_setAssociatedObject(self, @selector(renderManager), wrapper, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (std::weak_ptr<hippy::RenderManager>)renderManager {
    RenderManagerWrapper *wrapper = objc_getAssociatedObject(self, _cmd);
    return wrapper.renderManager;
}

@end
