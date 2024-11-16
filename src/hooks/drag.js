import { useState } from 'react';

export const useDrag = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e) => {
        console.log(e);
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setCurrentPosition({ x: e.clientX, y: e.clientY });
        }
    };

    return {
        isDragging,
        startPosition,
        currentPosition,
        handleMouseDown,
        handleMouseUp,
        handleMouseMove,
    };
};
