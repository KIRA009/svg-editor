import { Box, G, off, on } from '@svgdotjs/svg.js';
import { getCoordsFromEvent } from './utils';
// Creates handler, saves it
export class DragHandler {
    constructor(el) {
        this.el = el;
        this.drag = this.drag.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.endDrag = this.endDrag.bind(this);
    }

    // Enables or disabled drag based on input
    active(enabled) {
        if (enabled) {
            this.el.on('mousedown.drag', this.startDrag);
            this.el.on('touchstart.drag', this.startDrag, { passive: false });
        } else {
            this.el.off('mousedown.drag');
            this.el.off('touchstart.drag');
        }
    }

    // Start dragging
    startDrag(ev) {
        const isMouse = !ev.type.indexOf('mouse');

        // Check for left button
        if (isMouse && ev.which !== 1 && ev.buttons !== 0) {
            return;
        }

        this.box = this.el.bbox();

        // Fire beforedrag event
        if (this.el.dispatch('beforedrag', { event: ev, handler: this, box: this.box }).defaultPrevented) {
            return;
        }

        // Prevent browser drag behavior as soon as possible
        ev.preventDefault();

        // Prevent propagation to a parent that might also have dragging enabled
        ev.stopPropagation();

        // Make sure that start events are unbound so that one element
        // is only dragged by one input only
        this.active(false);
        this.lastClick = this.el.point(getCoordsFromEvent(ev));

        const eventMove = (isMouse ? 'mousemove' : 'touchmove') + '.drag';
        const eventEnd = (isMouse ? 'mouseup' : 'touchend') + '.drag';

        // Bind drag and end events to window
        on(window, eventMove, this.drag, this, { passive: false });
        on(window, eventEnd, this.endDrag, this, { passive: false });

        // Fire dragstart event
        this.el.fire('dragstart', { event: ev, handler: this, box: this.box });
    }

    // While dragging
    drag(ev) {
        const { box, lastClick } = this;

        const currentClick = this.el.point(getCoordsFromEvent(ev));
        const dx = currentClick.x - lastClick.x;
        const dy = currentClick.y - lastClick.y;

        if (!dx && !dy) return box;

        const x = box.x + dx;
        const y = box.y + dy;
        this.box = new Box(x, y, box.w, box.h);
        this.lastClick = currentClick;

        if (
            this.el.dispatch('dragmove', {
                event: ev,
                handler: this,
                box: this.box,
            }).defaultPrevented
        ) {
            return;
        }

        this.move(x, y);
    }

    move(x, y) {
        // Svg elements bbox depends on their content even though they have
        // x, y, width and height - strange!
        // Thats why we handle them the same as groups
        if (this.el.type === 'svg') {
            G.prototype.move.call(this.el, x, y);
        }
        this.el.move(x, y);
    }

    endDrag(ev) {
        // final drag
        this.drag(ev);

        // fire dragend event
        this.el.fire('dragend', { event: ev, handler: this, box: this.box });

        // unbind events
        off(window, 'mousemove.drag');
        off(window, 'touchmove.drag');
        off(window, 'mouseup.drag');
        off(window, 'touchend.drag');

        // Rebind initial Events
        this.active(true);
    }
}
