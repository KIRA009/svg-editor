import { Element } from '@svgdotjs/svg.js';
import { extend } from '@svgdotjs/svg.js';
import { SelectHandler } from './select';
import { ResizeHandler } from './resize';
import { DragHandler } from './draggable';
import { ReimagineHandler } from './reimagine';
import { SplitHandler } from './split';
import { GridHandler } from './grid';

const getHandler = (handlerClass, el, enabled, ...args) => {
    if (enabled) {
        const handler = new handlerClass(el);
        handler.active(enabled, ...args);
        el.remember('_' + handlerClass.name, handler);
        return el;
    } else {
        const handler = el.remember('_' + handlerClass.name);
        if (!handler) {
            return el;
        }
        handler.active(enabled, ...args);
        el.forget('_' + handlerClass.name);
        return el;
    }
};

extend(Element, {
    select: function (enabled = true, options = {}) {
        return getHandler(SelectHandler, this, enabled, options);
    },
    resize: function (enabled = true) {
        return getHandler(ResizeHandler, this, enabled, {});
    },
    draggable: function (enabled = true) {
        return getHandler(DragHandler, this, enabled);
    },
    reimagine: function (enabled = true) {
        if (this.type !== 'path') {
            return this;
        }
        return getHandler(ReimagineHandler, this, enabled);
    },
    split: function () {
        if (this.type !== 'path') {
            return this;
        }
        return new SplitHandler(this).split();
    },
    grid: function (enabled = true) {
        if (this.type !== 'svg') {
            return this;
        }
        return getHandler(GridHandler, this, enabled);
    },
});
