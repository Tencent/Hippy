//
//  RSTimingFunction.m
//
//  Created by Raphael Schaad https://github.com/raphaelschaad on 2013-09-28.
//  This is free and unencumbered software released into the public domain.
//  The cubic Bezier math code is licensed under its original copyright notice included below.
//  You can use this code (e.g. in your iOS project) without worries as long as you don't remove that notice.
//


#import "RSTimingFunction.h"
#include <tgmath.h> // type generic math, yo: http://en.wikipedia.org/wiki/Tgmath.h#tgmath.h


// Same values as `CAMediaTimingFunction` defines, so they can be used interchangeably.
NSString * const kRSTimingFunctionLinear        = @"linear";
NSString * const kRSTimingFunctionEaseIn        = @"easeIn";
NSString * const kRSTimingFunctionEaseOut       = @"easeOut";
NSString * const kRSTimingFunctionEaseInEaseOut = @"easeInEaseOut";
NSString * const kRSTimingFunctionDefault       = @"default";


// Replicate exact same curves as `CAMediaTimingFunction` defines.
static const CGPoint kLinearP1        = {0.0,  0.0};
static const CGPoint kLinearP2        = {1.0,  1.0};
static const CGPoint kEaseInP1        = {0.42, 0.0};
static const CGPoint kEaseInP2        = {1.0,  1.0};
static const CGPoint kEaseOutP1       = {0.0,  0.0};
static const CGPoint kEaseOutP2       = {0.58, 1.0};
static const CGPoint kEaseInEaseOutP1 = {0.42, 0.0};
static const CGPoint kEaseInEaseOutP2 = {0.58, 1.0};
static const CGPoint kDefaultP1       = {0.25, 0.1};
static const CGPoint kDefaultP2       = {0.25, 1.0};


// NSCoding
static NSString * const kControlPoint1Key = @"controlPoint1";
static NSString * const kControlPoint2Key = @"controlPoint2";
static NSString * const kDurationKey = @"duration";


// Internal constants
static const NSTimeInterval kDurationDefault = 1.0;


// For once use private ivars instead of properties for code readability (also omit leading underscore) and to avoid performance hits.
@interface RSTimingFunction ()
{
    // Polynomial coefficients
    CGFloat ax;
    CGFloat bx;
    CGFloat cx;
    
    CGFloat ay;
    CGFloat by;
    CGFloat cy;
}
@end


@implementation RSTimingFunction

#pragma mark - Accessors

@synthesize controlPoint1 = p1;

- (void)setControlPoint1:(CGPoint)controlPoint1
{
    if (!CGPointEqualToPoint(p1, [[self class] normalizedPoint:controlPoint1])) {
        p1 = controlPoint1;
        
        [self calculatePolynomialCoefficients];
    }
}


@synthesize controlPoint2 = p2;

- (void)setControlPoint2:(CGPoint)controlPoint2
{
    if (!CGPointEqualToPoint(p2, [[self class] normalizedPoint:controlPoint2])) {
        p2 = controlPoint2;
        
        [self calculatePolynomialCoefficients];
    }
}


@synthesize duration = dur;

- (void)setDuration:(NSTimeInterval)duration
{
    // Only allow non-negative durations.
    duration = MAX(0.0, duration);
    if (dur != duration) {
        dur = duration;
    }
}


#pragma mark - Life Cycle

// Privat designated initializer
- (instancetype)initWithControlPoint1:(CGPoint)controlPoint1 controlPoint2:(CGPoint)controlPoint2 duration:(NSTimeInterval)duration
{
    self = [super init];
    if (self) {
        // Don't initialize control points through setter to avoid triggering `-calculatePolynomicalCoefficients` unnecessarily twice.
        p1 = [[self class] normalizedPoint:controlPoint1];
        p2 = [[self class] normalizedPoint:controlPoint2];
        
        // Manually initialize polynomial coefficients with newly set control points.
        [self calculatePolynomialCoefficients];
        
        // Use setter to leverage its value sanitanization.
        self.duration = duration;
    }
    return self;
}


