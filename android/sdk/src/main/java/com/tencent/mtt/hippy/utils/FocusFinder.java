/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.tencent.mtt.hippy.utils;

import android.graphics.Rect;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;

/**
 * 自定义FocusFinder，处理tv特殊的寻焦逻辑
 */
public class FocusFinder {

    private static final ThreadLocal<FocusFinder> tlFocusFinder =
            new ThreadLocal<FocusFinder>() {
                @Override
                protected FocusFinder initialValue() {
                    return new FocusFinder();
                }
            };

    /**
     * Get the focus finder for this thread.
     */
    public static FocusFinder getInstance() {
        return tlFocusFinder.get();
    }

    final Rect mFocusedRect = new Rect();
    final Rect mOtherRect = new Rect();
    final Rect mBestCandidateRect = new Rect();
    private final FocusFinder.FocusSorter mFocusSorter = new FocusFinder.FocusSorter();

    private final ArrayList<View> mTempList = new ArrayList<View>();

    // enforce thread local access
    FocusFinder() {
    }

    /**
     * Find the next view to take focus in root's descendants, starting from the view
     * that currently is focused.
     *
     * @param root Contains focused. Cannot be null.
     * @param focused Has focus now.
     * @param direction Direction to look.
     * @return The next focusable view, or null if none exists.
     */
    public final View findNextFocus(ViewGroup root, View focused, int direction) {
        return findNextFocus(root, focused, null, direction);
    }

    private View findNextFocus(ViewGroup root, View focused, Rect focusedRect, int direction) {
        View next = null;
        ViewGroup effectiveRoot = root;
        if (focused != null) {
            next = findNextUserSpecifiedFocus(effectiveRoot, focused, direction);
        }
        if (next != null) {
            return next;
        }
        ArrayList<View> focusables = mTempList;
        try {
            focusables.clear();
            effectiveRoot.addFocusables(focusables, direction);
            if (!focusables.isEmpty()) {
                next = findNextFocus(effectiveRoot, focused, focusedRect, direction, focusables);
            }
        } finally {
            focusables.clear();
        }
        return next;
    }

    private View findNextFocus(ViewGroup root, View focused, Rect focusedRect,
            int direction, ArrayList<View> focusables) {
        if (focused != null) {
            if (focusedRect == null) {
                focusedRect = mFocusedRect;
            }
            // fill in interesting rect from focused
            focused.getFocusedRect(focusedRect);
            root.offsetDescendantRectToMyCoords(focused, focusedRect);
        } else {
            if (focusedRect == null) {
                focusedRect = mFocusedRect;
                // make up a rect at top left or bottom right of root
                makeUpRectOfRoot(root, focusedRect, direction);
            }
        }

        return getView(root, focused, focusedRect, direction, focusables);
    }

    private View getView(ViewGroup root, View focused, Rect focusedRect, int direction, ArrayList<View> focusables) {
        if (isRelativeDirection(direction)) {
            return findNextFocusInRelativeDirection(focusables, root, focused, focusedRect,
                    direction);
        } else if (isAbsoluteDirection(direction)) {
            return findNextFocusInAbsoluteDirection(focusables, root, focused,
                    focusedRect, direction);
        }
        throw new IllegalArgumentException("Unknown direction: " + direction);
    }

    private boolean isAbsoluteDirection(int direction) {
        return direction == View.FOCUS_UP || direction == View.FOCUS_DOWN || direction == View.FOCUS_LEFT
                || direction == View.FOCUS_RIGHT;
    }

    private boolean isRelativeDirection(int direction) {
        return direction == View.FOCUS_FORWARD || direction == View.FOCUS_BACKWARD;
    }

    private void makeUpRectOfRoot(ViewGroup root, Rect focusedRect, int direction) {
        if (direction == View.FOCUS_RIGHT || direction == View.FOCUS_DOWN) {
            setFocusTopLeft(root, focusedRect);
        } else if (direction == View.FOCUS_LEFT || direction == View.FOCUS_UP) {
            setFocusBottomRight(root, focusedRect);
        }
    }

    /**
     * Find the next view to take focus in root's descendants, searching from
     * a particular rectangle in root's coordinates.
     *
     * @param root Contains focusedRect. Cannot be null.
     * @param focusedRect The starting point of the search.
     * @param direction Direction to look.
     * @return The next focusable view, or null if none exists.
     */
    public View findNextFocusFromRect(ViewGroup root, Rect focusedRect, int direction) {
        mFocusedRect.set(focusedRect);
        return findNextFocus(root, null, mFocusedRect, direction);
    }

