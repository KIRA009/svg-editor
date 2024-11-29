import { ActionIcon, Stack, Tooltip } from '@mantine/core';
import { IconArrowsSplit, IconGrid3x3, IconPointer, IconPointerCog } from '@tabler/icons-react';
import classes from './styles.module.css';
import PropTypes from 'prop-types';

export const ToolBar = ({ mode, setMode }) => {
    return (
        <Stack justify="start" h="100%" gap={0}>
            <CustomActionIcon onClick={() => setMode('transform')} active={mode === 'transform'}>
                <Tooltip.Floating label="Transform">
                    <IconPointer />
                </Tooltip.Floating>
            </CustomActionIcon>
            <CustomActionIcon onClick={() => setMode('reimagine')} active={mode === 'reimagine'}>
                <Tooltip.Floating label="Reimagine">
                    <IconPointerCog />
                </Tooltip.Floating>
            </CustomActionIcon>
            <CustomActionIcon onClick={() => setMode('split')} active={mode === 'split'}>
                <Tooltip.Floating label="Split">
                    <IconArrowsSplit />
                </Tooltip.Floating>
            </CustomActionIcon>
            <CustomActionIcon
                onClick={() => {
                    document.dispatchEvent(new Event('editor:toggleGrid'));
                }}
                active={mode === 'grid'}
            >
                <Tooltip.Floating label="Toggle Grid">
                    <IconGrid3x3 />
                </Tooltip.Floating>
            </CustomActionIcon>
        </Stack>
    );
};

ToolBar.propTypes = {
    mode: PropTypes.string.isRequired,
    setMode: PropTypes.func.isRequired,
};

const CustomActionIcon = ({ active, ...props }) => {
    return <ActionIcon variant="default" bg={active ? 'gray.2' : 'transparent'} className={classes.actionIcon} px={10} py={20} w="100%" {...props} />;
};

CustomActionIcon.propTypes = {
    active: PropTypes.bool,
};
