import projectData from './project-data';

/* eslint-disable import/no-unresolved */
import popWav from '!arraybuffer-loader!./83a9787d4cb6f3b7632b4ddfebf74367.wav';
import bg from '!raw-loader!./9af27a7ad39ec41b7cbfda3622d08a1a.svg';
/* eslint-enable import/no-unresolved */

const defaultProject = () => {
    let _TextEncoder;
    if (typeof TextEncoder === 'undefined') {
        _TextEncoder = require('text-encoding').TextEncoder;
    } else {
        /* global TextEncoder */
        _TextEncoder = TextEncoder;
    }
    const encoder = new _TextEncoder();
    const projectJson = projectData;
    return [{
        id: 0,
        assetType: 'Project',
        dataFormat: 'JSON',
        data: JSON.stringify(projectJson)
    }, {
        id: '83a9787d4cb6f3b7632b4ddfebf74367',
        assetType: 'Sound',
        dataFormat: 'WAV',
        data: new Uint8Array(popWav)
    }, {
        id: '9af27a7ad39ec41b7cbfda3622d08a1a',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(bg)
    }];
};

export default defaultProject;
