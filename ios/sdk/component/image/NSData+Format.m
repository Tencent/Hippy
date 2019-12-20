//
//  NSData+Format.m
//  hippy
//
//  Created by pennyli on 8/9/19.
//

#import "NSData+Format.h"
@implementation NSData(Format)
- (BOOL)hippy_isGif
{
    if (self.length < 12) {
        return NO;
    }
    char bytes[12] = {0};
    
    [self getBytes:&bytes length:12];
    
    const char gif[3] = {'G', 'I', 'F'};
    if (!memcmp(bytes, gif, 3)) {
        return YES;
    }
    return NO;
}
@end

