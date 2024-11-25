import { Group, Stack, Text } from '@mantine/core';
import { Editor } from './components/Editor';
import { MenuBar } from './components/MenuBar';
import { ToolBar } from './components/ToolBar';
import { useRef, useState } from 'react';

function App() {
    const [mode, setMode] = useState('transform');
    const setRefreshState = useState(false)[1];
    const [svgString, setSvgString] = useState(null);
    const actionStack = useRef([]);
    const refresh = () => {
        setRefreshState((prev) => !prev);
    };
    return (
        <Stack gap={0}>
            <MenuBar actionStack={actionStack} setSvgString={setSvgString} />
            <Group align="stretch">
                <Text>Mode: {mode}</Text>
                <ToolBar setMode={setMode} />
                <Editor svgString={svgString} mode={mode} refresh={refresh} actionStack={actionStack} />
            </Group>
        </Stack>
    );
}

export default App;
