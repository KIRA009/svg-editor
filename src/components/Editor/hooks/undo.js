import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { updatePathFromSegments } from '../../../utils/helpers';

export const useUndo = ({ selectedObject, actionStack, addListeners, svg, selectObject, refresh }) => {
    useEffect(() => {
        // on press ctrl + z, undo the last action
        function undo(e) {
            // if not ctrl + z, return
            if (!(e.ctrlKey && e.key === 'z')) {
                return;
            }
            if (actionStack.current.length === 0) {
                return;
            }
            const lastAction = actionStack.current.pop();
            if (lastAction.type === 'copy') {
                if (selectedObject.current === lastAction.details.obj) {
                    selectObject(null);
                }
                lastAction.details.obj.remove();
                notifications.show({
                    title: 'Undo',
                    message: 'Copied object removed',
                });
            } else if (lastAction.type === 'delete') {
                const { obj, parentIndex, parent } = lastAction.details;
                if (parentIndex === 0) {
                    const firstChild = parent.get(0);
                    if (firstChild) {
                        firstChild.before(obj);
                    } else {
                        parent.add(obj);
                    }
                } else {
                    const previousSibling = parent.get(parentIndex - 1);
                    previousSibling.after(obj);
                }
                addListeners(obj);
                notifications.show({
                    title: 'Undo',
                    message: 'Deleted object restored',
                });
            } else if (lastAction.type === 'resize') {
                const { obj, box, transform } = lastAction.details;
                obj.size(box.width, box.height).move(box.x, box.y).transform(transform);
                notifications.show({
                    title: 'Undo',
                    message: 'Resized object restored',
                });
            } else if (lastAction.type === 'drag') {
                const { obj, box } = lastAction.details;
                obj.move(box.x, box.y);
                notifications.show({
                    title: 'Undo',
                    message: 'Dragged object restored',
                });
            } else if (lastAction.type === 'text') {
                const { obj, text } = lastAction.details;
                obj.text(text);
            } else if (lastAction.type === 'fill') {
                const { obj, fill } = lastAction.details;
                obj.fill(fill);
                notifications.show({
                    title: 'Undo',
                    message: 'Object fill restored',
                });
            } else if (lastAction.type === 'stroke') {
                const { obj, stroke } = lastAction.details;
                obj.stroke(stroke);
                notifications.show({
                    title: 'Undo',
                    message: 'Object stroke restored',
                });
            } else if (lastAction.type === 'reimagine') {
                const { obj, segments } = lastAction.details;
                updatePathFromSegments(obj, segments);
                notifications.show({
                    title: 'Undo',
                    message: 'Reimagined object restored',
                });
            } else if (lastAction.type === 'split') {
                const { oldObject, newObject } = lastAction.details;
                newObject.replace(oldObject);
                notifications.show({
                    title: 'Undo',
                    message: 'Split object restored',
                });
            } else {
                throw new Error('Unknown action type', lastAction.type);
            }
            if (lastAction.after) {
                lastAction.after();
            }
            refresh();
            console.log(actionStack.current.length);
        }
        document.addEventListener('keydown', undo);
        return () => {
            document.removeEventListener('keydown', undo);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [svg.current]);
};
