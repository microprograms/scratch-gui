import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {projectTitleInitialState} from '../reducers/project-title';
import {fn_url_args} from '../lib/flyingbears-fn';
import uploadBlobToAliyunOss from '../lib/flyingbears-aliyun-oss-uploader.js';

class FlyingbearsFreeCreationUploader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'upload'
        ]);
    }
    upload () {
        this.props.saveProjectSb3().then(content => {
            const finalFilename = getAliyunOssFinalFilename();
            uploadBlobToAliyunOss(finalFilename, content, this.props.onUploadFinished);
        });
    }
    render () {
        const {
            children
        } = this.props;
        return children(
            this.props.className,
            this.upload
        );
    }
}

const getAliyunOssFinalFilename = () => {
    const urlArgs = fn_url_args();
    const studentId = urlArgs['studentId'];
    return 'free-creation/' + studentId  + '.sb3';
};

const getProjectFilename = (curTitle, defaultTitle) => {
    let filenameTitle = curTitle;
    if (!filenameTitle || filenameTitle.length === 0) {
        filenameTitle = defaultTitle;
    }
    return `${filenameTitle.substring(0, 100)}.sb3`;
};

FlyingbearsFreeCreationUploader.propTypes = {
    children: PropTypes.func,
    className: PropTypes.string,
    onUploadFinished: PropTypes.func,
    projectFilename: PropTypes.string,
    saveProjectSb3: PropTypes.func
};

FlyingbearsFreeCreationUploader.defaultProps = {
    className: ''
};

const mapStateToProps = state => ({
    saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(state.scratchGui.vm),
    projectFilename: getProjectFilename(state.scratchGui.projectTitle, projectTitleInitialState)
});

export default connect(
    mapStateToProps,
    () => ({}) // omit dispatch prop
)(FlyingbearsFreeCreationUploader);
