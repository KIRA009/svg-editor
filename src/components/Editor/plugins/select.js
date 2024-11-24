import { G } from '@svgdotjs/svg.js';
import { transformPoint } from '../../../utils/helpers';

const getMouseDownFunc = (eventName, el, points, index = null) => {
    return function (ev) {
        ev.preventDefault();
        ev.stopPropagation();

        var x = ev.pageX || ev.touches[0].pageX;
        var y = ev.pageY || ev.touches[0].pageY;
        el.fire(eventName, { x, y, event: ev, index, points });
    };
};

export class SelectHandler {
    constructor(el) {
        this.el = el;
        this.selection = new G();
        this.order = ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l', 'rot'];
    }

    init() {
        // mount group
        this.el.root().put(this.selection);
        this.initialised = false;
        this.bindResizeEvents();
        this.updatePoints();
        this.createSelection();
        this.createResizeHandles();
        this.updateResizeHandles();
        this.createRotationHandle();
        this.updateRotationHandle();
    }

    active(val) {
        // Disable selection
        if (!val) {
            this.selection.clear().remove();
            this.unbindResizeEvents();
            return;
        }

        // Enable selection
        this.init();
    }

    createSelection() {
        this.selection.polygon(this.handlePoints).addClass('svg_select_shape');
    }

    updateSelection() {
        this.selection.get(0).plot(this.handlePoints);
    }

    createResizeHandles() {
        this.handlePoints.forEach((p, index) => {
            const name = this.order[index];
            this.createHandleFn(this.selection);

            this.selection
                .get(index + 1)
                .addClass('svg_select_handle svg_select_handle_' + name)
                .on('mousedown.selection touchstart.selection', getMouseDownFunc(name, this.el, this.handlePoints, index));
        });
    }

    createHandleFn(group) {
        group.circle();
    }

    updateHandleFn(shape, point) {
        const radius = 3;
        shape.center(point[0], point[1]).radius(radius).fill('black');
    }

    updateResizeHandles() {
        this.handlePoints.forEach((p, index) => {
            this.updateHandleFn(this.selection.get(index + 1), p);
        });
    }

    createRotFn(group) {
        group.line();
        group.circle(5);
    }

    getPoint(name) {
        return this.handlePoints[this.order.indexOf(name)];
    }

    getPointHandle(name) {
        return this.selection.get(this.order.indexOf(name) + 1);
    }

    updateRotFn(group, rotPoint) {
        const topPoint = this.getPoint('t');
        group.get(0).plot(topPoint[0], topPoint[1], rotPoint[0], rotPoint[1]);
        group.get(1).center(rotPoint[0], rotPoint[1]);
    }

    createRotationHandle() {
        const handle = this.selection
            .group()
            .addClass('svg_select_handle_rot')
            .on('mousedown.selection touchstart.selection', getMouseDownFunc('rot', this.el, this.handlePoints));

        this.createRotFn(handle);
    }

    updateRotationHandle() {
        const group = this.selection.findOne('g.svg_select_handle_rot');
        this.updateRotFn(group, this.rotationPoint, this.handlePoints);
    }

    getBBox() {
        const bbox = this.el.bbox();
        if (this.initialised) {
            return bbox;
        }
        const minDiff = 50;
        // initially, make it easier to select by making the selection box wider if it's too narrow
        this.initialised = true;
        if (bbox.x2 - bbox.x < minDiff) {
            // calculate difference
            const diff = Math.abs(bbox.x2 - bbox.cx);
            // make the diff atleast 20, so the selection box is not too narrow
            const diffToAdd = Math.max(minDiff / 2 - diff, 0);
            bbox.x -= diffToAdd / 2;
            bbox.x2 += diffToAdd / 2;
        }
        if (bbox.y2 - bbox.y < minDiff) {
            const diff = Math.abs(bbox.y2 - bbox.cy);
            const diffToAdd = Math.max(minDiff / 2 - diff, 0);
            bbox.y -= diffToAdd / 2;
            bbox.y2 += diffToAdd / 2;
        }
        // if the height is too narrow, increase it to atleast 40
        return bbox;
    }

    // gets new bounding box points and transform them into the elements space
    updatePoints() {
        const bbox = this.getBBox();
        const fromShapeToUiMatrix = this.el.root().screenCTM().inverseO().multiplyO(this.el.screenCTM());
        this.handlePoints = this.getHandlePoints(bbox).map((p) => transformPoint(p, fromShapeToUiMatrix));
        this.rotationPoint = transformPoint(this.getRotationPoint(bbox), fromShapeToUiMatrix);
    }

    // A collection of all the points we need to draw our ui
    getHandlePoints({ x, x2, y, y2, cx, cy }) {
        return [
            [x, y],
            [cx, y],
            [x2, y],
            [x2, cy],
            [x2, y2],
            [cx, y2],
            [x, y2],
            [x, cy],
        ];
    }

    // A collection of all the points we need to draw our ui
    getRotationPoint({ y, cx } = this.el.bbox()) {
        return [cx, y - 20];
    }

    bindResizeEvents() {
        this.observer = new MutationObserver(() => {
            this.refresh();
        });
        this.observer.observe(this.el.node, {
            attributes: true,
            childList: true,
            subtree: true,
        });
        this.el.on('resize', () => {
            this.refresh();
        });
    }

    unbindResizeEvents() {
        this.observer.disconnect();
        this.el.off('resize');
    }

    refresh() {
        this.updatePoints();
        this.updateSelection();
        this.updateResizeHandles();
        this.updateRotationHandle();
    }
}
