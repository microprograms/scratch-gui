import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import {fn_url_args} from '../../lib/flyingbears-fn';

import {
    openLoadingProject,
    closeLoadingProject,
} from '../../reducers/modals';

import {
    LoadingStates,
} from '../../reducers/project-state';

import {setProjectTitle} from '../../reducers/project-title';

import VM from 'scratch-vm';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

class FlyingbearsAutoLoad extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'getProjectTitleFromFilename',
            'autoLoadLesson',
        ]);
    }

    componentDidMount () {
        this.autoLoadLesson();
    }

    getProjectTitleFromFilename (filename) {
        if (!filename) return '';
        // only parse title with valid scratch project extensions
        // (.sb, .sb2, and .sb3)
        const matches = filename.match(/^(.*)\.sb[23]?$/);
        if (!matches) return '';
        return matches[1].substring(0, 100); // truncate project title to max 100 chars
    }

    autoLoadLesson () {
        const urlArgs = fn_url_args();
        const aliyunOssPath = urlArgs['aliyunOssPath'];
        if (!aliyunOssPath) {
            return;
        }

        this.props.onLoadingStarted(this.props.loadingState);

        const aliyunOssDownloadUrlPrefix = 'http://scratch.flyingbears.cn:9702/download?objectName=';
        const downloadUrl = aliyunOssDownloadUrlPrefix + aliyunOssPath;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', downloadUrl);
        xhr.responseType = 'blob';
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                const blob = new Blob([xhr.response]);
                const projectTitle = this.getProjectTitleFromFilename(aliyunOssPath.substring(aliyunOssPath.lastIndexOf('/') + 1));
                const reader = new FileReader();
                reader.readAsArrayBuffer(blob);
                reader.onload = () => {
                    this.props.vm.loadProject(reader.result)
                        .then(() => {
                            this.props.onLoadingFinished(this.props.loadingState, true);
                            this.props.onReceivedProjectTitle(projectTitle);
                        })
                        .catch(error => {
                            console.warn(error);
                            const messages = defineMessages({
                                loadError: {
                                    id: 'gui.projectLoader.loadError',
                                    defaultMessage: 'The project file that was selected failed to load.',
                                    description: 'An error that displays when a local project file fails to load.'
                                }
                            });
                            alert(this.props.intl.formatMessage(messages.loadError)); // eslint-disable-line no-alert
                            this.props.onLoadingFinished(this.props.loadingState, false);
                        });
                };
            }
        };
        xhr.send();
    }

    render () {
        return <span style={{display:'none'}}>auto load</span>
    }
}

FlyingbearsAutoLoad.propTypes = {
    intl: intlShape.isRequired,
    vm: PropTypes.instanceOf(VM).isRequired,
    loadingState: PropTypes.oneOf(LoadingStates),
    onLoadingStarted: PropTypes.func,
    onLoadingFinished: PropTypes.func,
    onReceivedProjectTitle: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => {
    const loadingState = state.scratchGui.projectState.loadingState;
    return {
        vm: state.scratchGui.vm,
        loadingState: loadingState,
    };
};

const mapDispatchToProps = dispatch => ({
    onLoadingStarted: (loadingState) => {
        console.log('onLoadingStarted', loadingState);
        dispatch(openLoadingProject());
    },
    onLoadingFinished: (loadingState, success) => {
        console.log('onLoadingFinished', loadingState, success);
        dispatch(closeLoadingProject());
    },
    onReceivedProjectTitle: title => dispatch(setProjectTitle(title)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(FlyingbearsAutoLoad));
