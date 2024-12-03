import PropTypes from 'prop-types';
import { useRef, useEffect, useState } from 'react';
import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import { Box, Group, Text } from '@mantine/core';
import classes from './styles.module.css';
import cx from 'clsx';
import { convertShapesToPaths, wrapTextNodesInGroup } from '../../utils/helpers';
import 'path-data-polyfill';

import './plugins';
import { useUndo } from './hooks/undo';
import { useCopy } from './hooks/copy';
import { useDelete } from './hooks/delete';
import { notifications } from '@mantine/notifications';

export const Editor = ({ svgString, mode, actionStack, setActionStack, setSelectedObjectForEditPanel, addToActionStack, onExport }) => {
    const ref = useRef(null);
    const svg = useRef(null);
    const isGridActive = useRef(false);
    const initialViewBox = useRef(null);
    const [selectedObjectForTransform, setSelectedObjectForTransform] = useState(null);
    const addListeners = (obj) => {
        if (!obj || obj.hasClass('svg__external')) {
            return;
        }
        removeListeners(obj);
        for (const child of obj.children()) {
            addListeners(child);
        }
        if (obj.type === 'svg') {
            return;
        }
        obj.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            selectObject(obj);
        });
        obj.on('beforeresize', (e) => {
            const { box, transform } = e.detail;
            addToActionStack({
                type: 'resize',
                details: {
                    obj,
                    box,
                    transform,
                },
            });
        });
        obj.on('beforedrag', (e) => {
            const { box } = e.detail;
            addToActionStack({
                type: 'drag',
                details: { obj, box },
            });
        });
        obj.on('beforereimagine', (e) => {
            const { getSegments } = e.detail;
            addToActionStack({
                type: 'reimagine',
                details: { obj, segments: getSegments() },
            });
        });
    };
    const removeListeners = (obj) => {
        if (!obj) {
            return;
        }
        for (const child of obj.children()) {
            removeListeners(child);
        }
        if (obj.type === 'svg') {
            return;
        }
        obj.off('click');
        obj.off('beforeresize');
        obj.off('beforedrag');
        obj.off('beforereimagine');
    };

    // initialize the svg
    useEffect(() => {
        const currentRef = ref.current;
        const resetZoom = () => {
            if (initialViewBox.current) {
                svg.current.viewbox(initialViewBox.current);
            }
        };
        const exportSvg = () => {
            if (!svg.current) {
                return;
            }
            resetZoom();
            const clonedSvg = svg.current.clone();
            const removeExternalElements = (el) => {
                if (el.hasClass('svg__external')) {
                    el.remove();
                    return;
                }
                for (const child of el.children()) {
                    removeExternalElements(child);
                }
            };
            removeExternalElements(clonedSvg);
            const svgString = clonedSvg.svg();
            console.log(onExport);
            if (onExport) {
                onExport(svgString);
                return;
            }
            // download the svg string as a file
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'export.svg';
            a.click();
        };
        const toggleGrid = () => {
            if (!svg.current) {
                return;
            }
            svg.current.grid(!isGridActive.current);
            isGridActive.current = !isGridActive.current;
        };
        if (currentRef && svgString) {
            const svgElement = SVG(svgString).addTo(currentRef).addClass(classes.editor);
            convertShapesToPaths(svgElement);
            wrapTextNodesInGroup(svgElement);
            // wrapNakedTextNodesInTspan(svgElement);
            svg.current = svgElement;
            const viewbox = svg.current.viewbox();
            if (viewbox.width === 0 || viewbox.height === 0) {
                svg.current.viewbox(0, 0, svg.current.width(), svg.current.height());
            }
            initialViewBox.current = svg.current.viewbox();
            svg.current.panZoom({
                zoomMin: 0.5,
                zoomMax: 10,
                zoomFactor: 0.1,
                panButton: 1,
            });
            setActionStack([]);
            selectObject(null);
            if (isGridActive.current) {
                svg.current.grid(true);
            }
        }
        document.addEventListener('editor:resetZoom', resetZoom);
        document.addEventListener('editor:exportSvg', exportSvg);
        document.addEventListener('editor:toggleGrid', toggleGrid);
        return () => {
            if (currentRef) {
                currentRef.innerHTML = '';
            }
            document.removeEventListener('editor:resetZoom', resetZoom);
            document.removeEventListener('editor:exportSvg', exportSvg);
            document.removeEventListener('editor:toggleGrid', toggleGrid);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [svgString]);
    const selectObject = (obj) => {
        if (obj && obj.type === 'svg') {
            return;
        }
        const addTransformHandlers = (obj) => {
            if (['text', 'tspan'].includes(obj.type)) {
                obj.select(true, { noHandles: true });
                return;
            }
            obj.select().resize().draggable();
            obj.node.style.cursor = 'move';
        };
        const removeTransformHandlers = (obj) => {
            if (['text', 'tspan'].includes(obj.type)) {
                obj.select(false, { noHandles: true });
                return;
            }
            obj.select(false).resize(false).draggable(false);
            obj.node.style.cursor = 'default';
        };
        const addReimagineHandlers = (obj) => {
            if (['text', 'tspan'].includes(obj.type)) {
                return;
            }
            obj.reimagine().draggable();
            obj.node.style.cursor = 'move';
        };
        const removeReimagineHandlers = (obj) => {
            if (['text', 'tspan'].includes(obj.type)) {
                return;
            }
            obj.reimagine(false).draggable(false);
            obj.node.style.cursor = 'default';
        };
        let newSelectedObjectForTransform = selectedObjectForTransform;
        if (selectedObjectForTransform) {
            // deselect the current object
            removeTransformHandlers(selectedObjectForTransform);
            removeReimagineHandlers(selectedObjectForTransform);
            newSelectedObjectForTransform = null;
        }
        newSelectedObjectForTransform = obj;
        if (newSelectedObjectForTransform) {
            // select the new object
            if (mode === 'transform') {
                addTransformHandlers(newSelectedObjectForTransform);
            } else if (mode === 'reimagine') {
                addReimagineHandlers(newSelectedObjectForTransform);
            } else if (mode === 'split') {
                const oldObject = newSelectedObjectForTransform;
                const splitObject = newSelectedObjectForTransform.split();
                if (splitObject !== oldObject) {
                    notifications.show({
                        title: 'Split',
                        message: 'Split object successfully',
                    });
                    addToActionStack({
                        type: 'split',
                        details: { oldObject, newObject: splitObject },
                        after: () => {
                            removeListeners(oldObject);
                            addListeners(oldObject);
                            setSelectedObjectForTransform((prev) => {
                                if (splitObject.has(prev) || splitObject === prev) {
                                    removeTransformHandlers(prev);
                                    removeReimagineHandlers(prev);
                                }
                                return oldObject;
                            });
                        },
                    });
                    addListeners(splitObject);
                }
                newSelectedObjectForTransform = splitObject;
            }
            newSelectedObjectForTransform.node.style.cursor = 'move';
        }
        setSelectedObjectForTransform(newSelectedObjectForTransform);
    };
    useEffect(() => {
        addListeners(svg.current);
        if (mode !== 'split') {
            selectObject(selectedObjectForTransform);
        } else {
            selectObject(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, svg.current]);
    useUndo({
        selectedObject: selectedObjectForTransform,
        actionStack,
        setActionStack,
        addListeners,
        svg,
        selectObject,
    });
    useCopy({
        selectedObject: selectedObjectForTransform,
        mode,
        addToActionStack,
        addListeners,
        selectObject,
        svg,
    });
    useDelete({
        selectedObject: selectedObjectForTransform,
        addToActionStack,
        selectObject,
        mode,
    });
    useEffect(() => {
        if (selectedObjectForTransform && !['g'].includes(selectedObjectForTransform.type)) {
            setSelectedObjectForEditPanel(selectedObjectForTransform);
        } else {
            setSelectedObjectForEditPanel(null);
        }
        addListeners(svg.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedObjectForTransform]);
    const selectedObjectParents = selectedObjectForTransform
        ? new Array(...selectedObjectForTransform.parents()).reverse().concat(selectedObjectForTransform)
        : [];
    return (
        <Box pos="relative" flex="auto">
            <Group pos="absolute" top={0} left={50} gap={0}>
                {selectedObjectParents.map((obj) => (
                    <Box
                        key={obj.id()}
                        className={cx(classes.selectedObject__name, {
                            [classes.selectedObject__name_selected]: obj.id() === selectedObjectForTransform?.id(),
                        })}
                        onClick={() => {
                            selectObject(obj);
                        }}
                    >
                        <Text>{obj.type}</Text>
                    </Box>
                ))}
            </Group>
            <Box mx="auto" w="100%" ref={ref} />
        </Box>
    );
};

Editor.propTypes = {
    svgString: PropTypes.string,
    mode: PropTypes.string.isRequired,
    actionStack: PropTypes.array.isRequired,
    setActionStack: PropTypes.func.isRequired,
    setSelectedObjectForEditPanel: PropTypes.func,
    addToActionStack: PropTypes.func,
    onExport: PropTypes.func,
};
