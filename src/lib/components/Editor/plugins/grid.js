import { G } from '@svgdotjs/svg.js';

export class GridHandler {
    constructor(el) {
        this.el = el;
        this.selection = new G().addClass('svg__external');
    }

    init() {
        this.el.root().put(this.selection);
        this.createLines();
        this.el.root().on('zoom', () => this.createLines());
    }

    createLines() {
        const gap = this.el.root().width() / 20;
        // clear horizontal and vertical lines
        this.selection.clear();
        const length = 5000;
        // add horizontal lines of length 10000
        for (let i = -length / 2; i < length / 2; i += gap) {
            this.selection.add(
                this.el
                    .root()
                    .line(-length / 2, i, length / 2, i)
                    .stroke({ color: 'gray', width: 1 })
            );
        }
        // add vertical lines of length 10000
        for (let i = -length / 2; i < length / 2; i += gap) {
            this.selection.add(
                this.el
                    .root()
                    .line(i, -length / 2, i, length / 2)
                    .stroke({ color: 'gray', width: 1 })
            );
        }
    }

    destroy() {
        this.el.root().off('zoom');
        this.selection.clear().remove();
    }

    active(enabled) {
        if (!enabled) {
            this.destroy();
            return;
        }
        this.init();
    }
}
