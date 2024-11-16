import { SVG } from '@svgdotjs/svg.js';

const getAttr = (node, attrName) => {
    return node.getAttribute(attrName);
};

const getSVGObject = (node, parent) => {
    const tagName = node.tagName?.toLowerCase();
    if (!tagName) return;
    if (tagName === 'svg') return SVG();
    if (tagName === 'g') return SVG().group();
    if (tagName === 'symbol') return SVG().symbol();
    if (tagName === 'defs') return SVG().defs();
    if (tagName === 'a') return SVG().link(getAttr(node, 'href'));
    if (tagName === 'rect') return SVG().rect(getAttr(node, 'width'), getAttr(node, 'height'));
    if (tagName === 'circle') return SVG().circle(getAttr(node, 'r'));
    if (tagName === 'ellipse') return SVG().ellipse(getAttr(node, 'width'), getAttr(node, 'height'));
    if (tagName === 'line') return SVG().line(getAttr(node, 'x1'), getAttr(node, 'y1'), getAttr(node, 'x2'), getAttr(node, 'y2'));
    if (tagName === 'polyline') return SVG().line(getAttr(node, 'points'));
    if (tagName === 'polygon') return SVG().polygon(getAttr(node, 'points'));
    if (tagName === 'path') return SVG().path(getAttr(node, 'd'));
    if (tagName === 'text') return SVG().text(getAttr(node, 'x'), getAttr(node, 'y'), getAttr(node, 'text'));
    if (tagName === 'textpath') return parent.textpath(getAttr(node, 'path'));
    if (tagName === 'tspan') return parent.tspan(getAttr(node, 'text'));
    if (tagName === 'image') return SVG().image(getAttr(node, 'href'));
    if (tagName === 'lineargradient') return SVG().gradient('linear');
    if (tagName === 'radialgradient') return SVG().gradient('radial');
    if (tagName === 'stop') return parent.stop(getAttr(node, 'offset'), getAttr(node, 'style'));
    if (tagName === 'pattern') return SVG().pattern(getAttr(node, 'width'), getAttr(node, 'height'));
    if (tagName === 'mask') return SVG().mask();
    if (tagName === 'clippath') return SVG().clip();
    if (tagName === 'use') return SVG().use(getAttr(node, 'href'));
    if (tagName === 'marker')
        return SVG().marker(
            getAttr(node, 'refX'),
            getAttr(node, 'refY'),
            getAttr(node, 'markerUnits'),
            getAttr(node, 'markerWidth'),
            getAttr(node, 'markerHeight')
        );
    if (tagName === 'style') return SVG().style(getAttr(node, 'type'), getAttr(node, 'media'), getAttr(node, 'title'), getAttr(node, 'id'));
    if (tagName === 'foreignobject') return SVG().foreignObject(getAttr(node, 'width'), getAttr(node, 'height'));
    console.log('unknown tag', tagName);
    return null;
};

export const addSVGObjectToParent = (node, parent) => {
    let tagName = node.tagName?.toLowerCase();
    if (!tagName) {
        // check if node is string
        try {
            const textContent = node.textContent;
            if (textContent) {
                parent.text(textContent);
            }
        } catch (e) {
            console.log('Error getting text content', e);
        }
        return;
    }
    const svgObject = getSVGObject(node, parent);
    if (!svgObject) return;
    svgObject.addTo(parent);
    for (const attr of node.attributes) {
        svgObject.attr(attr.name, attr.value);
    }
    for (const child of node.childNodes) {
        addSVGObjectToParent(child, svgObject);
    }
};

export const calculateViewBox = (svgElement) => {
    const allElements = svgElement.querySelectorAll('*');
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

    allElements.forEach((element) => {
        if (typeof element.getBBox === 'function') {
            const bbox = element.getBBox();
            minX = Math.min(minX, bbox.x);
            minY = Math.min(minY, bbox.y);
            maxX = Math.max(maxX, bbox.x + bbox.width);
            maxY = Math.max(maxY, bbox.y + bbox.height);
        }
    });

    // Handle edge case where there are no elements
    if (minX === Infinity || minY === Infinity) {
        return '0 0 100 100'; // Default viewBox
    }

    return [minX, minY, maxX - minX, maxY - minY];
};
