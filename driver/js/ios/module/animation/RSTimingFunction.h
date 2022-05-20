//
//  RSTimingFunction.h
//
//  Created by Raphael Schaad on 2013-09-28.
//  This is free and unencumbered software released into the public domain.
//

//A open source code from https://gist.github.com/raphaelschaad/6739676

#import <UIKit/UIKit.h>


// Common predefined timing functions
extern NSString * const kRSTimingFunctionLinear;        // controlPoint1=(0,    0),   controlPoint2=(1,    1)
extern NSString * const kRSTimingFunctionEaseIn;        // controlPoint1=(0.42, 0),   controlPoint2=(1,    1)
extern NSString * const kRSTimingFunctionEaseOut;       // controlPoint1=(0,    0),   controlPoint2=(0.58, 1)
extern NSString * const kRSTimingFunctionEaseInEaseOut; // controlPoint1=(0.42, 0),   controlPoint2=(0.58, 1)
extern NSString * const kRSTimingFunctionDefault;       // controlPoint1=(0.25, 0.1), controlPoint2=(0.25, 1)


//
//  Like `CAMediaTimingFunction` but for versatile (animation) use: allows you to get the value for any given 'x' with `-valueForX:`.
//  Any timing function maps an input value normalized to the interval [0..1] on the curve to an output value also in the interval [0..1].
//  The implementation math is based on WebCore (WebKit), which is presumably what CoreAnimation is using under the hood too.
//
@interface RSTimingFunction : NSObject <NSCoding>

// Convenience methods to create a common timing function listed above
- (instancetype)initWithName:(NSString *)name;
+ (instancetype)timingFunctionWithName:(NSString *)name;

// Creates a timing function modelled on a cubic Bezier curve.
// The end points of the curve are at (0,0) and (1,1) and the two points defined by the class instance are its control points. Thus the points defining the Bezier curve are: '[(0,0), controlPoint1, controlPoint2, (1,1)]'
// Example: `RSTimingFunction *heavyEaseInTimingFunction = [RSTimingFunction timingFunctionWithControlPoint1:CGPointMake(0.8, 0.0) controlPoint2:CGPointMake(1.0, 1.0)];`
// [y]^         .---controlPoint2=(1,1)
//    |         |
//    |         .
//    |        ,
//    |       .
//    |___.--'
//    +-------.--->
//            |  [x]
//            controlPoint1=(0.8,0)
// To visualize what curves given points will produce, use this great tool: http://netcetera.org/camtf-playground.html
- (instancetype)initWithControlPoint1:(CGPoint)controlPoint1 controlPoint2:(CGPoint)controlPoint2;
+ (instancetype)timingFunctionWithControlPoint1:(CGPoint)controlPoint1 controlPoint2:(CGPoint)controlPoint2;

// This is the meat and potatoes: returns `y` for a given `x` value.
- (CGFloat)valueForX:(CGFloat)x;

// If control points are changed after creation, returned values will reflect the changed curve immediately.
// It's more performant to use multiple timing functions with set control points instead of reusing one and changing its control points over and over.
@property (nonatomic, assign) CGPoint controlPoint1;
@property (nonatomic, assign) CGPoint controlPoint2;

// Optionally hint the duration to improve the precision of the values, e.g. when used for an animation.
// Shorter duration is more performant. Default is 1 second.
@property (nonatomic, assign) NSTimeInterval duration;

@end
