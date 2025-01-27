import { Group, Menu, UnstyledButton, Stack } from '@mantine/core';
import PropTypes from 'prop-types';
import { FileMenu } from './FileMenu';
import { IconArrowBackUp, IconFileExport, IconZoomReset } from '@tabler/icons-react';
import { Button } from './Button';

export const MenuBar = ({ actionStack, setSvgString }) => {
    return (
        <Group>
            <MenuItem title="File">
                <Stack miw={150} style={{ gap: 10 }}>
                    <FileMenu setSvgString={setSvgString} />
                    <Button
                        leftSection={<IconFileExport />}
                        onClick={() => {
                            const event = new Event('editor:exportSvg');
                            document.dispatchEvent(event);
                        }}
                    >
                        Export
                    </Button>
                </Stack>
            </MenuItem>
            <MenuItem title="Edit">
                <Stack miw={150} style={{ gap: 10 }}>
                    <Button
                        disabled={actionStack.length === 0}
                        onClick={() => {
                            const event = new KeyboardEvent('keydown', {
                                key: 'z',
                                ctrlKey: true,
                            });
                            document.dispatchEvent(event);
                        }}
                        leftSection={<IconArrowBackUp />}
                        c={actionStack.length === 0 ? 'gray' : 'blue'}
                    >
                        Undo
                    </Button>
                    <Button
                        onClick={() => {
                            const event = new Event('editor:resetZoom');
                            document.dispatchEvent(event);
                        }}
                        leftSection={<IconZoomReset />}
                    >
                        Reset zoom
                    </Button>
                </Stack>
            </MenuItem>
        </Group>
    );
};

MenuBar.propTypes = {
    actionStack: PropTypes.array.isRequired,
    setSvgString: PropTypes.func.isRequired,
};

const MenuItem = ({ title, children }) => {
    return (
        <Menu shadow="md" width="fit-content">
            <Menu.Target>
                <UnstyledButton ml="md" py="sm">
                    {title}
                </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>{children}</Menu.Dropdown>
        </Menu>
    );
};

MenuItem.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
};
