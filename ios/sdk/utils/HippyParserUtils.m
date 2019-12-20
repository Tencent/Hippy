/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyParserUtils.h"

#import "HippyLog.h"

BOOL HippyReadChar(const char **input, char c)
{
  if (**input == c) {
    (*input)++;
    return YES;
  }
  return NO;
}

BOOL HippyReadString(const char **input, const char *string)
{
  int i;
  for (i = 0; string[i] != 0; i++) {
    if (string[i] != (*input)[i]) {
      return NO;
    }
  }
  *input += i;
  return YES;
}

void HippySkipWhitespace(const char **input)
{
  while (isspace(**input)) {
    (*input)++;
  }
}

static BOOL HippyIsIdentifierHead(const char c)
{
  return isalpha(c) || c == '_';
}

static BOOL HippyIsIdentifierTail(const char c)
{
  return isalnum(c) || c == '_';
}

BOOL HippyParseIdentifier(const char **input, NSString **string)
{
  const char *start = *input;
  if (!HippyIsIdentifierHead(**input)) {
    return NO;
  }
  (*input)++;
  while (HippyIsIdentifierTail(**input)) {
    (*input)++;
  }
  if (string) {
    *string = [[NSString alloc] initWithBytes:start
                                       length:(NSInteger)(*input - start)
                                     encoding:NSASCIIStringEncoding];
  }
  return YES;
}

static BOOL HippyIsCollectionType(NSString *type)
{
  static NSSet *collectionTypes;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    collectionTypes = [[NSSet alloc] initWithObjects:
                       @"NSArray", @"NSSet", @"NSDictionary", nil];
  });
  return [collectionTypes containsObject:type];
}

NSString *HippyParseType(const char **input)
{
  NSString *type;
  HippyParseIdentifier(input, &type);
  HippySkipWhitespace(input);
  if (HippyReadChar(input, '<')) {
    HippySkipWhitespace(input);
    NSString *subtype = HippyParseType(input);
    if (HippyIsCollectionType(type)) {
      if ([type isEqualToString:@"NSDictionary"]) {
        // Dictionaries have both a key *and* value type, but the key type has
        // to be a string for JSON, so we only care about the value type
        if (HIPPY_DEBUG && ![subtype isEqualToString:@"NSString"]) {
          HippyLogError(@"%@ is not a valid key type for a JSON dictionary", subtype);
        }
        HippySkipWhitespace(input);
        HippyReadChar(input, ',');
        HippySkipWhitespace(input);
        subtype = HippyParseType(input);
      }
      if (![subtype isEqualToString:@"id"]) {
        type = [type stringByReplacingCharactersInRange:(NSRange){0, 2 /* "NS" */}
                                             withString:subtype];
      }
    } else {
      // It's a protocol rather than a generic collection - ignore it
    }
    HippySkipWhitespace(input);
    HippyReadChar(input, '>');
  }
  HippySkipWhitespace(input);
  HippyReadChar(input, '*');
  return type;
}
