import { createRoot } from 'react-dom/client';
import './App.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import App from './App.jsx';
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme();

createRoot(document.getElementById('root')).render(
    <MantineProvider theme={theme}>
        <Notifications />
        <App />
    </MantineProvider>
);
