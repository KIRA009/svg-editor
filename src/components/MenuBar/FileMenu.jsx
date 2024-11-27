import { FileButton } from '@mantine/core';
import { IconFileUpload } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import { Button } from './Button';

export const FileMenu = ({ setSvgString }) => {
    const onChange = (file) => {
        // set the svg string to the file content
        file.arrayBuffer().then((buffer) => {
            const svgString = new TextDecoder('utf-8').decode(buffer);
            // parse the svg string into an svg element
            const parser = new DOMParser();
            const svgElement = parser.parseFromString(svgString, 'image/svg+xml').documentElement;
            setSvgString(svgElement.outerHTML);
        });
    };
    return (
        <FileButton onChange={onChange} accept="image/svg+xml">
            {(props) => (
                <Button leftSection={<IconFileUpload />} {...props}>
                    Open
                </Button>
            )}
        </FileButton>
    );
};

FileMenu.propTypes = {
    setSvgString: PropTypes.func.isRequired,
};
