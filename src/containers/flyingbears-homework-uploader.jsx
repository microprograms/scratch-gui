import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {projectTitleInitialState} from '../reducers/project-title';
import uploadBlobToAliyunOss from '../lib/flyingbears-aliyun-oss-uploader.js';
import swal from 'sweetalert';

class FlyingbearsHomeworkUploader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'uploadHomework'
        ]);
    }
    uploadHomework () {
        this.props.saveProjectSb3().then(content => {
            const label = '输入你的姓名：';
            swal(label, {
                content: 'input',
            }).then((name) => {
                if (name && name.replace(/ /g, '').length > 0) {
                    const projectFilename = this.props.projectFilename;
                    const filename = getFileNameWithoutSuffix(projectFilename) + '-' + name.replace(/ /g, '') + getFileSuffix(projectFilename);
                    uploadBlobToAliyunOss(filename, content, this.props.onUploadFinished);
                }
            });
        });
    }
    render () {
        const {
            children
        } = this.props;
        return children(
            this.props.className,
            this.uploadHomework
        );
    }
}

const getProjectFilename = (curTitle, defaultTitle) => {
    let filenameTitle = curTitle;
    if (!filenameTitle || filenameTitle.length === 0) {
        filenameTitle = defaultTitle;
    }
    return `${filenameTitle.substring(0, 100)}.sb3`;
};

const getFileSuffix = (filename) => {
    const index = filename.lastIndexOf('.');
    if (index == -1) {
        return '';
    }
    return filename.substring(index);
};

const getFileNameWithoutSuffix = (filename) => {
    const index = filename.lastIndexOf('.');
    if (index == -1) {
        return filename;
    }
    return filename.substring(0, index);
};

FlyingbearsHomeworkUploader.propTypes = {
    children: PropTypes.func,
    className: PropTypes.string,
    onUploadFinished: PropTypes.func,
    projectFilename: PropTypes.string,
    saveProjectSb3: PropTypes.func
};
FlyingbearsHomeworkUploader.defaultProps = {
    className: ''
};

const mapStateToProps = state => ({
    saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(state.scratchGui.vm),
    projectFilename: getProjectFilename(state.scratchGui.projectTitle, projectTitleInitialState)
});

export default connect(
    mapStateToProps,
    () => ({}) // omit dispatch prop
)(FlyingbearsHomeworkUploader);
