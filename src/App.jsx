import { AppShell, Group, ScrollArea } from '@mantine/core';
import { Editor } from './components/Editor';
import { MenuBar } from './components/MenuBar';
import { ToolBar } from './components/ToolBar';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Panel } from './components/Editor/Panel';

function App() {
    const [mode, setMode] = useState('transform');
    const [svgString, setSvgString] = useState(null);
    const [actionStack, setActionStack] = useState([]);
    const opened = useDisclosure()[0];
    const [selectedObjectForEditPanel, setSelectedObjectForEditPanel] = useState(null);
    const addToActionStack = (action) => {
        setActionStack((prev) => [...prev, action]);
    };
    const removeSelectedObjectPanel = () => {
        setSelectedObjectForEditPanel(null);
    };
    return (
        <AppShell
            header={{ height: 50 }}
            navbar={{
                width: 50,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            <AppShell.Header bg="gray.1">
                <Group h="100%">
                    <MenuBar actionStack={actionStack} setSvgString={setSvgString} />
                </Group>
            </AppShell.Header>
            <AppShell.Navbar>
                <ToolBar mode={mode} setMode={setMode} />
            </AppShell.Navbar>
            <AppShell.Main>
                <Editor
                    svgString={svgString}
                    mode={mode}
                    actionStack={actionStack}
                    setActionStack={setActionStack}
                    setSelectedObjectForEditPanel={setSelectedObjectForEditPanel}
                    addToActionStack={addToActionStack}
                />
            </AppShell.Main>
            <AppShell.Aside bg="gray.1">
                <AppShell.Section grow component={ScrollArea}>
                    {selectedObjectForEditPanel && (
                        <Panel
                            key={selectedObjectForEditPanel.id()}
                            selectedObject={selectedObjectForEditPanel}
                            addToActionStack={addToActionStack}
                            closePanel={removeSelectedObjectPanel}
                        />
                    )}
                </AppShell.Section>
            </AppShell.Aside>
        </AppShell>
    );
}

export default App;
