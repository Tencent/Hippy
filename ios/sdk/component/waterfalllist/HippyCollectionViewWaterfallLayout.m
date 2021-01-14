//
//  UICollectionViewWaterfallLayout.m
//
//  Created by Ricardo on 2021/1/12.
//  Copyright © 2021 Tencent Inc. All rights reserved.
//

#import "HippyCollectionViewWaterfallLayout.h"
#import "tgmath.h"

NSString *const HippyCollectionElementKindSectionHeader = @"HippyCollectionElementKindSectionHeader";
NSString *const HippyCollectionElementKindSectionFooter = @"HippyCollectionElementKindSectionFooter";

@interface HippyCollectionViewWaterfallLayout ()
/// The delegate will point to collection view's delegate automatically.
@property (nonatomic, weak) id<HippyCollectionViewDelegateWaterfallLayout> delegate;
/// Array to store height for each column
@property (nonatomic, strong) NSMutableArray *columnHeights;
/// Array of arrays. Each array stores item attributes for each section
@property (nonatomic, strong) NSMutableArray *sectionItemAttributes;
/// Array to store attributes for all items includes headers, cells, and footers
@property (nonatomic, strong) NSMutableArray *allItemAttributes;
/// Dictionary to store section headers' attribute
@property (nonatomic, strong) NSMutableDictionary *headersAttribute;
/// Dictionary to store section footers' attribute
@property (nonatomic, strong) NSMutableDictionary *footersAttribute;
/// Array to store union rectangles
@property (nonatomic, strong) NSMutableArray *unionRects;
@end

@implementation HippyCollectionViewWaterfallLayout

/// How many items to be union into a single rectangle
static const NSInteger unionSize = 20;

static CGFloat HippyFloorCGFloat(CGFloat value) {
    CGFloat scale = [UIScreen mainScreen].scale;
    return floor(value * scale) / scale;
}

#pragma mark - Public Accessors
- (void)setColumnCount:(NSInteger)columnCount {
    if (_columnCount != columnCount) {
        _columnCount = columnCount;
        [self invalidateLayout];
    }
}

- (void)setMinimumColumnSpacing:(CGFloat)minimumColumnSpacing {
    if (_minimumColumnSpacing != minimumColumnSpacing) {
        _minimumColumnSpacing = minimumColumnSpacing;
        [self invalidateLayout];
    }
}

- (void)setMinimumInteritemSpacing:(CGFloat)minimumInteritemSpacing {
    if (_minimumInteritemSpacing != minimumInteritemSpacing) {
        _minimumInteritemSpacing = minimumInteritemSpacing;
        [self invalidateLayout];
    }
}

- (void)setHeaderHeight:(CGFloat)headerHeight {
    if (_headerHeight != headerHeight) {
        _headerHeight = headerHeight;
        [self invalidateLayout];
    }
}

- (void)setFooterHeight:(CGFloat)footerHeight {
    if (_footerHeight != footerHeight) {
        _footerHeight = footerHeight;
        [self invalidateLayout];
    }
}

- (void)setHeaderInset:(UIEdgeInsets)headerInset {
    if (!UIEdgeInsetsEqualToEdgeInsets(_headerInset, headerInset)) {
        _headerInset = headerInset;
        [self invalidateLayout];
    }
}

- (void)setFooterInset:(UIEdgeInsets)footerInset {
    if (!UIEdgeInsetsEqualToEdgeInsets(_footerInset, footerInset)) {
        _footerInset = footerInset;
        [self invalidateLayout];
    }
}

- (void)setSectionInset:(UIEdgeInsets)sectionInset {
    if (!UIEdgeInsetsEqualToEdgeInsets(_sectionInset, sectionInset)) {
        _sectionInset = sectionInset;
        [self invalidateLayout];
    }
}

- (void)setItemRenderDirection:(HippyCollectionViewWaterfallLayoutItemRenderDirection)itemRenderDirection {
    if (_itemRenderDirection != itemRenderDirection) {
        _itemRenderDirection = itemRenderDirection;
        [self invalidateLayout];
    }
}

