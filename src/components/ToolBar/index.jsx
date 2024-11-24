import { ActionIcon, Stack } from '@mantine/core';
import { IconPointer, IconPointerCog } from '@tabler/icons-react';
import classes from './styles.module.css';
import PropTypes from 'prop-types';

export const ToolBar = ({ setMode }) => {
    return (
        <Stack justify="start" h="100%" gap={0}>
            <CustomActionIcon onClick={() => setMode('transform')}>
                <IconPointer />
            </CustomActionIcon>
            <CustomActionIcon onClick={() => setMode('reimagine')}>
                <IconPointerCog />
            </CustomActionIcon>
        </Stack>
    );
};

ToolBar.propTypes = {
    setMode: PropTypes.func.isRequired,
};

const CustomActionIcon = (props) => {
    return <ActionIcon variant="default" className={classes.actionIcon} {...props} />;
};
