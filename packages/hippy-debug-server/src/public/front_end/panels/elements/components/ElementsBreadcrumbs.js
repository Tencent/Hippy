// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as Coordinator from '../../../ui/components/render_coordinator/render_coordinator.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import { crumbsToRender, NodeSelectedEvent } from './ElementsBreadcrumbsUtils.js';
import { NodeText } from './NodeText.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
export class ElementsBreadcrumbs extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    resizeObserver = new ResizeObserver(() => this.checkForOverflowOnResize());
    crumbsData = [];
    selectedDOMNode = null;
    overflowing = false;
    userScrollPosition = 'start';
    isObservingResize = false;
    userHasManuallyScrolled = false;
    set data(data) {
        this.selectedDOMNode = data.selectedNode;
        this.crumbsData = data.crumbs;
        this.userHasManuallyScrolled = false;
        this.update();
    }
    disconnectedCallback() {
        this.isObservingResize = false;
        this.resizeObserver.disconnect();
    }
    onCrumbClick(node) {
        return (event) => {
            event.preventDefault();
            this.dispatchEvent(new NodeSelectedEvent(node));
        };
    }
    /*
     * When the window is resized, we need to check if we either:
     * 1) overflowing, and now the window is big enough that we don't need to
     * 2) not overflowing, and now the window is small and we do need to
     *
     * If either of these are true, we toggle the overflowing state accordingly and trigger a re-render.
     */
    async checkForOverflowOnResize() {
        const wrappingElement = this.shadow.querySelector('.crumbs');
        const crumbs = this.shadow.querySelector('.crumbs-scroll-container');
        if (!wrappingElement || !crumbs) {
            return;
        }
        const totalContainingWidth = await coordinator.read(() => wrappingElement.clientWidth);
        const totalCrumbsWidth = await coordinator.read(() => crumbs.clientWidth);
        if (totalCrumbsWidth >= totalContainingWidth && this.overflowing === false) {
            this.overflowing = true;
            this.userScrollPosition = 'start';
            this.render();
        }
        else if (totalCrumbsWidth < totalContainingWidth && this.overflowing === true) {
            this.overflowing = false;
            this.userScrollPosition = 'start';
            this.render();
        }
    }
    async update() {
        await this.render();
        this.engageResizeObserver();
        this.ensureSelectedNodeIsVisible();
    }
    onCrumbMouseMove(node) {
        return () => node.highlightNode();
    }
    onCrumbMouseLeave(node) {
        return () => node.clearHighlight();
    }
    onCrumbFocus(node) {
        return () => node.highlightNode();
    }
    onCrumbBlur(node) {
        return () => node.clearHighlight();
    }
    engageResizeObserver() {
        if (!this.resizeObserver || this.isObservingResize === true) {
            return;
        }
        const crumbs = this.shadow.querySelector('.crumbs');
        if (!crumbs) {
            return;
        }
        this.resizeObserver.observe(crumbs);
        this.isObservingResize = true;
    }
    /**
     * This method runs after render and checks if the crumbs are too large for
     * their container and therefore we need to render the overflow buttons at
     * either end which the user can use to scroll back and forward through the crumbs.
     * If it finds that we are overflowing, it sets the instance variable and
     * triggers a re-render. If we are not overflowing, this method returns and
     * does nothing.
     */
    async checkForOverflow() {
        const crumbScrollContainer = this.shadow.querySelector('.crumbs-scroll-container');
        const crumbWindow = this.shadow.querySelector('.crumbs-window');
        if (!crumbScrollContainer || !crumbWindow) {
            return;
        }
        const crumbWindowWidth = await coordinator.read(() => {
            return crumbWindow.clientWidth;
        });
        const scrollContainerWidth = await coordinator.read(() => {
            return crumbScrollContainer.clientWidth;
        });
        const paddingAllowance = 20;
        const maxChildWidth = crumbWindowWidth - paddingAllowance;
        if (scrollContainerWidth < maxChildWidth) {
            if (this.overflowing) {
                // We were overflowing, but now we have enough room, so re-render with
                // overflowing set to false so the overflow buttons get removed.
                this.overflowing = false;
                this.render();
            }
            return;
        }
        // We don't have enough room, so if we are not currently overflowing, mark
        // as overflowing and re-render to update the UI.
        if (!this.overflowing) {
            this.overflowing = true;
            this.render();
        }
    }
    onCrumbsWindowScroll(event) {
        if (!event.target) {
            return;
        }
        /* not all Events are DOM Events so the TS Event def doesn't have
         * .target typed as an Element but in this case we're getting this
         * from a DOM event so we're confident of having .target and it
         * being an element
         */
        const scrollWindow = event.target;
        this.updateScrollState(scrollWindow);
    }
    updateScrollState(scrollWindow) {
        const maxScrollLeft = scrollWindow.scrollWidth - scrollWindow.clientWidth;
        const currentScroll = scrollWindow.scrollLeft;
        /**
         * When we check if the user is at the beginning or end of the crumbs (such
         * that we disable the relevant button - you can't keep scrolling right if
         * you're at the last breadcrumb) we want to not check exact numbers but
         * give a bit of padding. This means if the user has scrolled to nearly the
         * end but not quite (e.g. there are 2 more pixels they could scroll) we'll
         * mark it as them being at the end. This variable controls how much padding
         * we apply. So if a user has scrolled to within 10px of the end, we count
         * them as being at the end and disable the button.
         */
        const scrollBeginningAndEndPadding = 10;
        if (currentScroll < scrollBeginningAndEndPadding) {
            this.userScrollPosition = 'start';
        }
        else if (currentScroll >= maxScrollLeft - scrollBeginningAndEndPadding) {
            this.userScrollPosition = 'end';
        }
        else {
            this.userScrollPosition = 'middle';
        }
        this.render();
    }
    onOverflowClick(direction) {
        return () => {
            this.userHasManuallyScrolled = true;
            const scrollWindow = this.shadow.querySelector('.crumbs-window');
            if (!scrollWindow) {
                return;
            }
            const amountToScrollOnClick = scrollWindow.clientWidth / 2;
            const newScrollAmount = direction === 'left' ?
                Math.max(Math.floor(scrollWindow.scrollLeft - amountToScrollOnClick), 0) :
                scrollWindow.scrollLeft + amountToScrollOnClick;
            scrollWindow.scrollTo({
                behavior: 'smooth',
                left: newScrollAmount,
            });
        };
    }
    renderOverflowButton(direction, disabled) {
        const buttonStyles = LitHtml.Directives.classMap({
            overflow: true,
            [direction]: true,
            hidden: this.overflowing === false,
        });
        return LitHtml.html `
      <button
        class=${buttonStyles}
        @click=${this.onOverflowClick(direction)}
        ?disabled=${disabled}
        aria-label="Scroll ${direction}"
      >&hellip;</button>
      `;
    }
    async render() {
        const crumbs = crumbsToRender(this.crumbsData, this.selectedDOMNode);
        await coordinator.write('Breadcrumbs render', () => {
            // Disabled until https://crbug.com/1079231 is fixed.
            // clang-format off
            LitHtml.render(LitHtml.html `
        <style>
          :host {
            --node-text-label-color: var(--color-syntax-2);
            --node-text-class-color: var(--color-syntax-4);
            --node-text-id-color: var(--color-syntax-4);
            --node-text-multiple-descriptors-id: var(--color-syntax-7);
          }

          .crumbs {
            display: inline-flex;
            align-items: stretch;
            width: 100%;
            overflow: hidden;
            pointer-events: auto;
            cursor: default;
            white-space: nowrap;
            position: relative;
            background: var(--color-background);
          }

          .crumbs-window {
            flex-grow: 2;
            overflow: hidden;
          }

          .crumbs-scroll-container {
            display: inline-flex;
            margin: 0;
            padding: 0;
          }

          .crumb {
            display: block;
            padding: 0 7px;
            line-height: 23px;
            white-space: nowrap;
          }

          .overflow {
            padding: 0 7px;
            font-weight: bold;
            display: block;
            border: none;
            flex-grow: 0;
            flex-shrink: 0;
            text-align: center;
            background-color: var(--color-background-elevation-1);
            color: var(--color-text-secondary);
            margin: 1px;
            outline: var(--color-background-elevation-1) solid 1px;
          }

          .overflow.hidden {
            display: none;
          }

          .overflow:disabled {
            opacity: 50%;
          }

          .overflow:focus {
            outline-color: var(--color-primary);
          }

          .overflow:not(:disabled):hover {
            background-color: var(--color-background-elevation-2);
            color: var(--color-text-primary);
            cursor: pointer;
          }

          .crumb-link {
            text-decoration: none;
            color: inherit;
          }

          .crumb:hover {
            background: var(--color-background-elevation-2);
          }

          .crumb.selected {
            background: var(--color-background-elevation-1);
          }

          .crumb:focus {
            outline: var(--color-primary) auto 1px;
          }
        </style>

        <nav class="crumbs">
          ${this.renderOverflowButton('left', this.userScrollPosition === 'start')}

          <div class="crumbs-window" @scroll=${this.onCrumbsWindowScroll}>
            <ul class="crumbs-scroll-container">
              ${crumbs.map(crumb => {
                const crumbClasses = {
                    crumb: true,
                    selected: crumb.selected,
                };
                return LitHtml.html `
                  <li class=${LitHtml.Directives.classMap(crumbClasses)}
                    data-node-id=${crumb.node.id}
                    data-crumb="true"
                  >
                    <a href="#"
                      draggable=false
                      class="crumb-link"
                      @click=${this.onCrumbClick(crumb.node)}
                      @mousemove=${this.onCrumbMouseMove(crumb.node)}
                      @mouseleave=${this.onCrumbMouseLeave(crumb.node)}
                      @focus=${this.onCrumbFocus(crumb.node)}
                      @blur=${this.onCrumbBlur(crumb.node)}
                    ><${NodeText.litTagName} data-node-title=${crumb.title.main} .data=${{
                    nodeTitle: crumb.title.main,
                    nodeId: crumb.title.extras.id,
                    nodeClasses: crumb.title.extras.classes,
                }}></${NodeText.litTagName}></a>
                  </li>`;
            })}
            </ul>
          </div>
          ${this.renderOverflowButton('right', this.userScrollPosition === 'end')}
        </nav>
      `, this.shadow, {
                host: this,
            });
            // clang-format on
        });
        this.checkForOverflow();
    }
    async ensureSelectedNodeIsVisible() {
        /*
         * If the user has manually scrolled the crumbs in either direction, we
         * effectively hand control over the scrolling down to them. This is to
         * prevent the user manually scrolling to the end, and then us scrolling
         * them back to the selected node. The moment they click either scroll
         * button we set userHasManuallyScrolled, and we reset it when we get new
         * data in. This means if the user clicks on a different element in the
         * tree, we will auto-scroll that element into view, because we'll get new
         * data and hence the flag will be reset.
         */
        if (!this.selectedDOMNode || !this.shadow || !this.overflowing || this.userHasManuallyScrolled) {
            return;
        }
        const activeCrumbId = this.selectedDOMNode.id;
        const activeCrumb = this.shadow.querySelector(`.crumb[data-node-id="${activeCrumbId}"]`);
        if (activeCrumb) {
            await coordinator.scroll(() => {
                activeCrumb.scrollIntoView({
                    behavior: 'smooth',
                });
            });
        }
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-elements-breadcrumbs', ElementsBreadcrumbs);
//# sourceMappingURL=ElementsBreadcrumbs.js.map