import { useRef, useState } from 'react';
import './App.css'
import { svgString } from './svgString';
import { SVG } from '@svgdotjs/svg.js';
import { useEffect } from 'react';
import { calculateViewBox, getSVGObject } from './utils/helpers';

const addSVGObjectToParent = (node, parent) => {
  let tagName = node.tagName?.toLowerCase();
  if (!tagName) {
    // check if node is string
    try {
      const textContent = node.textContent;
      if (textContent) {
        parent.text(textContent);
      }
    } catch (e) {
      console.log('Error getting text content', e);
    }
    return;
  }
  const svgObject = getSVGObject(node, parent);
  if (!svgObject) return;
  svgObject.addTo(parent);
  for (const attr of node.attributes) {
    svgObject.attr(attr.name, attr.value);
  }
  for (const child of node.childNodes) {
    addSVGObjectToParent(child, svgObject);
  }
}

function App() {
  const ref = useRef(null);
  const svg = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });
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
      svg.current.viewbox(viewBox[0] - 10, viewBox[1] - 10, viewBox[2] + 10, viewBox[3] + 10);
      svg.current.size(viewBox[2], viewBox[3]);
      
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
  return <div style={{ width: 500, height: 500 }} ref={ref} onClick={handleClick} ></div>;
}

export default App


const getSVGFromSVGString = (svgString) => {
  const parser = new DOMParser();
  const svgDocument = parser.parseFromString(svgString, 'image/svg+xml');
  return svgDocument.querySelector('svg');
};
