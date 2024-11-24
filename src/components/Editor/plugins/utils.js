export const getCoordsFromEvent = (ev) => {
    if (ev.changedTouches) {
        ev = ev.changedTouches[0];
    }
    return { x: ev.clientX, y: ev.clientY };
};
