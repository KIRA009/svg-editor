import { ActionIcon, Box, ColorInput, NumberInput, Slider, Text, Textarea } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

export const Panel = ({ selectedObject, addToActionStack, closePanel }) => {
    if (!selectedObject.current) {
        return null;
    }
    let panel = null;
    if (selectedObject.current.type === 'text') {
        panel = <TextPanel selectedObject={selectedObject} addToActionStack={addToActionStack} />;
    } else {
        panel = <ElementPanel selectedObject={selectedObject} addToActionStack={addToActionStack} />;
    }
    return (
        <Box pos="relative">
            <ActionIcon variant="subtle" onClick={closePanel} pos="absolute" top={0} right={0}>
                <IconX />
            </ActionIcon>
            <Text mb="md">Editing {selectedObject.current.type} node</Text>
            {panel}
        </Box>
    );
};

const TextPanel = ({ selectedObject, addToActionStack }) => {
    const [text, setText] = useState(selectedObject.current.text());
    const onChangeText = useDebouncedCallback((e) => {
        const newText = e.target.value;
        addToActionStack({
            type: 'text',
            details: { obj: selectedObject.current, text },
        });
        selectedObject.current.text(newText);
        setText(newText);
    }, 500);
    return (
        <Box>
            <Textarea label="Text" defaultValue={text} onChange={onChangeText} />
        </Box>
    );
};

const ElementPanel = ({ selectedObject, addToActionStack }) => {
    const getAttribute = (attribute, defaultValue) => getComputedStyle(selectedObject.current.node)[attribute] || defaultValue;
    const [fill, setFill] = useState(getAttribute('fill', 'none'));
    const [stroke, setStroke] = useState({
        color: getAttribute('stroke', 'none'),
        width: getAttribute('stroke-width', 1),
        opacity: getAttribute('stroke-opacity', 1),
    });
    useEffect(() => {
        const color = getAttribute('stroke', 'none');
        const width = getAttribute('stroke-width', 1);
        const opacity = Number(getAttribute('stroke-opacity', 1));
        if (color !== stroke.color || width !== stroke.width || opacity !== stroke.opacity) {
            setStroke({ color, width, opacity });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getAttribute('stroke', 'none'), getAttribute('stroke-width', 1), getAttribute('stroke-opacity', 1)]);
    const onChangeFill = (_fill) => {
        if (_fill === fill) {
            return;
        }
        addToActionStack({
            type: 'fill',
            details: { obj: selectedObject.current, fill: getAttribute('fill', 'none') },
        });
        setFill(_fill);
        selectedObject.current.fill(_fill);
    };
    const onChangeStroke = (property) => {
        return (value) => {
            if (stroke[property] === value) {
                return;
            }
            addToActionStack({
                type: 'stroke',
                details: { obj: selectedObject.current, stroke },
            });
            setStroke({
                ...stroke,
                [property]: value,
            });
            selectedObject.current.stroke({
                [property]: value,
            });
        };
    };
    return (
        <Box>
            <ColorInput label="Fill" value={fill} onChangeEnd={onChangeFill} popoverProps={{ withinPortal: false }} />
            <ColorInput label="Stroke" value={stroke.color} onChangeEnd={onChangeStroke('color')} popoverProps={{ withinPortal: false }} />
            <NumberInput label="Stroke Width" value={stroke.width} min={0} onChange={onChangeStroke('width')} />
            <Text fw={500} fz="sm">
                Stroke Opacity
            </Text>
            <Slider
                value={stroke.opacity}
                min={0}
                max={1}
                step={0.01}
                onChange={(val) => setStroke((prev) => ({ ...prev, opacity: val }))}
                onChangeEnd={onChangeStroke('opacity')}
            />
        </Box>
    );
};

const PanelPropTypes = {
    selectedObject: PropTypes.object.isRequired,
    addToActionStack: PropTypes.func.isRequired,
};

TextPanel.propTypes = PanelPropTypes;
ElementPanel.propTypes = PanelPropTypes;
Panel.propTypes = {
    ...PanelPropTypes,
    closePanel: PropTypes.func.isRequired,
};