- (NSInteger)columnCountForSection:(NSInteger)section {
    if ([self.delegate respondsToSelector:@selector(collectionView:layout:columnCountForSection:)]) {
        return [self.delegate collectionView:self.collectionView layout:self columnCountForSection:section];
    } else {
        return self.columnCount;
    }
}

- (CGFloat)itemWidthInSectionAtIndex:(NSInteger)section {
    UIEdgeInsets sectionInset;
    if ([self.delegate respondsToSelector:@selector(collectionView:layout:insetForSectionAtIndex:)]) {
        sectionInset = [self.delegate collectionView:self.collectionView layout:self insetForSectionAtIndex:section];
    } else {
        sectionInset = self.sectionInset;
    }
    CGFloat width = self.collectionView.bounds.size.width - sectionInset.left - sectionInset.right;
    NSInteger columnCount = [self columnCountForSection:section];

    CGFloat columnSpacing = self.minimumColumnSpacing;
    if ([self.delegate respondsToSelector:@selector(collectionView:layout:minimumColumnSpacingForSectionAtIndex:)]) {
        columnSpacing = [self.delegate collectionView:self.collectionView layout:self minimumColumnSpacingForSectionAtIndex:section];
    }

    return HippyFloorCGFloat((width - (columnCount - 1) * columnSpacing) / columnCount);
}

#pragma mark - Private Accessors
- (NSMutableDictionary *)headersAttribute {
    if (!_headersAttribute) {
        _headersAttribute = [NSMutableDictionary dictionary];
    }
    return _headersAttribute;
}

- (NSMutableDictionary *)footersAttribute {
    if (!_footersAttribute) {
        _footersAttribute = [NSMutableDictionary dictionary];
    }
    return _footersAttribute;
}

- (NSMutableArray *)unionRects {
    if (!_unionRects) {
        _unionRects = [NSMutableArray array];
    }
    return _unionRects;
}

- (NSMutableArray *)columnHeights {
    if (!_columnHeights) {
        _columnHeights = [NSMutableArray array];
    }
    return _columnHeights;
}

- (NSMutableArray *)allItemAttributes {
    if (!_allItemAttributes) {
        _allItemAttributes = [NSMutableArray array];
    }
    return _allItemAttributes;
}

- (NSMutableArray *)sectionItemAttributes {
    if (!_sectionItemAttributes) {
        _sectionItemAttributes = [NSMutableArray array];
    }
    return _sectionItemAttributes;
}

- (id<HippyCollectionViewDelegateWaterfallLayout>)delegate {
    return (id<HippyCollectionViewDelegateWaterfallLayout>)self.collectionView.delegate;
}

#pragma mark - Init
- (void)commonInit {
    _columnCount = 2;
    _minimumColumnSpacing = 10;
    _minimumInteritemSpacing = 10;
    _headerHeight = 0;
    _footerHeight = 0;
    _sectionInset = UIEdgeInsetsZero;
    _headerInset = UIEdgeInsetsZero;
    _footerInset = UIEdgeInsetsZero;
    _itemRenderDirection = HippyCollectionViewWaterfallLayoutItemRenderDirectionShortestFirst;
}

- (id)init {
    if (self = [super init]) {
        [self commonInit];
    }
    return self;
}

- (id)initWithCoder:(NSCoder *)aDecoder {
    if (self = [super initWithCoder:aDecoder]) {
        [self commonInit];
    }
    return self;
}

