import { Path } from '@svgdotjs/svg.js';
import { copyAttrs, getCubicBezierSegments, getPathStringFromSegments } from '../../../utils/helpers';
import { G } from '@svgdotjs/svg.js';

export class SplitHandler {
    constructor(el) {
        if (el.type !== 'path') {
            return;
        }
        this.el = el;
    }

    split() {
        const segmentArray = getCubicBezierSegments(this.el);
        if (segmentArray.length === 1) {
            return this.el;
        }
        const group = new G();
        for (const segments of segmentArray) {
            const newPath = new Path({ d: getPathStringFromSegments(segments) });
            group.add(newPath);
            copyAttrs(this.el, newPath);
        }
        this.el.replace(group);
        return group;
    }
}
