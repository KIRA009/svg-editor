import { useRef, useState } from 'react';
import './App.css';
import { svgString } from './svgString';
import { SVG } from '@svgdotjs/svg.js';
import { useEffect } from 'react';
import { addSVGObjectToParent, calculateViewBox } from './utils/helpers';

function App() {
    const ref = useRef(null);
    const svg = useRef(null);
    const [svgDimensions, setSVGDimensions] = useState({ width: 0, height: 0 });
    const zoom = useState(1)[0];
    const setSelectedObject = useState(null)[1];
    // const lastMousePosition = useRef({ x: 0, y: 0 });
    const [mode, setMode] = useState('select');
    useEffect(() => {
        const currentRef = ref.current;
        if (currentRef) {
            svg.current = SVG().addTo(currentRef);
            const svgDocument = getSVGFromSVGString(svgString);
            for (const child of svgDocument.childNodes) {
                addSVGObjectToParent(child, svg.current);
            }
            const viewBox = calculateViewBox(svg.current.node);
            svg.current.size(viewBox[2], viewBox[3]);
            svg.current.viewbox(-100, -100, viewBox[2] / zoom + 200, viewBox[3] / zoom + 200);
            setSVGDimensions({ width: viewBox[2], height: viewBox[3] });

            const addHandlers = (obj) => {
                obj.on('click', (e) => {
                    e.stopPropagation();
                    handleClick(obj);
                });
                for (const child of obj.children()) {
                    addHandlers(child);
                }
            };
            addHandlers(svg.current);
        }
        return () => {
            if (currentRef) {
                currentRef.innerHTML = '';
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref]);
    const handleClick = (obj) => {
        setSelectedObject(obj);
    };
    return (
        <>
            <div style={{ width: svgDimensions.width, height: svgDimensions.height }} ref={ref} onClick={handleClick}></div>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
                {['select', 'move'].map((mode) => (
                    <option key={mode} value={mode}>
                        {mode}
                    </option>
                ))}
            </select>
        </>
    );
}

export default App;

const getSVGFromSVGString = (svgString) => {
    const parser = new DOMParser();
    const svgDocument = parser.parseFromString(svgString, 'image/svg+xml');
    return svgDocument.querySelector('svg');
};
