import { Accordion, ActionIcon, Box, ColorInput, Divider, Group, NumberInput, Slider, Stack, Text, Textarea } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from '../../utils/hooks';

export const Panel = ({ selectedObject, addToActionStack, closePanel }) => {
    if (!selectedObject) {
        return null;
    }
    let fields = null;
    if (['text', 'tspan'].includes(selectedObject.type)) {
        fields = (
            <Accordion multiple>
                <Stack style={{ gap: 20 }}>
                    <TextFields node={selectedObject.node} addToActionStack={addToActionStack} />
                </Stack>
            </Accordion>
        );
    } else {
        fields = <ElementFields selectedObject={selectedObject} addToActionStack={addToActionStack} />;
    }
    return (
        <Box pos="relative" miw={400} mih={200} p="md">
            <Group align="center" mb="md" style={{ justifyContent: 'space-between' }}>
                <Text>Editing {selectedObject.type} node</Text>
                <ActionIcon variant="subtle" onClick={closePanel} top={0} right={0}>
                    <IconX />
                </ActionIcon>
            </Group>
            <Stack style={{ gap: 20 }}>{fields}</Stack>
        </Box>
    );
};

const TextFields = ({ node, addToActionStack, level = 0 }) => {
    if (node.nodeName === '#text') {
        return (
            <>
                <NakedTextFields node={node} addToActionStack={addToActionStack} />
                <Divider />
            </>
        );
    }
    const children = Array.from(node.childNodes);
    return (
        <Accordion.Item value={node.instance.id()} style={{ borderBottom: 0 }}>
            <Accordion.Control style={{ padding: 0 }} bg="gray.3" px="md">
                {node.textContent}
            </Accordion.Control>
            <Accordion.Panel
                styles={{
                    content: {
                        padding: 0,
                    },
                }}
            >
                <Stack style={{ gap: 20 }}>
                    <ElementFields selectedObject={node.instance} addToActionStack={addToActionStack} />
                    {children.map((child, index) => (
                        <TextFields node={child} addToActionStack={addToActionStack} key={index} level={level + 1} />
                    ))}
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
    );
};

const NakedTextFields = ({ node, addToActionStack }) => {
    const [text, setText] = useState(node.textContent);
    const currentText = useRef(null);
    const onChangeText = (e) => {
        const newText = e.target.value;
        if (currentText.current === null) {
            currentText.current = text;
        }
        setText(newText);
        node.textContent = newText;
        dispatchChange();
    };
    const dispatchChange = useDebouncedCallback(() => {
        console.log('dispatchChange');
        addToActionStack({
            type: 'text',
            details: { obj: node, text: currentText.current },
        });
        currentText.current = null;
    }, 500);
    return <Textarea label="Text" value={text} onChange={onChangeText} />;
};

const ElementFields = ({ selectedObject, addToActionStack }) => {
    const getAttribute = (attribute, defaultValue) => selectedObject.attr(attribute) || defaultValue;
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
            details: { obj: selectedObject, fill: getAttribute('fill', 'none') },
        });
        setFill(_fill);
        selectedObject.fill(_fill);
    };
    const onChangeStroke = (property) => {
        return (value) => {
            if (stroke[property] === value) {
                return;
            }
            addToActionStack({
                type: 'stroke',
                details: { obj: selectedObject, stroke },
            });
            setStroke({
                ...stroke,
                [property]: value,
            });
            selectedObject.stroke({
                [property]: value,
            });
        };
    };
    return (
        <>
            <ColorInput label="Fill" value={fill} format="rgba" fixOnBlur={false} onChangeEnd={onChangeFill} popoverProps={{ withinPortal: false }} />
            <ColorInput
                label="Stroke"
                value={stroke.color}
                format="rgba"
                fixOnBlur={false}
                onChangeEnd={onChangeStroke('color')}
                popoverProps={{ withinPortal: false }}
            />
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
        </>
    );
};

const PanelPropTypes = {
    selectedObject: PropTypes.object.isRequired,
    addToActionStack: PropTypes.func.isRequired,
};

const TextFieldsPropTypes = {
    node: PropTypes.object.isRequired,
    addToActionStack: PropTypes.func.isRequired,
    level: PropTypes.number,
};
NakedTextFields.propTypes = TextFieldsPropTypes;
TextFields.propTypes = TextFieldsPropTypes;
ElementFields.propTypes = PanelPropTypes;
Panel.propTypes = {
    ...PanelPropTypes,
    closePanel: PropTypes.func.isRequired,
};
