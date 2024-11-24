import { useEffect } from 'react';

export const useCopy = ({ selectedObject, mode, copiedObject, addToActionStack, addListeners, selectObject, svg }) => {
    useEffect(() => {
        const copyElement = (e) => {
            e.stopPropagation();
            if (mode !== 'transform') {
                return;
            }
            // if not ctrl + c, or not ctrl + v, return
            if (!(e.ctrlKey && (e.key === 'c' || e.key === 'v'))) {
                return;
            }
            const isCopying = e.key === 'c';
            if (isCopying) {
                if (!selectedObject.current) {
                    return;
                }
                const clonedElement = selectedObject.current.clone();
                copiedObject.current = {
                    element: clonedElement,
                    source: selectedObject.current,
                };
            } else {
                if (!copiedObject.current) {
                    return;
                }
                const { element, source } = copiedObject.current;
                // if source is deleted, add it to the root, otherwise add after source
                if (source.parent() === null) {
                    svg.current.add(element);
                } else {
                    source.after(element);
                }
                addListeners(element);
                selectObject(element);
                copiedObject.current = {
                    element: element.clone(),
                };
                addToActionStack({
                    type: 'copy',
                    details: {
                        obj: element,
                    },
                });
            }
        };
        document.addEventListener('keydown', copyElement);
        return () => {
            document.removeEventListener('keydown', copyElement);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [svg.current]);
};
