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
        console.log('addToActionStack', action.type);
        actionStack.current.push(action);
        refresh();
    };
    const addListeners = (obj) => {
        if (!obj) {
            return;
        }
        for (const child of obj.children()) {
            addListeners(child);
        }
        if (obj.type === 'svg') {
            return;
        }
        obj.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('clicked on', obj.id());
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
        if (currentRef && svgString) {
            const svgElement = SVG(svgString).addTo(currentRef);
            convertShapesToPaths(svgElement);
            wrapTextNodesInGroup(svgElement);
            svg.current = svgElement;
            const viewbox = svg.current.viewbox();
            if (viewbox.width === 0 || viewbox.height === 0) {
                svg.current.viewbox(0, 0, svg.current.width(), svg.current.height());
            }
            svg.current.panZoom({
                zoomMin: 0.5,
                zoomMax: 10,
                zoomFactor: 0.1,
                panButton: 1,
            });
            actionStack.current = [];
            refresh();
        }
        return () => {
            if (currentRef) {
                currentRef.innerHTML = '';
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [svgString]);
    const selectObject = (obj) => {
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
        if (selectedObjectForTransform.current) {
            // deselect the current object
            removeTransformHandlers(selectedObjectForTransform.current);
            removeReimagineHandlers(selectedObjectForTransform.current);
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
            } else if (mode === 'split') {
                const oldObject = selectedObjectForTransform.current.clone();
                const splitObject = selectedObjectForTransform.current.split();
                if (splitObject !== oldObject) {
                    addToActionStack({
                        type: 'split',
                        details: { oldObject, newObject: splitObject },
                        after: () => {
                            removeListeners(oldObject);
                            addListeners(oldObject);
                            selectedObjectForTransform.current = oldObject;
                            refresh();
                        },
                    });
                    addListeners(splitObject);
                }
                selectedObjectForTransform.current = splitObject;
                selectedObjectForEditPanel.current = null;
                console.log('selectedObjectForTransform.current', selectedObjectForTransform.current.node);
            }
            selectedObjectForTransform.current.node.style.cursor = 'move';
        }
        refresh();
    };
    useEffect(() => {
        console.log('useEffect', mode);
        addListeners(svg.current);
        if (mode !== 'split') {
            selectObject(selectedObjectForTransform.current);
        } else {
            selectObject(null);
        }
        return () => {
            removeListeners(svg.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, svg.current]);
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
    const removeSelectedObjectPanel = () => {
        selectedObjectForEditPanel.current = null;
        refresh();
    };
    return (
        <Box pos="relative" flex="auto">
            <Group pos="absolute" top={0} left={50} gap={0}>
                {selectedObjectForTransform.current
                    ?.parents()
                    .concat(selectedObjectForTransform.current)
                    .map((obj) => (
                        <Box
                            key={obj.id()}
                            className={cx(classes.selectedObject__name, {
                                [classes.selectedObject__name_selected]: obj.id() === selectedObjectForTransform.current?.id(),
                            })}
                            onClick={() => {
                                selectObject(obj);
                            }}
                        >
                            <Text>{obj.type}</Text>
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
    svgString: PropTypes.string,
    mode: PropTypes.string.isRequired,
    refresh: PropTypes.func.isRequired,
    actionStack: PropTypes.object.isRequired,
};
