//
//  HippyDemoLoader.hpp
//  HippyDemo
//
//  Created by mengyanluo on 2022/9/26.
//  Copyright © 2022 tencent. All rights reserved.
//

#import "HippyDefaultUriHandler.h"

#include "vfs/uri_loader.h"

class HippyDemoLoader : public hippy::vfs::UriLoader {
};


class HippyDemoHandler : public HippyDefaultUriHandler {
    
};
