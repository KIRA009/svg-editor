import { Group, Stack } from '@mantine/core';
import { Editor } from './components/Editor';
import { svgString } from './samples/basic_bar_chart';
import { MenuBar } from './components/MenuBar';
import { ToolBar } from './components/ToolBar';
import { useRef, useState } from 'react';

function App() {
    const [mode, setMode] = useState('transform');
    const setRefreshState = useState(false)[1];
    const actionStack = useRef([]);
    const refresh = () => {
        setRefreshState((prev) => !prev);
    };
    return (
        <Stack gap={0}>
            <MenuBar actionStack={actionStack} />
            <Group align="stretch">
                <ToolBar setMode={setMode} />
                <Editor svgString={svgString} mode={mode} refresh={refresh} actionStack={actionStack} />
            </Group>
        </Stack>
    );
}

export default App;
