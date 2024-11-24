import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import { Box, Group, Paper, Text } from '@mantine/core';
import classes from './styles.module.css';
import cx from 'clsx';
import { convertShapesToPaths, wrapTextNodesInGroup } from '../../utils/helpers';
import 'path-data-polyfill';

import './plugins';
import { useUndo } from './hooks/undo';
import { useCopy } from './hooks/copy';
import { useDelete } from './hooks/delete';
import { Panel } from './Panel';

export const Editor = ({ svgString, mode, refresh, actionStack }) => {
    const ref = useRef(null);
    const svg = useRef(null);
    const selectedObjectForTransform = useRef(null);
    const selectedObjectForEditPanel = useRef(null);
    const copiedObject = useRef(null);
    const addToActionStack = (action) => {
        console.log('addToActionStack', action.type, action.details);
        actionStack.current.push(action);
        refresh();
    };
    const addListeners = (obj) => {
        const classes = obj.classes();
        for (const className of classes) {
            if (className.includes('svg_select')) {
                return;
            }
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
            const { segments } = e.detail;
            addToActionStack({
                type: 'reimagine',
                details: { obj, segments },
            });
        });
        for (const child of obj.children()) {
            addListeners(child);
        }
    };
    const removeListeners = (obj) => {
        obj.off('click');
        obj.off('beforeresize');
        obj.off('beforedrag');
        obj.off('beforereimagine');
        for (const child of obj.children()) {
            removeListeners(child);
        }
    };

    // initialize the svg
    useEffect(() => {
        const currentRef = ref.current;
        if (currentRef) {
            const svgElement = SVG(svgString).addTo(currentRef);
            convertShapesToPaths(svgElement);
            wrapTextNodesInGroup(svgElement);
            svg.current = svgElement;
            svg.current.panZoom({
                zoomMin: 1,
                zoomMax: 10,
                zoomFactor: 0.1,
                panButton: 1,
            });
            for (const child of svg.current.children()) {
                addListeners(child);
            }
            actionStack.current = [];
        }
        return () => {
            if (currentRef) {
                currentRef.innerHTML = '';
            }
            for (const child of svg.current.children()) {
                removeListeners(child);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const selectObject = (obj, forceUpdate = false) => {
        if (obj && obj.type === 'svg') {
            return;
        }
        const addTransformHandlers = (obj) => {
            obj.select().resize().draggable();
            obj.node.style.cursor = 'move';
        };
        const removeTransformHandlers = (obj) => {
            obj.select(false).resize(false).draggable(false);
            obj.node.style.cursor = 'default';
        };
        const addReimagineHandlers = (obj) => {
            obj.reimagine().draggable();
            obj.node.style.cursor = 'move';
        };
        const removeReimagineHandlers = (obj) => {
            obj.reimagine(false).draggable(false);
            obj.node.style.cursor = 'default';
        };
        if (selectedObjectForTransform.current && obj && selectedObjectForTransform.current.id() === obj.id()) {
            if (forceUpdate) {
                removeTransformHandlers(selectedObjectForTransform.current);
                removeReimagineHandlers(selectedObjectForTransform.current);
                if (mode === 'transform') {
                    addTransformHandlers(selectedObjectForTransform.current);
                } else if (mode === 'reimagine') {
                    addReimagineHandlers(selectedObjectForTransform.current);
                }
                return;
            }
            // clicked on the same object, do nothing
            return;
        }
        if (selectedObjectForTransform.current) {
            // deselect the current object
            if (mode === 'transform') {
                removeTransformHandlers(selectedObjectForTransform.current);
            } else if (mode === 'reimagine') {
                removeReimagineHandlers(selectedObjectForTransform.current);
            }
            selectedObjectForTransform.current = null;
        }
        selectedObjectForTransform.current = obj && obj.type === 'text' ? obj.parent() : obj;
        if (obj && obj.type !== 'g') {
            selectedObjectForEditPanel.current = obj;
        } else {
            selectedObjectForEditPanel.current = null;
        }
        if (selectedObjectForTransform.current) {
            // select the new object
            if (mode === 'transform') {
                addTransformHandlers(selectedObjectForTransform.current);
            } else if (mode === 'reimagine') {
                addReimagineHandlers(selectedObjectForTransform.current);
            }
            selectedObjectForTransform.current.node.style.cursor = 'move';
        }
        refresh();
    };
    useEffect(() => {
        console.log('useEffect', mode);
        selectObject(selectedObjectForTransform.current, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);
    useUndo({
        selectedObject: selectedObjectForTransform,
        actionStack,
        addListeners,
        svg,
        selectObject,
        refresh,
    });
    useCopy({
        selectedObject: selectedObjectForTransform,
        mode,
        copiedObject,
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
    // create a top down panel of the selected object, its parent, its grandparent, etc.
    const selectedObjectStack = (() => {
        const stack = [];
        let currentObject = selectedObjectForTransform.current;
        while (currentObject) {
            // add to the first position of the array
            stack.unshift(currentObject);
            if (currentObject.type === 'svg') {
                break;
            }
            currentObject = currentObject.parent();
        }
        return stack;
    })();
    const removeSelectedObjectPanel = () => {
        selectedObjectForEditPanel.current = null;
        refresh();
    };
    return (
        <Box pos="relative" w="100%">
            <Group pos="absolute" top={0} left={50} gap={0}>
                {selectedObjectStack.map((obj) => (
                    <Box
                        key={obj.id()}
                        className={cx(classes.selectedObject__name, {
                            [classes.selectedObject__name_selected]: obj.id() === selectedObjectForTransform.current?.id(),
                        })}
                        onClick={() => {
                            selectObject(obj);
                        }}
                    >
                        <Text>{obj.constructor.name}</Text>
                    </Box>
                ))}
            </Group>
            <Box className={classes.editor} mx="auto" w="fit-content" mt={200} ref={ref} />
            {selectedObjectForEditPanel.current && (
                <Paper
                    mih={200}
                    miw={400}
                    p="md"
                    key={selectedObjectForEditPanel.current.id()}
                    className={classes.selectedObject__panel}
                    shadow="md"
                    radius="md"
                >
                    <Panel selectedObject={selectedObjectForEditPanel} addToActionStack={addToActionStack} closePanel={removeSelectedObjectPanel} />
                </Paper>
            )}
        </Box>
    );
};

Editor.propTypes = {
    svgString: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    refresh: PropTypes.func.isRequired,
    actionStack: PropTypes.object.isRequired,
};
