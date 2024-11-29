import './App.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { Box, createTheme, Group, MantineProvider, Paper, Stack } from '@mantine/core';
import { Editor } from './components/Editor';
import { MenuBar } from './components/MenuBar';
import { ToolBar } from './components/ToolBar';
import { useState } from 'react';
import { Panel } from './components/Editor/Panel';
import { Notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';

const theme = createTheme();

function App({ svgString: _svgString = null, onExport = null }) {
    const [mode, setMode] = useState('transform');
    const [svgString, setSvgString] = useState(_svgString);
    const [actionStack, setActionStack] = useState([]);
    const [selectedObjectForEditPanel, setSelectedObjectForEditPanel] = useState(null);
    const addToActionStack = (action) => {
        setActionStack((prev) => [...prev, action]);
    };
    const removeSelectedObjectPanel = () => {
        setSelectedObjectForEditPanel(null);
    };
    return (
        <MantineProvider theme={theme}>
            <Notifications limit={1} position="bottom-center" autoClose={500} />
            <Stack gap={0}>
                <Box miw={'100%'} bg="gray.1" pos="sticky" top={0} style={{ zIndex: 1000 }}>
                    <MenuBar actionStack={actionStack} setSvgString={setSvgString} />
                </Box>
                <Group pos="relative" align="start">
                    <Box pos="sticky" top={50} left={0} bg="white" style={{ zIndex: 1000 }}>
                        <ToolBar mode={mode} setMode={setMode} />
                    </Box>
                    <Box
                        my={50}
                        pos="relative"
                        flex="auto"
                        maw="100%"
                        style={{
                            overflowX: 'auto',
                        }}
                    >
                        <Editor
                            svgString={svgString}
                            mode={mode}
                            actionStack={actionStack}
                            setActionStack={setActionStack}
                            setSelectedObjectForEditPanel={setSelectedObjectForEditPanel}
                            addToActionStack={addToActionStack}
                            onExport={onExport}
                        />
                    </Box>
                    {selectedObjectForEditPanel && (
                        <Paper pos="absolute" top={0} right={0} bg="white" shadow="sm">
                            <Panel
                                key={selectedObjectForEditPanel.id()}
                                selectedObject={selectedObjectForEditPanel}
                                addToActionStack={addToActionStack}
                                closePanel={removeSelectedObjectPanel}
                            />
                        </Paper>
                    )}
                </Group>
            </Stack>
        </MantineProvider>
    );
}

App.propTypes = {
    svgString: PropTypes.string,
    onExport: PropTypes.func,
};

export default App;
