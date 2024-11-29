import { Group, UnstyledButton } from '@mantine/core';
import classes from './styles.module.css';
import PropTypes from 'prop-types';

export const Button = ({ children, leftSection = null, ...props }) => {
    return (
        <UnstyledButton className={classes.button} variant="subtle" {...props}>
            <Group>
                {leftSection}
                {children}
            </Group>
        </UnstyledButton>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    leftSection: PropTypes.node,
};