    private View findNextUserSpecifiedFocus(ViewGroup root, View focused, int direction) {
        // check for user specified next focus
        View userSetNextFocus = findUserSetNextFocus(root, focused, direction);
        int findTimes = 0;
        while (userSetNextFocus != null) {
            if (isVisible(userSetNextFocus)) {
                return userSetNextFocus;
            }

            if (userSetNextFocus == focused) {
                return focused;
            }

            if (findTimes >= 10) {
                break;
            }
            userSetNextFocus = findUserSetNextFocus(root, userSetNextFocus, direction);
            findTimes++;
        }
        return null;
    }

    private View findUserSetNextFocus(ViewGroup root, View focused, int direction) {
        int id = View.NO_ID;
        switch (direction) {
            case View.FOCUS_LEFT:
                id = focused.getNextFocusLeftId();
                break;
            case View.FOCUS_RIGHT:
                id = focused.getNextFocusRightId();
                break;
            case View.FOCUS_UP:
                id = focused.getNextFocusUpId();
                break;
            case View.FOCUS_DOWN:
                id = focused.getNextFocusDownId();
                break;
            case View.FOCUS_FORWARD:
                id = focused.getNextFocusForwardId();
                if (id == View.NO_ID) {
                    id = focused.getNextFocusRightId();
                    if (id == View.NO_ID) {
                        id = focused.getNextFocusDownId();
                    }
                }
                break;
            default:
                break;
        }

        if (id != View.NO_ID) {
            return root.findViewById(id);
        }
        return null;
    }

    private boolean isVisible(View view) {
        View root = view.getRootView();

        boolean ret = true;
        View v = view;
        while (v != null && v != root) {
            if (v.getVisibility() != View.VISIBLE) {
                ret = false;
                break;
            }

            ViewParent parent = v.getParent();
            if (parent instanceof ViewGroup) {
                v = (View) parent;
            } else {
                ret = false;
                break;
            }
        }

        return ret;
    }

    private View findNextFocusInRelativeDirection(ArrayList<View> focusables, ViewGroup root,
            View focused, Rect focusedRect, int direction) {

        final int count = focusables.size();
        switch (direction) {
            case View.FOCUS_FORWARD:
                return getNextFocusable(focused, focusables, count);
            case View.FOCUS_BACKWARD:
                return getPreviousFocusable(focused, focusables, count);
            default:
                break;
        }
        return focusables.get(count - 1);
    }

    private void setFocusBottomRight(ViewGroup root, Rect focusedRect) {
        final int rootBottom = root.getScrollY() + root.getHeight();
        final int rootRight = root.getScrollX() + root.getWidth();
        focusedRect.set(rootRight, rootBottom, rootRight, rootBottom);
    }

    private void setFocusTopLeft(ViewGroup root, Rect focusedRect) {
        final int rootTop = root.getScrollY();
        final int rootLeft = root.getScrollX();
        focusedRect.set(rootLeft, rootTop, rootLeft, rootTop);
    }

    View findNextFocusInAbsoluteDirection(ArrayList<View> focusables, ViewGroup root, View focused,
            Rect focusedRect, int direction) {
        // initialize the best candidate to something impossible
        // (so the first plausible view will become the best choice)
        mBestCandidateRect.set(focusedRect);
        if (direction == View.FOCUS_LEFT) {
            mBestCandidateRect.offset(focusedRect.width() + 1, 0);
        } else if (direction == View.FOCUS_RIGHT) {
            mBestCandidateRect.offset(-(focusedRect.width() + 1), 0);
        } else if (direction == View.FOCUS_UP) {
            mBestCandidateRect.offset(0, focusedRect.height() + 1);
        } else if (direction == View.FOCUS_DOWN) {
            mBestCandidateRect.offset(0, -(focusedRect.height() + 1));
        }

        View closest = null;

        float scale = getFocusScale(focused, direction);

        int numFocusables = focusables.size();
        for (int i = 0; i < numFocusables; i++) {
            View focusable = focusables.get(i);

            // only interested in other non-root views
            if (focusable == focused || focusable == root) {
                continue;
            }

            // get focus bounds of other view in same coordinate system
            focusable.getFocusedRect(mOtherRect);
            root.offsetDescendantRectToMyCoords(focusable, mOtherRect);

            if (isBetterCandidate(scale, direction, focusedRect, mOtherRect, mBestCandidateRect)) {
                mBestCandidateRect.set(mOtherRect);
                closest = focusable;
            }
        }
        return closest;
    }

