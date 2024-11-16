import { useRef, useState } from 'react';
import './App.css'
import { svgString } from './svgString';
import { SVG } from '@svgdotjs/svg.js';
import { useEffect } from 'react';
import { addSVGObjectToParent, calculateViewBox } from './utils/helpers';

function App() {
  const ref = useRef(null);
  const svg = useRef(null);
  const [svgDimensions, setSVGDimensions] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedObject, setSelectedObject] = useState(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const [mode, setMode] = useState('select');
  useEffect(() => {
    const currentRef = ref.current;
    if (currentRef) {
      svg.current = SVG().addTo(currentRef);
      svg.current.node.setAttribute('preserveAspectRatio', 'none');
      const svgDocument = getSVGFromSVGString(svgString);
      for (const child of svgDocument.childNodes) {
        addSVGObjectToParent(child, svg.current);
      }
      const viewBox = calculateViewBox(svg.current.node);
      setSVGDimensions({ width: viewBox[2], height: viewBox[3] });
      
      const addHandlers = (obj) => {
        obj.on('click', (e) => {
          e.stopPropagation();
          handleClick(obj);
        });
        for (const child of obj.children()) {
          addHandlers(child);
        }
      }
      addHandlers(svg.current);
    }
    return () => {
      if (currentRef) {
        currentRef.innerHTML = '';
      }
    };
  }, [ref]);
  const handleClick = (obj) => {
    setSelectedObject(obj);
  }
  useEffect(() => {
    document.addEventListener('keydown', onPressEnter);
    return () => {
      document.removeEventListener('keydown', onPressEnter);
    }
  }, [])
  const onPressEnter = (e) => {
    e.stopPropagation();
    // check if enter key is pressed
    if (e.key === 'Enter') {
      if (selectedObject) {
        console.log(selectedObject.x(), selectedObject.y());
        selectedObject.move(lastMousePosition.current.x, lastMousePosition.current.y);
      }
    }
  }
  return (
    <>
    <div style={{ width: 800, height: 500 }} ref={ref} onClick={handleClick} ></div>
    <select value={mode} onChange={(e) => setMode(e.target.value)}>
      {['select', 'move'].map((mode) => (
        <option key={mode} value={mode}>{mode}</option>
      ))}
    </select>
    </>
  );
}

export default App


const getSVGFromSVGString = (svgString) => {
  const parser = new DOMParser();
  const svgDocument = parser.parseFromString(svgString, 'image/svg+xml');
  return svgDocument.querySelector('svg');
};
