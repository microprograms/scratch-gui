import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {projectTitleInitialState} from '../reducers/project-title';
import uploadBlobToAliyunOss from '../lib/flyingbears-aliyun-oss-uploader.js';
import swal from 'sweetalert';
import {fn_url_args} from '../lib/flyingbears-fn';

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
                    const filename = getFilename();
                    // eslint-disable-next-line max-len
                    const finalFilename = getFileNameWithoutSuffix(filename) + '-' + name.replace(/ /g, '') + getFileSuffix(filename);
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

const getFilename = () => {
    const urlArgs = fn_url_args();
    const lessonId = urlArgs['lessonId'];
    if (lessonId) {
        return lessonId.substring(lessonId.lastIndexOf('/') + 1);
    }
    return this.props.projectFilename;
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