#pragma mark - Methods to Override
- (void)prepareLayout {
    [super prepareLayout];

    [self _clearAttributes];

    NSInteger numberOfSections = [self.collectionView numberOfSections];
    if (numberOfSections == 0) {
        return;
    }

    NSAssert([self.delegate conformsToProtocol:@protocol(HippyCollectionViewDelegateWaterfallLayout)],
        @"UICollectionView's delegate should conform to HippyCollectionViewDelegateWaterfallLayout protocol");
    NSAssert(self.columnCount > 0 || [self.delegate respondsToSelector:@selector(collectionView:layout:columnCountForSection:)],
        @"UICollectionViewWaterfallLayout's columnCount should be greater than 0, or delegate must implement columnCountForSection:");

    // Initialize variables
    NSInteger idx = 0;

    for (NSInteger section = 0; section < numberOfSections; section++) {
        NSInteger columnCount = [self columnCountForSection:section];
        NSMutableArray *sectionColumnHeights = [NSMutableArray arrayWithCapacity:columnCount];
        for (idx = 0; idx < columnCount; idx++) {
            [sectionColumnHeights addObject:@(0)];
        }
        [self.columnHeights addObject:sectionColumnHeights];
    }
    // Create attributes
    CGFloat top = 0;

    for (NSInteger section = 0; section < numberOfSections; ++section) {
        /*
         * 1. Get section-specific metrics (minimumInteritemSpacing, sectionInset)
         */
        UIEdgeInsets sectionInset = [self _getSectionInsetInSection:section];

        NSInteger columnCount = [self columnCountForSection:section];

        /*
         * 2. Section header
         */
        [self createHeadersAttributeInSection:section top:&top];

        top += sectionInset.top;
        for (idx = 0; idx < columnCount; idx++) {
            self.columnHeights[section][idx] = @(top);
        }

        /*
         * 3. Section items
         */

        // Item will be put into shortest column.
        [self createItemAttributesInSection:section];

        /*
         * 4. Section footer
         */
        [self createFootersAttributeInSection:section top:&top];

        for (idx = 0; idx < columnCount; idx++) {
            self.columnHeights[section][idx] = @(top);
        }
    } // end of for (NSInteger section = 0; section < numberOfSections; ++section)

    // Build union rects
    idx = 0;
    NSInteger itemCounts = [self.allItemAttributes count];
    while (idx < itemCounts) {
        CGRect unionRect = ((UICollectionViewLayoutAttributes *)self.allItemAttributes[idx]).frame;
        NSInteger rectEndIndex = MIN(idx + unionSize, itemCounts);

        for (NSInteger i = idx + 1; i < rectEndIndex; i++) {
            unionRect = CGRectUnion(unionRect, ((UICollectionViewLayoutAttributes *)self.allItemAttributes[i]).frame);
        }

        idx = rectEndIndex;

        [self.unionRects addObject:[NSValue valueWithCGRect:unionRect]];
    }
}

- (void)_clearAttributes {
    [self.headersAttribute removeAllObjects];
    [self.footersAttribute removeAllObjects];
    [self.unionRects removeAllObjects];
    [self.columnHeights removeAllObjects];
    [self.allItemAttributes removeAllObjects];
    [self.sectionItemAttributes removeAllObjects];
}

- (CGFloat)_getMinimumInteritemSpacingInSection:(NSInteger)section {
    if ([self.delegate respondsToSelector:@selector(collectionView:layout:minimumInteritemSpacingForSectionAtIndex:)]) {
        return [self.delegate collectionView:self.collectionView layout:self minimumInteritemSpacingForSectionAtIndex:section];
    } else {
        return self.minimumInteritemSpacing;
    }
}

- (CGFloat)_getcolumnSpacingInSection:(NSInteger)section {
    if ([self.delegate respondsToSelector:@selector(collectionView:layout:minimumColumnSpacingForSectionAtIndex:)]) {
        return [self.delegate collectionView:self.collectionView layout:self minimumColumnSpacingForSectionAtIndex:section];
    } else {
        return self.minimumColumnSpacing;
    }
}

- (UIEdgeInsets)_getSectionInsetInSection:(NSInteger)section {
    if ([self.delegate respondsToSelector:@selector(collectionView:layout:insetForSectionAtIndex:)]) {
        return [self.delegate collectionView:self.collectionView layout:self insetForSectionAtIndex:section];
    } else {
        return self.sectionInset;
    }
}