    private static float getFocusScale(View focused, int direction) {
        return 0.5f;
    }

    private static View getNextFocusable(View focused, ArrayList<View> focusables, int count) {
        if (focused != null) {
            int position = focusables.lastIndexOf(focused);
            if (position >= 0 && position + 1 < count) {
                return focusables.get(position + 1);
            }
        }
        if (!focusables.isEmpty()) {
            return focusables.get(0);
        }
        return null;
    }

    private static View getPreviousFocusable(View focused, ArrayList<View> focusables, int count) {
        if (focused != null) {
            int position = focusables.indexOf(focused);
            if (position > 0) {
                return focusables.get(position - 1);
            }
        }
        if (!focusables.isEmpty()) {
            return focusables.get(count - 1);
        }
        return null;
    }

    private static View getNextKeyboardNavigationCluster(
            View root,
            View currentCluster,
            List<View> clusters,
            int count) {
        if (currentCluster == null) {
            // The current cluster is the default one.
            // The next cluster after the default one is the first one.
            // Note that the caller guarantees that 'clusters' is not empty.
            return clusters.get(0);
        }

        final int position = clusters.lastIndexOf(currentCluster);
        if (position >= 0 && position + 1 < count) {
            // Return the next non-default cluster if we can find it.
            return clusters.get(position + 1);
        }

        // The current cluster is the last one. The next one is the default one, i.e. the
        // root.
        return root;
    }

    private static View getPreviousKeyboardNavigationCluster(
            View root,
            View currentCluster,
            List<View> clusters,
            int count) {
        if (currentCluster == null) {
            // The current cluster is the default one.
            // The previous cluster before the default one is the last one.
            // Note that the caller guarantees that 'clusters' is not empty.
            return clusters.get(count - 1);
        }

        final int position = clusters.indexOf(currentCluster);
        if (position > 0) {
            // Return the previous non-default cluster if we can find it.
            return clusters.get(position - 1);
        }

        // The current cluster is the first one. The previous one is the default one, i.e.
        // the root.
        return root;
    }

    /**
     * Is rect1 a better candidate than rect2 for a focus search in a particular
     * direction from a source rect?  This is the core routine that determines
     * the order of focus searching.
     *
     * @param direction the direction (up, down, left, right)
     * @param source The source we are searching from
     * @param rect1 The candidate rectangle
     * @param rect2 The current best candidate.
     * @return Whether the candidate is the new best.
     */
    boolean isBetterCandidate(float scale, int direction, Rect source, Rect rect1, Rect rect2) {

        // to be a better candidate, need to at least be a candidate in the first
        // place :)
        if (!isCandidate(source, rect1, direction)) {
            return false;
        }

        // we know that rect1 is a candidate.. if rect2 is not a candidate,
        // rect1 is better
        if (!isCandidate(source, rect2, direction)) {
            return true;
        }

        // if rect1 is better by beam, it wins
        if (beamBeats(direction, source, rect1, rect2)) {
            return true;
        }

        // if rect2 is better, then rect1 cant' be :)
        if (beamBeats(direction, source, rect2, rect1)) {
            return false;
        }

        if (middle(direction, source, rect2, rect1)) {
            return true;
        }

        if (middle(direction, source, rect1, rect2)) {
            return false;
        }

        // otherwise, do fudge-tastic comparison of the major and minor axis
        return (getWeightedDistanceFor(
                majorAxisDistance(direction, source, rect1),
                minorAxisDistance(scale, direction, source, rect1))
                < getWeightedDistanceFor(
                majorAxisDistance(direction, source, rect2),
                minorAxisDistance(scale, direction, source, rect2)));
    }

    /**
     * 判断rect2 是否在source和rect1中间
     *
     * @param direction
     * @param source
     * @param rect1
     * @param rect2
     * @return
     */
    boolean middle(int direction, Rect source, Rect rect1, Rect rect2) {
        switch (direction) {
            case View.FOCUS_LEFT:
                return rect2.right < source.centerX() && rect1.centerX() < rect2.left;
            case View.FOCUS_RIGHT:
                return rect2.left > source.centerX() && rect1.centerX() > rect2.right;

            case View.FOCUS_UP:
                return rect2.bottom < source.centerY() && rect1.centerY() < rect2.top;
            case View.FOCUS_DOWN:
                return rect2.top > source.centerY() && rect1.centerY() > rect2.bottom;
            default:
                break;
        }
        throw new IllegalArgumentException("direction must be one of "
                + "{FOCUS_UP, FOCUS_DOWN, FOCUS_LEFT, FOCUS_RIGHT}.");
    }

