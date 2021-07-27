// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as UI from '../../ui/legacy/legacy.js';
import { AnimationUI } from './AnimationUI.js';
export class AnimationGroupPreviewUI {
    _model;
    element;
    _removeButton;
    _replayOverlayElement;
    _svg;
    _viewBoxHeight;
    constructor(model) {
        this._model = model;
        this.element = document.createElement('div');
        this.element.classList.add('animation-buffer-preview');
        this.element.createChild('div', 'animation-paused fill');
        this._removeButton = this.element.createChild('div', 'animation-remove-button');
        this._removeButton.textContent = '\u2715';
        this._replayOverlayElement = this.element.createChild('div', 'animation-buffer-preview-animation');
        this._svg = UI.UIUtils.createSVGChild(this.element, 'svg');
        this._svg.setAttribute('width', '100%');
        this._svg.setAttribute('preserveAspectRatio', 'none');
        this._svg.setAttribute('height', '100%');
        this._viewBoxHeight = 32;
        this._svg.setAttribute('viewBox', '0 0 100 ' + this._viewBoxHeight);
        this._svg.setAttribute('shape-rendering', 'crispEdges');
        this._render();
    }
    _groupDuration() {
        let duration = 0;
        for (const anim of this._model.animations()) {
            const animDuration = anim.source().delay() + anim.source().duration();
            if (animDuration > duration) {
                duration = animDuration;
            }
        }
        return duration;
    }
    removeButton() {
        return this._removeButton;
    }
    replay() {
        this._replayOverlayElement.animate([
            { offset: 0, width: '0%', opacity: 1 },
            { offset: 0.9, width: '100%', opacity: 1 },
            { offset: 1, width: '100%', opacity: 0 },
        ], { duration: 200, easing: 'cubic-bezier(0, 0, 0.2, 1)' });
    }
    _render() {
        this._svg.removeChildren();
        const maxToShow = 10;
        const numberOfAnimations = Math.min(this._model.animations().length, maxToShow);
        const timeToPixelRatio = 100 / Math.max(this._groupDuration(), 750);
        for (let i = 0; i < numberOfAnimations; i++) {
            const effect = this._model.animations()[i].source();
            const line = UI.UIUtils.createSVGChild(this._svg, 'line');
            line.setAttribute('x1', String(effect.delay() * timeToPixelRatio));
            line.setAttribute('x2', String((effect.delay() + effect.duration()) * timeToPixelRatio));
            const y = String(Math.floor(this._viewBoxHeight / Math.max(6, numberOfAnimations) * i + 1));
            line.setAttribute('y1', y);
            line.setAttribute('y2', y);
            line.style.stroke = AnimationUI.colorForAnimation(this._model.animations()[i]);
        }
    }
}
//# sourceMappingURL=AnimationGroupPreviewUI.js.map