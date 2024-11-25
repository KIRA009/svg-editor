import { Path } from '@svgdotjs/svg.js';
import SVGPathCommander_2 from 'svg-path-commander';

export const transformPoint = ([x, y], { a, b, c, d, e, f }) => {
    const [x1, y1] = [a * x + c * y + e, b * x + d * y + f];
    return [x1, y1];
};

export const wrapTextNodesInGroup = (svg) => {
    const wrapper = (node) => {
        if (node.type === 'text') {
            const parent = node.parent();
            const group = parent.group();
            node.toParent(group);
        } else {
            for (const child of node.children()) {
                wrapper(child);
            }
        }
        return node;
    };
    for (const child of svg.children()) {
        wrapper(child);
    }
};

const POSSIBLE_SHAPE_TYPES = ['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon'];
export const copyAttrs = (shape, newShape) => {
    const nonCopyableAttributes = ['d', 'x1', 'y1', 'x2', 'y2', 'pathLength', 'points'];
    for (const attr of shape.node.getAttributeNames()) {
        if (!nonCopyableAttributes.includes(attr)) {
            newShape.attr(attr, shape.attr(attr));
        }
    }
};
export const convertShapesToPaths = (svg) => {
    const converter = (shape) => {
        const shapeType = shape.type;
        let newShape = shape.type === 'path' ? shape : null;
        if (POSSIBLE_SHAPE_TYPES.includes(shapeType)) {
            const path = SVGPathCommander_2.shapeToPath(shape.node, false);
            if (!path) {
                console.log('no path', shape);
                return;
            }
            newShape = new Path({ d: path.getAttribute('d') });
            shape.replace(newShape);
            copyAttrs(shape, newShape);
        }
        if (!newShape) {
            console.log('no new shape', shape);
            return;
        }
        // const pathDataArray = [];
        // let currentPathData = '';
        // for (const pathData of newShape.node.getPathData({ normalize: true })) {
        //     if (pathData.type === 'M') {
        //         if (currentPathData) {
        //             pathDataArray.push(currentPathData);
        //         }
        //         currentPathData = '';
        //     }
        //     currentPathData += `${pathData.type}${pathData.values.join(',')} `;
        // }
        // if (currentPathData) {
        //     pathDataArray.push(currentPathData);
        //     currentPathData = '';
        // }
        // if (pathDataArray.length === 1) {
        //     return;
        // }
        // const g = new G();
        // for (let i = 0; i < pathDataArray.length; i++) {
        //     const pathData = pathDataArray[i];
        //     const path = new Path({ d: pathData });
        //     copyAttrs(newShape, path);
        //     g.add(path);
        // }
        // newShape.replace(g);
    };

    const wrapper = (node) => {
        converter(node);
        for (const child of node.children()) {
            wrapper(child);
        }
    };

    for (const child of svg.children()) {
        wrapper(child);
    }
};

export const getCubicBezierSegments = (el) => {
    const fromShapeToUiMatrix = el.root().screenCTM().inverseO().multiplyO(el.screenCTM());
    let startPoint = null;
    let firstPoint = null;
    const convertLineToCurve = (start, end) => {
        if (start[0] === end[0] && start[1] === end[1]) {
            return null;
        }
        const x1 = start[0] + (end[0] - start[0]) / 3;
        const y1 = start[1] + (end[1] - start[1]) / 3;
        const x2 = start[0] + (2 * (end[0] - start[0])) / 3;
        const y2 = start[1] + (2 * (end[1] - start[1])) / 3;
        return {
            startPoint: start,
            controlPoints: [
                [x1, y1],
                [x2, y2],
            ],
            endPoint: end,
        };
    };
    const segments = [];
    let currentSegmentIndex = -1;
    el.node.getPathData({ normalize: true }).forEach((command) => {
        for (let i = 0; i < command.values.length; i += 2) {
            const [x, y] = transformPoint([command.values[i], command.values[i + 1]], fromShapeToUiMatrix);
            command.values[i] = x;
            command.values[i + 1] = y;
        }
        if (command.type === 'M') {
            firstPoint = command.values;
            startPoint = command.values;
            currentSegmentIndex++;
            segments.push([]);
        } else if (command.type === 'L') {
            const curve = convertLineToCurve(startPoint, command.values);
            if (!curve) {
                return null;
            }
            startPoint = curve.endPoint;
            segments[currentSegmentIndex].push(curve);
        } else if (command.type === 'C') {
            const curve = {
                startPoint: startPoint,
                controlPoints: [
                    [command.values[0], command.values[1]],
                    [command.values[2], command.values[3]],
                ],
                endPoint: [command.values[4], command.values[5]],
            };
            startPoint = curve.endPoint;
            segments[currentSegmentIndex].push(curve);
        } else if (command.type === 'Z') {
            const curve = convertLineToCurve(startPoint, firstPoint);
            if (!curve) {
                return null;
            }
            startPoint = curve.endPoint;
            segments[currentSegmentIndex].push(curve);
        } else {
            throw new Error(`Unknown command: ${command.type}`);
        }
    });
    return segments;
};

export const getPathStringFromSegments = (segments) => {
    let pathString = ``;
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (i === 0) {
            pathString += `M${segment.startPoint[0]},${segment.startPoint[1]} C${segment.controlPoints[0][0]},${segment.controlPoints[0][1]},${segment.controlPoints[1][0]},${segment.controlPoints[1][1]},${segment.endPoint[0]},${segment.endPoint[1]} `;
        } else {
            pathString += `C${segment.controlPoints[0][0]} ${segment.controlPoints[0][1]} ${segment.controlPoints[1][0]} ${segment.controlPoints[1][1]} ${segment.endPoint[0]} ${segment.endPoint[1]} `;
        }
    }
    return pathString;
};

export const updatePathFromSegments = (el, _segmentsArray) => {
    const fromShapeToUiMatrix = el.root().screenCTM().inverseO().multiplyO(el.screenCTM()).inverseO();
    let pathString = ``;
    const segmentsArray = _segmentsArray.map((segments) =>
        segments.map((segment) => {
            const { startPoint, controlPoints, endPoint } = segment;
            return {
                startPoint: transformPoint(startPoint, fromShapeToUiMatrix),
                controlPoints: controlPoints.map((point) => transformPoint(point, fromShapeToUiMatrix)),
                endPoint: transformPoint(endPoint, fromShapeToUiMatrix),
            };
        })
    );
    for (const segments of segmentsArray) {
        pathString += getPathStringFromSegments(segments);
    }
    el.attr('d', pathString);
    el.clear();
};