    /**
     * One rectangle may be another candidate than another by virtue of being
     * exclusively in the beam of the source rect.
     *
     * @return Whether rect1 is a better candidate than rect2 by virtue of it being in src's
     *         beam
     */
    boolean beamBeats(int direction, Rect source, Rect rect1, Rect rect2) {
        final boolean rect1InSrcBeam = beamsOverlap(direction, source, rect1);
        final boolean rect2InSrcBeam = beamsOverlap(direction, source, rect2);

        // if rect1 isn't exclusively in the src beam, it doesn't win
        if (rect2InSrcBeam || !rect1InSrcBeam) {
            return false;
        }

        // we know rect1 is in the beam, and rect2 is not

        // if rect1 is to the direction of, and rect2 is not, rect1 wins.
        // for example, for direction left, if rect1 is to the left of the source
        // and rect2 is below, then we always prefer the in beam rect1, since rect2
        // could be reached by going down.
        if (!isToDirectionOf(direction, source, rect2)) {
            return true;
        }

        // for horizontal directions, being exclusively in beam always wins
        if ((direction == View.FOCUS_LEFT || direction == View.FOCUS_RIGHT)) {
            return true;
        }

        // for vertical directions, beams only beat up to a point:
        // now, as long as rect2 isn't completely closer, rect1 wins
        // e.g for direction down, completely closer means for rect2's top
        // edge to be closer to the source's top edge than rect1's bottom edge.
        return (majorAxisDistance(direction, source, rect1)
                < majorAxisDistanceToFarEdge(direction, source, rect2));
    }

    /**
     * Fudge-factor opportunity: how to calculate distance given major and minor
     * axis distances.  Warning: this fudge factor is finely tuned, be sure to
     * run all focus tests if you dare tweak it.
     */
    int getWeightedDistanceFor(int majorAxisDistance, int minorAxisDistance) {
        return 26 * majorAxisDistance * majorAxisDistance
                + minorAxisDistance * minorAxisDistance;
    }

    /**
     * Is destRect a candidate for the next focus given the direction?  This
     * checks whether the dest is at least partially to the direction of (e.g left of)
     * from source.
     * <p>
     * Includes an edge case for an empty rect (which is used in some cases when
     * searching from a point on the screen).
     */
    boolean isCandidate(Rect srcRect, Rect destRect, int direction) {
        if (direction == View.FOCUS_LEFT) {
            return isCandidateLeft(srcRect, destRect);
        } else if (direction == View.FOCUS_RIGHT) {
            return isCandidateRight(srcRect, destRect);
        } else if (direction == View.FOCUS_UP) {
            return isCandidateUp(srcRect, destRect);
        } else if (direction == View.FOCUS_DOWN) {
            return isCandidateDown(srcRect, destRect);
        }
        throw new IllegalArgumentException("direction must be one of "
                + "{FOCUS_UP, FOCUS_DOWN, FOCUS_LEFT, FOCUS_RIGHT}.");
    }

    private boolean isCandidateDown(Rect srcRect, Rect destRect) {
        return (srcRect.top < destRect.top || srcRect.bottom <= destRect.top)
                && srcRect.bottom < destRect.bottom;
    }

    private boolean isCandidateUp(Rect srcRect, Rect destRect) {
        return (srcRect.bottom > destRect.bottom || srcRect.top >= destRect.bottom)
                && srcRect.top > destRect.top;
    }

    private boolean isCandidateRight(Rect srcRect, Rect destRect) {
        return (srcRect.left < destRect.left || srcRect.right <= destRect.left)
                && srcRect.right < destRect.right;
    }

    private boolean isCandidateLeft(Rect srcRect, Rect destRect) {
        return (srcRect.right > destRect.right || srcRect.left >= destRect.right)
                && srcRect.left > destRect.left;
    }

