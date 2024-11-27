import { notifications } from '@mantine/notifications';
import { useEffect, useRef } from 'react';

export const useCopy = ({ selectedObject, mode, addToActionStack, addListeners, selectObject, svg }) => {
    const copiedObject = useRef(null);
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
            if (!selectedObject) {
                return;
            }
            const clonedElement = selectedObject.clone();
            copiedObject.current = {
                element: clonedElement,
                source: selectedObject,
            };
            notifications.show({
                title: 'Copied',
                message: 'Object copied to clipboard',
            });
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
    useEffect(() => {
        document.addEventListener('keydown', copyElement);
        return () => {
            document.removeEventListener('keydown', copyElement);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [svg.current, mode, selectedObject]);
};
