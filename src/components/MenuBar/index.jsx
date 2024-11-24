import { Group, Menu, UnstyledButton, Stack } from '@mantine/core';
import PropTypes from 'prop-types';

export const MenuBar = ({ actionStack }) => {
    return (
        <Group width={'100%'} bg="gray.1">
            <MenuItem title="File">
                <MenuItem title="New" />
                <MenuItem title="Open" />
                <MenuItem title="Save" />
                <MenuItem title="Save As" />
            </MenuItem>
            <MenuItem title="Edit">
                <Stack>
                    <UnstyledButton
                        disabled={actionStack.current.length === 0}
                        onClick={() => {
                            // fire a ctrl + z event
                            const event = new KeyboardEvent('keydown', {
                                key: 'z',
                                ctrlKey: true,
                            });
                            document.dispatchEvent(event);
                        }}
                    >
                        Undo
                    </UnstyledButton>
                </Stack>
            </MenuItem>
            <MenuItem title="View" />
            <MenuItem title="Help" />
        </Group>
    );
};

MenuBar.propTypes = {
    refresh: PropTypes.func.isRequired,
    actionStack: PropTypes.object.isRequired,
};

const MenuItem = ({ title, children }) => {
    return (
        <Menu shadow="md" width="fit-content">
            <Menu.Target>
                <UnstyledButton>{title}</UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>{children}</Menu.Dropdown>
        </Menu>
    );
};

MenuItem.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
};
