# SVG Editor

A powerful React-based SVG editor that can be used both as a standalone application and as an embeddable library. Built with React, Mantine UI, and SVG.js.

## Features

- **Transform Mode**: Resize, rotate, and move SVG elements
- **Reimagine Mode**: Modify path segments with control points
- **Split Mode**: Split complex paths into individual segments
- **Grid Support**: Toggle grid for precise positioning
- **Undo Support**: Undo operations with Ctrl+Z
- **Copy/Paste**: Copy and paste elements with Ctrl+C/V
- **Panel Editing**: Edit element properties through a dedicated panel
- **Text Support**: Edit text content and styling
- **Export**: Export modified SVG

## Installation

### As a Standalone Application

1. Clone the repository:

```bash
git clone https://github.com/KIRA009/svg-editor
cd svg-editor
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### As a Library

1. Install the package:

```bash
npm install /path/to/svg-editor
```

2. Import and use in your React application:

```jsx
import SVGEditor from 'svg-editor';

function App() {
    const handleExport = (svgString) => {
        console.log('Exported SVG:', svgString);
    };

    return (
        <SVGEditor
            svgString="<svg>...</svg>"
            onExport={handleExport}
        />
    );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `svgString` | string | Initial SVG content to edit |
| `onExport` | function | Callback function when SVG is exported |

## Usage

### Keyboard Shortcuts

- **Ctrl + Z**: Undo last action
- **Ctrl + C**: Copy selected element
- **Ctrl + V**: Paste copied element

### Modes

1. **Transform Mode** (🖱️)
   - Click and drag elements
   - Use handles to resize
   - Use rotation handle for rotation

2. **Reimagine Mode** (⚙️)
   - Modify path segments using control points
   - Works on path elements only

3. **Split Mode** (✂️)
   - Split complex paths into individual segments
   - Useful for breaking down complex shapes

4. **Grid** (⊞)
   - Toggle grid visibility
   - Helps with precise positioning

### Element Panel

When an element is selected, a panel appears with the following editing options:
- Fill color
- Stroke color
- Text content (for text elements)
- Other element-specific properties

## Development

### Scripts

```bash
# Development server
npm run dev

# Build library
npm run build

# Watch mode build
npm run watch

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── Editor/
│   │   ├── MenuBar/
│   │   └── ToolBar/
│   ├── utils/
│   ├── App.jsx
│   └── index.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Dependencies

- React
- @mantine/core
- @svgdotjs/svg.js
- @svgdotjs/svg.panzoom.js
- svg-path-commander

## Acknowledgments

- SVG.js for the powerful SVG manipulation library
- Mantine for the UI components
- React team for the amazing framework