- (instancetype)initWithName:(NSString *)name
{
    CGPoint controlPoint1 = [[self class] controlPoint1ForTimingFunctionWithName:name];
    CGPoint controlPoint2 = [[self class] controlPoint2ForTimingFunctionWithName:name];
    return [self initWithControlPoint1:controlPoint1 controlPoint2:controlPoint2];
}


+ (instancetype)timingFunctionWithName:(NSString *)name
{
    return [[self alloc] initWithName:name];
}


- (instancetype)initWithControlPoint1:(CGPoint)controlPoint1 controlPoint2:(CGPoint)controlPoint2
{
    return [self initWithControlPoint1:controlPoint1 controlPoint2:controlPoint2 duration:kDurationDefault];
}


+ (instancetype)timingFunctionWithControlPoint1:(CGPoint)controlPoint1 controlPoint2:(CGPoint)controlPoint2
{
    return [[self alloc] initWithControlPoint1:controlPoint1 controlPoint2:controlPoint2];
}


#pragma mark - NSObject Method Overrides
#pragma mark Describing Objects

- (NSString *)description
{
    NSString *description = [super description];
    
    description = [description stringByAppendingFormat:@" controlPoint1 = %@;", NSStringFromCGPoint(self.controlPoint1)];
    description = [description stringByAppendingFormat:@" controlPoint2 = %@;", NSStringFromCGPoint(self.controlPoint2)];
    description = [description stringByAppendingFormat:@" duration = %f;", self.duration];
    
    return description;
}


- (NSString *)debugDescription
{
    NSString *debugDescription = [self description];
    
    debugDescription = [debugDescription stringByAppendingFormat:@" ax = %f;", ax];
    debugDescription = [debugDescription stringByAppendingFormat:@" bx = %f;", bx];
    debugDescription = [debugDescription stringByAppendingFormat:@" cx = %f;", cx];
    
    debugDescription = [debugDescription stringByAppendingFormat:@" ay = %f;", ay];
    debugDescription = [debugDescription stringByAppendingFormat:@" by = %f;", by];
    debugDescription = [debugDescription stringByAppendingFormat:@" cy = %f;", cy];
    
    return debugDescription;
}


#pragma mark - NSCoding Protocol

- (id)initWithCoder:(NSCoder *)decoder
{
    CGPoint controlPoint1 = [decoder decodeCGPointForKey:kControlPoint1Key];
    CGPoint controlPoint2 = [decoder decodeCGPointForKey:kControlPoint2Key];
    NSTimeInterval duration = [decoder decodeDoubleForKey:kDurationKey];
    
    return [self initWithControlPoint1:controlPoint1 controlPoint2:controlPoint2 duration:duration];
}


- (void)encodeWithCoder:(NSCoder *)encoder
{
    [encoder encodeCGPoint:self.controlPoint1 forKey:kControlPoint1Key];
    [encoder encodeCGPoint:self.controlPoint2 forKey:kControlPoint2Key];
    [encoder encodeDouble:self.duration forKey:kDurationKey];
}


#pragma mark - Public Methods

- (CGFloat)valueForX:(CGFloat)x
{
    CGFloat epsilon = [self epsilon];
    CGFloat xSolved = [self solveCurveX:x epsilon:epsilon];
    CGFloat y = [self sampleCurveY:xSolved];
    return y;
}


#pragma mark - Private Methods
#pragma mark Cubic Bezier Math

// Cubic Bezier math code is based on WebCore (WebKit)
// http://opensource.apple.com/source/WebCore/WebCore-955.66/platform/graphics/UnitBezier.h
// http://opensource.apple.com/source/WebCore/WebCore-955.66/page/animation/AnimationBase.cpp