- (CGFloat)_getHeaderHeightInSection:(NSInteger)section {
    if ([self.delegate respondsToSelector:@selector(collectionView:layout:heightForHeaderInSection:)]) {
        return [self.delegate collectionView:self.collectionView layout:self heightForHeaderInSection:section];
    } else {
        return self.headerHeight;
    }
}

- (UIEdgeInsets)_getHeaderInsetInSection:(NSInteger)section {
    if ([self.delegate respondsToSelector:@selector(collectionView:layout:insetForHeaderInSection:)]) {
        return [self.delegate collectionView:self.collectionView layout:self insetForHeaderInSection:section];
    } else {
        return self.headerInset;
    }
}

- (UIEdgeInsets)_getFooterInsetInSection:(NSInteger)section {
    if ([self.delegate respondsToSelector:@selector(collectionView:layout:insetForFooterInSection:)]) {
        return [self.delegate collectionView:self.collectionView layout:self insetForFooterInSection:section];
    } else {
        return self.footerInset;
    }
}

- (CGFloat)_getFooterHeightInSection:(NSInteger)section {
    if ([self.delegate respondsToSelector:@selector(collectionView:layout:heightForFooterInSection:)]) {
        return [self.delegate collectionView:self.collectionView layout:self heightForFooterInSection:section];
    } else {
        return self.footerHeight;
    }
}

- (void)createItemAttributesInSection:(NSInteger)section {
    CGFloat minimumInteritemSpacing = [self _getMinimumInteritemSpacingInSection:section];
    CGFloat columnSpacing = [self _getcolumnSpacingInSection:section];
    UIEdgeInsets sectionInset = [self _getSectionInsetInSection:section];

    CGFloat width = self.collectionView.bounds.size.width - sectionInset.left - sectionInset.right;
    NSInteger columnCount = [self columnCountForSection:section];
    CGFloat itemWidth = HippyFloorCGFloat((width - (columnCount - 1) * columnSpacing) / columnCount);

    NSInteger itemCount = [self.collectionView numberOfItemsInSection:section];
    NSMutableArray *itemAttributes = [NSMutableArray arrayWithCapacity:itemCount];
    for (NSInteger idx = 0; idx < itemCount; idx++) {
        NSIndexPath *indexPath = [NSIndexPath indexPathForItem:idx inSection:section];
        NSUInteger columnIndex = [self nextColumnIndexForItem:idx inSection:section];
        CGFloat xOffset = sectionInset.left + (itemWidth + columnSpacing) * columnIndex;
        CGFloat yOffset = [self.columnHeights[section][columnIndex] floatValue];
        CGSize itemSize = [self.delegate collectionView:self.collectionView layout:self sizeForItemAtIndexPath:indexPath];
        CGFloat itemHeight = 0;
        if (itemSize.height > 0 && itemSize.width > 0) {
            itemHeight = HippyFloorCGFloat(itemSize.height * itemWidth / itemSize.width);
        }

        UICollectionViewLayoutAttributes *attributes = [UICollectionViewLayoutAttributes layoutAttributesForCellWithIndexPath:indexPath];
        attributes.frame = CGRectMake(xOffset, yOffset, itemWidth, itemHeight);
        [itemAttributes addObject:attributes];
        [self.allItemAttributes addObject:attributes];
        self.columnHeights[section][columnIndex] = @(CGRectGetMaxY(attributes.frame) + minimumInteritemSpacing);
    }

    [self.sectionItemAttributes addObject:itemAttributes];
}

