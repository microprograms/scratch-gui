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
            const finalFilename = getAliyunOssFinalFilename();
            uploadBlobToAliyunOss(finalFilename, content, this.props.onUploadFinished(finalFilename));
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

const getAliyunOssFinalFilename = () => {
    const urlArgs = fn_url_args();
    const studentId = urlArgs['studentId'];
    const lessonStageId = urlArgs['lessonStageId'];
    const lessonId = urlArgs['lessonId'];
    const aliyunOssPath = urlArgs['aliyunOssPath'];
    if (aliyunOssPath) {
        // 学员作业
        return 'homework/' + studentId + '/' + lessonStageId + '/' + lessonId + '.sb3';
    } else {
        // 自由创作
        return 'free-creation/' + studentId  + '.sb3';
    }
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