    /**
     * Do the "beams" w.r.t the given direction's axis of rect1 and rect2 overlap?
     *
     * @param direction the direction (up, down, left, right)
     * @param rect1 The first rectangle
     * @param rect2 The second rectangle
     * @return whether the beams overlap
     */
    boolean beamsOverlap(int direction, Rect rect1, Rect rect2) {
        switch (direction) {
            case View.FOCUS_LEFT:
            case View.FOCUS_RIGHT:
                return (rect2.bottom >= rect1.top) && (rect2.top <= rect1.bottom);
            case View.FOCUS_UP:
            case View.FOCUS_DOWN:
                return (rect2.right >= rect1.left) && (rect2.left <= rect1.right);
            default:
                break;
        }
        throw new IllegalArgumentException("direction must be one of "
                + "{FOCUS_UP, FOCUS_DOWN, FOCUS_LEFT, FOCUS_RIGHT}.");
    }

    /**
     * e.g for left, is 'to left of'
     */
    boolean isToDirectionOf(int direction, Rect src, Rect dest) {
        switch (direction) {
            case View.FOCUS_LEFT:
                return src.left >= dest.right;
            case View.FOCUS_RIGHT:
                return src.right <= dest.left;
            case View.FOCUS_UP:
                return src.top >= dest.bottom;
            case View.FOCUS_DOWN:
                return src.bottom <= dest.top;
            default:
                break;
        }
        throw new IllegalArgumentException("direction must be one of "
                + "{FOCUS_UP, FOCUS_DOWN, FOCUS_LEFT, FOCUS_RIGHT}.");
    }

    /**
     * @return The distance from the edge furthest in the given direction
     *         of source to the edge nearest in the given direction of dest.  If the
     *         dest is not in the direction from source, return 0.
     */
    static int majorAxisDistance(int direction, Rect source, Rect dest) {
        return Math.max(0, majorAxisDistanceRaw(direction, source, dest));
    }

    static int majorAxisDistanceRaw(int direction, Rect source, Rect dest) {
        switch (direction) {
            case View.FOCUS_LEFT:
                return source.left - dest.right;
            case View.FOCUS_RIGHT:
                return dest.left - source.right;
            case View.FOCUS_UP:
                return source.top - dest.bottom;
            case View.FOCUS_DOWN:
                return dest.top - source.bottom;
            default:
                break;
        }
        throw new IllegalArgumentException("direction must be one of "
                + "{FOCUS_UP, FOCUS_DOWN, FOCUS_LEFT, FOCUS_RIGHT}.");
    }

    /**
     * @return The distance along the major axis w.r.t the direction from the
     *         edge of source to the far edge of dest. If the
     *         dest is not in the direction from source, return 1 (to break ties with
     *         {@link #majorAxisDistance}).
     */
    static int majorAxisDistanceToFarEdge(int direction, Rect source, Rect dest) {
        return Math.max(1, majorAxisDistanceToFarEdgeRaw(direction, source, dest));
    }

    static int majorAxisDistanceToFarEdgeRaw(int direction, Rect source, Rect dest) {
        switch (direction) {
            case View.FOCUS_LEFT:
                return source.left - dest.left;
            case View.FOCUS_RIGHT:
                return dest.right - source.right;
            case View.FOCUS_UP:
                return source.top - dest.top;
            case View.FOCUS_DOWN:
                return dest.bottom - source.bottom;
            default:
                break;
        }
        throw new IllegalArgumentException("direction must be one of "
                + "{FOCUS_UP, FOCUS_DOWN, FOCUS_LEFT, FOCUS_RIGHT}.");
    }

    /**
     * Find the distance on the minor axis w.r.t the direction to the nearest
     * edge of the destination rectangle.
     *
     * @param direction the direction (up, down, left, right)
     * @param source The source rect.
     * @param dest The destination rect.
     * @return The distance.
     */
    static int minorAxisDistance(float scale, int direction, Rect source, Rect dest) {
        if (direction == View.FOCUS_LEFT || direction == View.FOCUS_RIGHT) {
            // the distance between the center verticals
            return Math.abs(((source.top + (int) (source.height() * scale)) - ((dest.top + dest.height() / 2))));
        } else if (direction == View.FOCUS_UP || direction == View.FOCUS_DOWN) {
            // the distance between the center horizontals
            return Math.abs(((source.left + (int) (source.width() * scale)) - ((dest.left + dest.width() / 2))));
        }
        throw new IllegalArgumentException(
                "direction must be one of  {FOCUS_UP, FOCUS_DOWN, FOCUS_LEFT, FOCUS_RIGHT}.");
    }