- (void)createHeadersAttributeInSection:(NSInteger)section top:(CGFloat *)top {
    CGFloat headerHeight = [self _getHeaderHeightInSection:section];

    UIEdgeInsets headerInset = [self _getHeaderInsetInSection:section];

    *top += headerInset.top;

    if (headerHeight > 0) {
        UICollectionViewLayoutAttributes *attributes =
            [UICollectionViewLayoutAttributes layoutAttributesForSupplementaryViewOfKind:HippyCollectionElementKindSectionHeader
                                                                           withIndexPath:[NSIndexPath indexPathForItem:0 inSection:section]];
        CGFloat startX = headerInset.left;
        CGFloat width = self.collectionView.bounds.size.width - (headerInset.left + headerInset.right);
        attributes.frame = CGRectMake(startX, *top, width, headerHeight);

        self.headersAttribute[@(section)] = attributes;
        [self.allItemAttributes addObject:attributes];

        *top = CGRectGetMaxY(attributes.frame) + headerInset.bottom;
    }
}

- (void)createFootersAttributeInSection:(NSInteger)section top:(CGFloat *)top {
    CGFloat minimumInteritemSpacing = [self _getMinimumInteritemSpacingInSection:section];
    UIEdgeInsets sectionInset = [self _getSectionInsetInSection:section];

    CGFloat footerHeight = [self _getFooterHeightInSection:section];
    NSUInteger columnIndex = [self longestColumnIndexInSection:section];
    if (((NSArray *)self.columnHeights[section]).count > 0) {
        *top = [self.columnHeights[section][columnIndex] floatValue] - minimumInteritemSpacing + sectionInset.bottom;
    } else {
        *top = 0;
    }

    UIEdgeInsets footerInset = [self _getFooterInsetInSection:section];

    *top += footerInset.top;

    if (footerHeight > 0) {
        UICollectionViewLayoutAttributes *attributes =
            [UICollectionViewLayoutAttributes layoutAttributesForSupplementaryViewOfKind:HippyCollectionElementKindSectionFooter
                                                                           withIndexPath:[NSIndexPath indexPathForItem:0 inSection:section]];
        attributes.frame
            = CGRectMake(footerInset.left, *top, self.collectionView.bounds.size.width - (footerInset.left + footerInset.right), footerHeight);

        self.footersAttribute[@(section)] = attributes;
        [self.allItemAttributes addObject:attributes];

        *top = CGRectGetMaxY(attributes.frame) + footerInset.bottom;
    }
}

- (CGSize)collectionViewContentSize {
    NSInteger numberOfSections = [self.collectionView numberOfSections];
    if (numberOfSections == 0) {
        return CGSizeZero;
    }

    CGSize contentSize = self.collectionView.bounds.size;
    contentSize.height = [[[self.columnHeights lastObject] firstObject] floatValue];

    if (contentSize.height < self.minimumContentHeight) {
        contentSize.height = self.minimumContentHeight;
    }

    return contentSize;
}

- (UICollectionViewLayoutAttributes *)layoutAttributesForItemAtIndexPath:(NSIndexPath *)path {
    if (path.section >= [self.sectionItemAttributes count]) {
        return nil;
    }
    if (path.item >= [self.sectionItemAttributes[path.section] count]) {
        return nil;
    }
    return (self.sectionItemAttributes[path.section])[path.item];
}

- (UICollectionViewLayoutAttributes *)layoutAttributesForSupplementaryViewOfKind:(NSString *)kind atIndexPath:(NSIndexPath *)indexPath {
    UICollectionViewLayoutAttributes *attribute = nil;
    if ([kind isEqualToString:HippyCollectionElementKindSectionHeader]) {
        attribute = self.headersAttribute[@(indexPath.section)];
    } else if ([kind isEqualToString:HippyCollectionElementKindSectionFooter]) {
        attribute = self.footersAttribute[@(indexPath.section)];
    }
    return attribute;
}

