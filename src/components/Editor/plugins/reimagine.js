import { G } from '@svgdotjs/svg.js';
import { getCubicBezierSegments, updatePathFromSegments } from '../../../utils/helpers';

export class ReimagineHandler {
    constructor(el) {
        if (el.type !== 'path') {
            return;
        }
        this.el = el;
        this.controlPointSelection = new G();
    }

    init() {
        this.el.root().put(this.controlPointSelection);
        this.createSegments();
        this.observer = new MutationObserver(() => {
            this._segments = null;
            this.updateSegments({});
        });
        this.observer.observe(this.el.node, {
            attributes: true,
            childList: true,
            subtree: true,
        });
    }

    active(val) {
        if (!val) {
            this._segments = null;
            this.observer.disconnect();
            this.controlPointSelection.clear().remove();
            return;
        }
        this.init();
    }

    getPathSegments() {
        if (this._segments) {
            return this._segments;
        }
        this._segments = getCubicBezierSegments(this.el);
        return this._segments;
    }

    createSegments() {
        const pathSegments = this.getPathSegments();
        for (let i = 0; i < pathSegments.length; i++) {
            const segment = pathSegments[i];
            const { startPoint, controlPoints, endPoint } = segment;
            // draw circles at the control points, and lines from the start point to the control points and the control points to the end point
            this.controlPointSelection
                .line(startPoint[0], startPoint[1], controlPoints[0][0], controlPoints[0][1])
                .stroke({ color: 'red', width: 2 });
            this.controlPointSelection.line(controlPoints[1][0], controlPoints[1][1], endPoint[0], endPoint[1]).stroke({ color: 'red', width: 2 });
            const controlPoint1 = this.controlPointSelection
                .circle(3)
                .center(controlPoints[0][0], controlPoints[0][1])
                .stroke({ color: 'black', width: 2 });
            const controlPoint2 = this.controlPointSelection
                .circle(3)
                .center(controlPoints[1][0], controlPoints[1][1])
                .stroke({ color: 'black', width: 2 });
            controlPoint1.draggable();
            controlPoint2.draggable();
            controlPoint1.on('dragstart', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                controlPoint2.draggable(false);
                this.el.fire('beforereimagine', { segments: this.getPathSegments() });
            });
            controlPoint2.on('dragstart', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                controlPoint1.draggable(false);
                this.el.fire('beforereimagine', { segments: this.getPathSegments() });
            });
            controlPoint1.on('dragmove', (ev) => this.onDragMove(ev, i, 0));
            controlPoint2.on('dragmove', (ev) => this.onDragMove(ev, i, 1));
            controlPoint1.on('dragend', (ev) => this.onDragEnd(ev, i, 0));
            controlPoint2.on('dragend', (ev) => this.onDragEnd(ev, i, 1));
        }
    }

    updateSegments({ updateElement = false }) {
        const pathSegments = this.getPathSegments();
        for (let i = 0; i < pathSegments.length; i++) {
            const { startPoint, controlPoints, endPoint } = pathSegments[i];
            const [line1, line2] = this.getLines(i);
            line1.plot(startPoint[0], startPoint[1], controlPoints[0][0], controlPoints[0][1]);
            line2.plot(controlPoints[1][0], controlPoints[1][1], endPoint[0], endPoint[1]);
            const [controlPoint1, controlPoint2] = this.getControlPoints(i);
            controlPoint1.center(controlPoints[0][0], controlPoints[0][1]);
            controlPoint2.center(controlPoints[1][0], controlPoints[1][1]);
        }
        if (updateElement) {
            updatePathFromSegments(this.el, pathSegments);
        }
    }

    getLines(index) {
        return [this.controlPointSelection.get(index * 4), this.controlPointSelection.get(index * 4 + 1)];
    }

    getControlPoints(index) {
        return [this.controlPointSelection.get(index * 4 + 2), this.controlPointSelection.get(index * 4 + 3)];
    }

    onDragMove(ev, segmentIndex, controlPointIndex) {
        ev.preventDefault();
        ev.stopPropagation();
        const { box } = ev.detail;
        const segment = this.getPathSegments()[segmentIndex];
        const controlPoints = segment.controlPoints;
        controlPoints[controlPointIndex] = [box.x + box.width / 2, box.y + box.height / 2];
        this._segments[segmentIndex] = { ...segment, controlPoints };
        this.updateSegments({ updateElement: true });
    }

    onDragEnd(ev, segmentIndex, controlPointIndex) {
        ev.preventDefault();
        ev.stopPropagation();
        const [controlPoint1, controlPoint2] = this.getControlPoints(segmentIndex);
        if (controlPointIndex === 0) {
            controlPoint2.draggable(true);
        } else {
            controlPoint1.draggable(true);
        }
    }
}
