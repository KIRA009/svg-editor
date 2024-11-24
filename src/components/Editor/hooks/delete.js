import { useEffect } from 'react';

export const useDelete = ({ selectedObject, addToActionStack, selectObject, mode }) => {
    useEffect(() => {
        if (mode !== 'transform') {
            return;
        }
        const deleteElement = (e) => {
            e.stopPropagation();
            if (e.key !== 'Delete') {
                return;
            }
            if (!selectedObject.current) {
                return;
            }
            const _selectedObject = selectedObject.current;
            const parentIndex = _selectedObject.parent().index(_selectedObject);
            addToActionStack({
                type: 'delete',
                details: {
                    obj: _selectedObject.clone(),
                    parentIndex,
                    parent: _selectedObject.parent(),
                },
            });
            selectObject(null);
            _selectedObject.remove();
        };
        document.addEventListener('keydown', deleteElement);
        return () => {
            document.removeEventListener('keydown', deleteElement);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