- (NSArray *)layoutAttributesForElementsInRect:(CGRect)rect {
    NSInteger i;
    NSInteger begin = 0, end = self.unionRects.count;
    NSMutableDictionary *cellAttrDict = [NSMutableDictionary dictionary];
    NSMutableDictionary *supplHeaderAttrDict = [NSMutableDictionary dictionary];
    NSMutableDictionary *supplFooterAttrDict = [NSMutableDictionary dictionary];
    NSMutableDictionary *decorAttrDict = [NSMutableDictionary dictionary];

    for (i = 0; i < self.unionRects.count; i++) {
        if (CGRectIntersectsRect(rect, [self.unionRects[i] CGRectValue])) {
            begin = i * unionSize;
            break;
        }
    }
    for (i = self.unionRects.count - 1; i >= 0; i--) {
        if (CGRectIntersectsRect(rect, [self.unionRects[i] CGRectValue])) {
            end = MIN((i + 1) * unionSize, self.allItemAttributes.count);
            break;
        }
    }
    for (i = begin; i < end; i++) {
        UICollectionViewLayoutAttributes *attr = self.allItemAttributes[i];
        if (CGRectIntersectsRect(rect, attr.frame)) {
            switch (attr.representedElementCategory) {
                case UICollectionElementCategorySupplementaryView:
                    if ([attr.representedElementKind isEqualToString:HippyCollectionElementKindSectionHeader]) {
                        supplHeaderAttrDict[attr.indexPath] = attr;
                    } else if ([attr.representedElementKind isEqualToString:HippyCollectionElementKindSectionFooter]) {
                        supplFooterAttrDict[attr.indexPath] = attr;
                    }
                    break;
                case UICollectionElementCategoryDecorationView:
                    decorAttrDict[attr.indexPath] = attr;
                    break;
                case UICollectionElementCategoryCell:
                    cellAttrDict[attr.indexPath] = attr;
                    break;
            }
        }
    }

    NSArray *result = [cellAttrDict.allValues arrayByAddingObjectsFromArray:supplHeaderAttrDict.allValues];
    result = [result arrayByAddingObjectsFromArray:supplFooterAttrDict.allValues];
    result = [result arrayByAddingObjectsFromArray:decorAttrDict.allValues];
    return result;
}

- (BOOL)shouldInvalidateLayoutForBoundsChange:(CGRect)newBounds {
    CGRect oldBounds = self.collectionView.bounds;
    if (CGRectGetWidth(newBounds) != CGRectGetWidth(oldBounds)) {
        return YES;
    }
    return NO;
}

#pragma mark - Private Methods

/**
 *  Find the shortest column.
 *
 *  @return index for the shortest column
 */
- (NSUInteger)shortestColumnIndexInSection:(NSInteger)section {
    __block NSUInteger index = 0;
    __block CGFloat shortestHeight = MAXFLOAT;

    [self.columnHeights[section] enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
        CGFloat height = [obj floatValue];
        if (height < shortestHeight) {
            shortestHeight = height;
            index = idx;
        }
    }];

    return index;
}

/**
 *  Find the longest column.
 *
 *  @return index for the longest column
 */
- (NSUInteger)longestColumnIndexInSection:(NSInteger)section {
    __block NSUInteger index = 0;
    __block CGFloat longestHeight = 0;

    [self.columnHeights[section] enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
        CGFloat height = [obj floatValue];
        if (height > longestHeight) {
            longestHeight = height;
            index = idx;
        }
    }];

    return index;
}

/**
 *  Find the index for the next column.
 *
 *  @return index for the next column
 */
- (NSUInteger)nextColumnIndexForItem:(NSInteger)item inSection:(NSInteger)section {
    NSUInteger index = 0;
    NSInteger columnCount = [self columnCountForSection:section];
    switch (self.itemRenderDirection) {
        case HippyCollectionViewWaterfallLayoutItemRenderDirectionShortestFirst:
            index = [self shortestColumnIndexInSection:section];
            break;

        case HippyCollectionViewWaterfallLayoutItemRenderDirectionLeftToRight:
            index = (item % columnCount);
            break;

        case HippyCollectionViewWaterfallLayoutItemRenderDirectionRightToLeft:
            index = (columnCount - 1) - (item % columnCount);
            break;

        default:
            index = [self shortestColumnIndexInSection:section];
            break;
    }
    return index;
}

@end