/*
 * Copyright (C) 2007, 2008, 2009 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


- (CGFloat)epsilon
{
    // Higher precision in the timing function for longer duration to avoid ugly discontinuities
    return 1.0 / (200.0 * dur);
}


- (void)calculatePolynomialCoefficients
{
    // Implicit first and last control points are (0,0) and (1,1).
    cx = 3.0 * p1.x;
    bx = 3.0 * (p2.x - p1.x) - cx;
    ax = 1.0 - cx - bx;
    
    cy = 3.0 * p1.y;
    by = 3.0 * (p2.y - p1.y) - cy;
    ay = 1.0 - cy - by;
}


- (CGFloat)sampleCurveX:(CGFloat)t
{
    // 'ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
    return ((ax * t + bx) * t + cx) * t;
}


- (CGFloat)sampleCurveY:(CGFloat)t
{
    return ((ay * t + by) * t + cy) * t;
}


- (CGFloat)sampleCurveDerivativeX:(CGFloat)t
{
    return (3.0 * ax * t + 2.0 * bx) * t + cx;
}


// Given an x value, find a parametric value it came from.
- (CGFloat)solveCurveX:(CGFloat)x epsilon:(CGFloat)epsilon
{
    CGFloat t0;
    CGFloat t1;
    CGFloat t2;
    CGFloat x2;
    CGFloat d2;
    NSUInteger i;
    
    // First try a few iterations of Newton's method -- normally very fast.
    for (t2 = x, i = 0; i < 8; i++) {
        x2 = [self sampleCurveX:t2] - x;
        if (fabs(x2) < epsilon) {
            return t2;
        }
        d2 = [self sampleCurveDerivativeX:t2];
        if (fabs(d2) < 1e-6) {
            break;
        }
        t2 = t2 - x2 / d2;
    }
    
    // Fall back to the bisection method for reliability.
    t0 = 0.0;
    t1 = 1.0;
    t2 = x;
    
    if (t2 < t0) {
        return t0;
    }
    if (t2 > t1) {
        return t1;
    }
    
    while (t0 < t1) {
        x2 = [self sampleCurveX:t2];
        if (fabs(x2 - x) < epsilon) {
            return t2;
        }
        if (x > x2) {
            t0 = t2;
        } else {
            t1 = t2;
        }
        t2 = (t1 - t0) * 0.5 + t0;
    }
    
    // Failure.
    return t2;
}


#pragma mark Helpers

+ (CGPoint)normalizedPoint:(CGPoint)point
{
    CGPoint normalizedPoint = CGPointZero;
    
    // Clamp to interval [0..1]
    normalizedPoint.x = MAX(0.0, MIN(1.0, point.x));
    normalizedPoint.y = MAX(0.0, MIN(1.0, point.y));
    
    return normalizedPoint;
}


+ (CGPoint)controlPoint1ForTimingFunctionWithName:(NSString *)name
{
    CGPoint controlPoint1 = CGPointZero;
    
    if ([name isEqual:kRSTimingFunctionLinear]) {
        controlPoint1 = kLinearP1;
    } else if ([name isEqual:kRSTimingFunctionEaseIn]) {
        controlPoint1 = kEaseInP1;
    } else if ([name isEqual:kRSTimingFunctionEaseOut]) {
        controlPoint1 = kEaseOutP1;
    } else if ([name isEqual:kRSTimingFunctionEaseInEaseOut]) {
        controlPoint1 = kEaseInEaseOutP1;
    } else if ([name isEqual:kRSTimingFunctionDefault]) {
        controlPoint1 = kDefaultP1;
    } else {
        // Not a predefined timing function
    }
    
    return controlPoint1;
}


+ (CGPoint)controlPoint2ForTimingFunctionWithName:(NSString *)name
{
    CGPoint controlPoint2 = CGPointZero;
    
    if ([name isEqual:kRSTimingFunctionLinear]) {
        controlPoint2 = kLinearP2;
    } else if ([name isEqual:kRSTimingFunctionEaseIn]) {
        controlPoint2 = kEaseInP2;
    } else if ([name isEqual:kRSTimingFunctionEaseOut]) {
        controlPoint2 = kEaseOutP2;
    } else if ([name isEqual:kRSTimingFunctionEaseInEaseOut]) {
        controlPoint2 = kEaseInEaseOutP2;
    } else if ([name isEqual:kRSTimingFunctionDefault]) {
        controlPoint2 = kDefaultP2;
    } else {
        // Not a predefined timing function
    }
    
    return controlPoint2;
}


@end