    /**
     * Is destRect a candidate for the next touch given the direction?
     */
    private boolean isTouchCandidate(int x, int y, Rect destRect, int direction) {
        if (direction == View.FOCUS_LEFT) {
            return isTouchCandidateLeft(x, y, destRect);
        } else if (direction == View.FOCUS_RIGHT) {
            return isTouchCandidateRight(x, y, destRect);
        } else if (direction == View.FOCUS_UP) {
            return isTouchCandidateUp(x, y, destRect);
        } else if (direction == View.FOCUS_DOWN) {
            return isTouchCandidateDown(x, y, destRect);
        }
        throw new IllegalArgumentException("direction must be one of "
                + "{FOCUS_UP, FOCUS_DOWN, FOCUS_LEFT, FOCUS_RIGHT}.");
    }

    private boolean isTouchCandidateDown(int x, int y, Rect destRect) {
        return destRect.top >= y && destRect.left <= x && x <= destRect.right;
    }

    private boolean isTouchCandidateUp(int x, int y, Rect destRect) {
        return destRect.top <= y && destRect.left <= x && x <= destRect.right;
    }

    private boolean isTouchCandidateRight(int x, int y, Rect destRect) {
        return destRect.left >= x && destRect.top <= y && y <= destRect.bottom;
    }

    private boolean isTouchCandidateLeft(int x, int y, Rect destRect) {
        return destRect.left <= x && destRect.top <= y && y <= destRect.bottom;
    }

    private static final boolean isValidId(final int id) {
        return id != 0 && id != View.NO_ID;
    }

    static final class FocusSorter {

        private ArrayList<Rect> mRectPool = new ArrayList<>();
        private int mLastPoolRect;
        private int mRtlMult;
        private HashMap<View, Rect> mRectByView = null;

        private Comparator<View> mTopsComparator = new Comparator<View>() {
            @Override
            public int compare(View first, View second) {
                if (first == second) {
                    return 0;
                }

                Rect firstRect = mRectByView.get(first);
                Rect secondRect = mRectByView.get(second);

                int result = firstRect.top - secondRect.top;
                if (result == 0) {
                    return firstRect.bottom - secondRect.bottom;
                }
                return result;
            }
        };

        private Comparator<View> mSidesComparator = new Comparator<View>() {
            @Override
            public int compare(View first, View second) {
                if (first == second) {
                    return 0;
                }

                Rect firstRect = mRectByView.get(first);
                Rect secondRect = mRectByView.get(second);

                int result = firstRect.left - secondRect.left;
                if (result == 0) {
                    return firstRect.right - secondRect.right;
                }
                return mRtlMult * result;
            }
        };

        public void sort(View[] views, int start, int end, ViewGroup root, boolean isRtl) {
            int count = end - start;
            if (count < 2) {
                return;
            }
            if (mRectByView == null) {
                mRectByView = new HashMap<>();
            }
            mRtlMult = isRtl ? -1 : 1;
            for (int i = mRectPool.size(); i < count; ++i) {
                mRectPool.add(new Rect());
            }
            for (int i = start; i < end; ++i) {
                Rect next = mRectPool.get(mLastPoolRect++);
                views[i].getDrawingRect(next);
                root.offsetDescendantRectToMyCoords(views[i], next);
                mRectByView.put(views[i], next);
            }

            // Sort top-to-bottom
            Arrays.sort(views, start, count, mTopsComparator);
            // Sweep top-to-bottom to identify rows
            int sweepBottom = mRectByView.get(views[start]).bottom;
            int rowStart = start;
            int sweepIdx = start + 1;
            for (; sweepIdx < end; ++sweepIdx) {
                Rect currRect = mRectByView.get(views[sweepIdx]);
                if (currRect.top >= sweepBottom) {
                    // Next view is on a new row, sort the row we've just finished left-to-right.
                    if ((sweepIdx - rowStart) > 1) {
                        Arrays.sort(views, rowStart, sweepIdx, mSidesComparator);
                    }
                    sweepBottom = currRect.bottom;
                    rowStart = sweepIdx;
                } else {
                    // Next view vertically overlaps, we need to extend our "row height"
                    sweepBottom = Math.max(sweepBottom, currRect.bottom);
                }
            }
            // Sort whatever's left (final row) left-to-right
            if ((sweepIdx - rowStart) > 1) {
                Arrays.sort(views, rowStart, sweepIdx, mSidesComparator);
            }

            mLastPoolRect = 0;
            mRectByView.clear();
        }
    }

    /**
     * Public for testing.
     *
     * @hide
     */
    public static void sort(View[] views, int start, int end, ViewGroup root, boolean isRtl) {
        getInstance().mFocusSorter.sort(views, start, end, root, isRtl);
    }
}
