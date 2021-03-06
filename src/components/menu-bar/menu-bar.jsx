import classNames from 'classnames';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import bowser from 'bowser';
import React from 'react';

import VM from 'scratch-vm';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import {ComingSoonTooltip} from '../coming-soon/coming-soon.jsx';
import Divider from '../divider/divider.jsx';
import FlyingbearsLanguageSelector from '../../containers/flyingbears-language-selector.jsx';
import FlyingbearsRedo from '../../containers/flyingbears-redo.jsx';
import SBFileUploader from '../../containers/sb-file-uploader.jsx';
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuItem, MenuSection} from '../menu/menu.jsx';
import ProjectTitleInput from './project-title-input.jsx';
import AuthorInfo from './author-info.jsx';
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import FlyingbearsHomeworkUploader from '../../containers/flyingbears-homework-uploader.jsx';
import FlyingbearsSubmitHomeworkButton from './flyingbears-submit-homework-button.jsx';
import FlyingbearsFreeCreationUploader from '../../containers/flyingbears-free-creation-uploader.jsx';
import FlyingbearsSubmitFreeCreationButton from './flyingbears-submit-free-creation-button.jsx';
import FlyingbearsShareQrcode from './flyingbears-share-qrcode.jsx';
import FlyingbearsAutoLoad from './flyingbears-auto-load.jsx';
import MenuBarHOC from '../../containers/menu-bar-hoc.jsx';

import {
    openTipsLibrary,
} from '../../reducers/modals';
import {setPlayer} from '../../reducers/mode';

import {
    autoUpdateProject,
    getIsUpdating,
    getIsShowingProject,
    manualUpdateProject,
    requestNewProject,
    remixProject,
    saveProjectAsCopy,
} from '../../reducers/project-state';
import {
    openAccountMenu,
    closeAccountMenu,
    accountMenuOpen,
    openFileMenu,
    closeFileMenu,
    fileMenuOpen,
    openEditMenu,
    closeEditMenu,
    editMenuOpen,
    openLanguageMenu,
    closeLanguageMenu,
    languageMenuOpen,
    openLoginMenu,
    closeLoginMenu,
    loginMenuOpen
} from '../../reducers/menus';

import collectMetadata from '../../lib/collect-metadata';

import styles from './menu-bar.css';

import helpIcon from '../../lib/assets/icon--tutorials.svg';
import remixIcon from './icon--remix.svg';

import sharedMessages from '../../lib/shared-messages';

import fileManagerSaveIcon from './file-manager-save.svg';
import fileManagerDownloadIcon from './file-manager-download.svg';
import fileManagerOpenIcon from './file-manager-open.svg';

import swal from '@sweetalert/with-react'
import {fn_url_args} from '../../lib/flyingbears-fn';
import {public_api} from '../../fn/api';

const ariaMessages = defineMessages({
    language: {
        id: 'gui.menuBar.LanguageSelector',
        defaultMessage: 'language selector',
        description: 'accessibility text for the language selection menu'
    },
    tutorials: {
        id: 'gui.menuBar.tutorialsLibrary',
        defaultMessage: 'Tutorials',
        description: 'accessibility text for the tutorials button'
    }
});

const MenuBarItemTooltip = ({
    children,
    className,
    enable,
    id,
    place = 'bottom'
}) => {
    if (enable) {
        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
    return (
        <ComingSoonTooltip
            className={classNames(styles.comingSoon, className)}
            place={place}
            tooltipClassName={styles.comingSoonTooltip}
            tooltipId={id}
        >
            {children}
        </ComingSoonTooltip>
    );
};


MenuBarItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    enable: PropTypes.bool,
    id: PropTypes.string,
    place: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

const MenuItemTooltip = ({id, isRtl, children, className}) => (
    <ComingSoonTooltip
        className={classNames(styles.comingSoon, className)}
        isRtl={isRtl}
        place={isRtl ? 'left' : 'right'}
        tooltipClassName={styles.comingSoonTooltip}
        tooltipId={id}
    >
        {children}
    </ComingSoonTooltip>
);

MenuItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    id: PropTypes.string,
    isRtl: PropTypes.bool
};

class MenuBar extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClickNew',
            'handleClickRemix',
            'handleClickSave',
            'handleClickSaveAsCopy',
            'handleClickSeeCommunity',
            'handleClickShare',
            'handleKeyPress',
            'handleLanguageMouseUp',
            'handleRestoreOption',
            'getSaveToComputerHandler',
            'restoreOptionMessage',
            'getHomeworkMode',
            'swalShareQrcode',
            'onFreeCreationUploadFinished',
            'onNewHomeworkUploadFinished',
            'onEditHomeworkUploadFinished',
        ]);
        this.state = {
            isFlyingbearsHomeworkSubmited: this.props.isFlyingbearsHomeworkSubmited
        }
    }
    componentDidMount () {
        document.addEventListener('keydown', this.handleKeyPress);
    }
    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    handleClickNew () {
        // if the project is dirty, and user owns the project, we will autosave.
        // but if they are not logged in and can't save, user should consider
        // downloading or logging in first.
        // Note that if user is logged in and editing someone else's project,
        // they'll lose their work.
        const readyToReplaceProject = this.props.confirmReadyToReplaceProject(
            this.props.intl.formatMessage(sharedMessages.replaceProjectWarning)
        );
        this.props.onRequestCloseFile();
        if (readyToReplaceProject) {
            this.props.onClickNew(this.props.canSave && this.props.canCreateNew);
        }
        this.props.onRequestCloseFile();
    }
    handleClickRemix () {
        this.props.onClickRemix();
        this.props.onRequestCloseFile();
    }
    handleClickSave () {
        this.props.onClickSave();
        this.props.onRequestCloseFile();
    }
    handleClickSaveAsCopy () {
        this.props.onClickSaveAsCopy();
        this.props.onRequestCloseFile();
    }
    handleClickSeeCommunity (waitForUpdate) {
        if (this.props.shouldSaveBeforeTransition()) {
            this.props.autoUpdateProject(); // save before transitioning to project page
            waitForUpdate(true); // queue the transition to project page
        } else {
            waitForUpdate(false); // immediately transition to project page
        }
    }
    handleClickShare (waitForUpdate) {
        if (!this.props.isShared) {
            if (this.props.canShare) { // save before transitioning to project page
                this.props.onShare();
            }
            if (this.props.canSave) { // save before transitioning to project page
                this.props.autoUpdateProject();
                waitForUpdate(true); // queue the transition to project page
            } else {
                waitForUpdate(false); // immediately transition to project page
            }
        }
    }
    handleRestoreOption (restoreFun) {
        return () => {
            restoreFun();
            this.props.onRequestCloseEdit();
        };
    }
    handleKeyPress (event) {
        const modifier = bowser.mac ? event.metaKey : event.ctrlKey;
        if (modifier && event.key === 's') {
            this.props.onClickSave();
            event.preventDefault();
        }
    }
    getSaveToComputerHandler (downloadProjectCallback) {
        return () => {
            this.props.onRequestCloseFile();
            downloadProjectCallback();
            if (this.props.onProjectTelemetryEvent) {
                const metadata = collectMetadata(this.props.vm, this.props.projectTitle, this.props.locale);
                this.props.onProjectTelemetryEvent('projectDidSave', metadata);
            }
        };
    }
    getHomeworkMode() {
        const urlArgs = fn_url_args();
        return urlArgs['mode'];   // free-creation, new-homework, edit-homework
    }
    swalShareQrcode(aliyunOssPath) {
        const urlArgs = fn_url_args()
        const studentId = urlArgs['studentId']
        const lessonStageId = urlArgs['lessonStageId']
        const lessonId = urlArgs['lessonId']
        const lessonSectionId = urlArgs['lessonSectionId']

        public_api({
            "apiName": "Debug_QueryHomeworkShareConfig_Api",
            "studentId": studentId,
            "lessonStageId": lessonStageId,
            "lessonId": lessonId,
            "lessonSectionId": lessonSectionId,
        }).then(resp => {
			return public_api({
				"apiName": "module_micro_api_qrcode.api.CreateQrcodeAsDataUrl",
				"text": `http://scratch.flyingbears.cn/html/share.html?homeworkId=${resp.homeworkId}&title=${resp.title}`,
				"width": "600",
				"height": "600",
				"margin": "2",
				"format": "png",
				"mimeType": "image/png",
			})
		}).then(resp => {
            swal(<FlyingbearsShareQrcode qrcodeDataUrl={resp.dataUrl} />)
		})
    }
    onFreeCreationUploadFinished(freeCreationAliyunOssPath) {
        console.log('onFreeCreationUploadFinished', freeCreationAliyunOssPath);
        swal(<div>
            <p>提交成功</p>
        </div>);
    }
    onNewHomeworkUploadFinished(newHomeworkAliyunOssPath) {
        console.log('onNewHomeworkUploadFinished', newHomeworkAliyunOssPath);
        const self = this
        this.setState({
            'isFlyingbearsHomeworkSubmited': true
        })
        const urlArgs = fn_url_args();
        const studentId = urlArgs['studentId'];
        const lessonStageId = urlArgs['lessonStageId'];
        const lessonId = urlArgs['lessonId'];
        const lessonSectionId = urlArgs['lessonSectionId'];
        
        public_api({
            "apiName": "module_micro_api_scratch_flyingbears_cn_site.api.Homework_Submit_Api",
            "lessonStageId": lessonStageId,
            "lessonId": lessonId,
            "lessonSectionId": lessonSectionId,
            "studentId": studentId,
            "name": "作业名称",
            "desc": "作业的相关描述文字",
            "aliyunOssPath": newHomeworkAliyunOssPath,
        }).then(resp => {
            self.swalShareQrcode(newHomeworkAliyunOssPath)
        })
    }
    onEditHomeworkUploadFinished(editHomeworkAliyunOssPath) {
        console.log('onEditHomeworkUploadFinished', editHomeworkAliyunOssPath);
        this.setState({
            'isFlyingbearsHomeworkSubmited': true
        });
        this.swalShareQrcode(editHomeworkAliyunOssPath);
        
        const urlArgs = fn_url_args();
        const id = urlArgs['id'];
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://scratch.flyingbears.cn:9701/api');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                const response = JSON.parse(xhr.responseText);
                console.log('flyingbearsSubmitHomework ' + response.code);
            }
        };
        xhr.send(JSON.stringify({
            "apiName": "module_micro_api_scratch_flyingbears_cn_site.api.Homework_Update_Api",
            "id": id,
            "name": "作业名称",
            "desc": "作业的相关描述文字",
            "aliyunOssPath": editHomeworkAliyunOssPath,
        }));
    }
    handleLanguageMouseUp (e) {
        if (!this.props.languageMenuOpen) {
            this.props.onClickLanguage(e);
        }
    }
    restoreOptionMessage (deletedItem) {
        switch (deletedItem) {
        case 'Sprite':
            return (<FormattedMessage
                defaultMessage="Restore Sprite"
                description="Menu bar item for restoring the last deleted sprite."
                id="gui.menuBar.restoreSprite"
            />);
        case 'Sound':
            return (<FormattedMessage
                defaultMessage="Restore Sound"
                description="Menu bar item for restoring the last deleted sound."
                id="gui.menuBar.restoreSound"
            />);
        case 'Costume':
            return (<FormattedMessage
                defaultMessage="Restore Costume"
                description="Menu bar item for restoring the last deleted costume."
                id="gui.menuBar.restoreCostume"
            />);
        default: {
            return (<FormattedMessage
                defaultMessage="Restore"
                description="Menu bar item for restoring the last deleted item in its disabled state." /* eslint-disable-line max-len */
                id="gui.menuBar.restore"
            />);
        }
        }
    }
    render () {
        const saveNowMessage = (
            <FormattedMessage
                defaultMessage="Save now"
                description="Menu bar item for saving now"
                id="gui.menuBar.saveNow"
            />
        );
        const createCopyMessage = (
            <FormattedMessage
                defaultMessage="Save as a copy"
                description="Menu bar item for saving as a copy"
                id="gui.menuBar.saveAsCopy"
            />
        );
        const remixMessage = (
            <FormattedMessage
                defaultMessage="Remix"
                description="Menu bar item for remixing"
                id="gui.menuBar.remix"
            />
        );
        const newProjectMessage = (
            <FormattedMessage
                defaultMessage="New"
                description="Menu bar item for creating a new project"
                id="gui.menuBar.new"
            />
        );
        const remixButton = (
            <Button
                className={classNames(
                    styles.menuBarButton,
                    styles.remixButton
                )}
                iconClassName={styles.remixButtonIcon}
                iconSrc={remixIcon}
                onClick={this.handleClickRemix}
            >
                {remixMessage}
            </Button>
        );
        return (
            <Box
                className={classNames(
                    this.props.className,
                    styles.menuBar
                )}
            >
                <div className={styles.mainMenu}>
                    <div className={styles.fileGroup}>
                        <div className={classNames(styles.menuBarItem)}>
                            <img
                                alt="Scratch"
                                className={classNames(styles.scratchLogo, {
                                    [styles.clickable]: typeof this.props.onClickLogo !== 'undefined'
                                })}
                                draggable={false}
                                src={this.props.logo}
                                onClick={this.props.onClickLogo}
                            />
                        </div>
                        {(this.props.canChangeLanguage) && (
                            <FlyingbearsLanguageSelector label={this.props.intl.formatMessage(ariaMessages.language)} />
                        )}
                        <FlyingbearsAutoLoad />
                        <FlyingbearsRedo currentHomeworkId='placeholder' />
                        {(this.props.canManageFiles) && (
                            <div
                                className={classNames(styles.menuBarItem, styles.hoverable, {
                                    [styles.active]: this.props.fileMenuOpen
                                })}
                                onMouseUp={this.props.onClickFile}
                            >
                                <img className={styles.icon} src={fileManagerSaveIcon} />
                                <span className={styles.desc}>
                                    <FormattedMessage
                                        defaultMessage="File"
                                        description="Text for file dropdown menu"
                                        id="gui.menuBar.file"
                                    />
                                    <span>&nbsp;&nbsp;&nbsp;▾</span>
                                </span>
                                <MenuBarMenu
                                    className={classNames(styles.menuBarMenu)}
                                    open={this.props.fileMenuOpen}
                                    place={this.props.isRtl ? 'left' : 'right'}
                                    onRequestClose={this.props.onRequestCloseFile}
                                >
                                    <MenuSection>
                                        <SB3Downloader>{(className, downloadProjectCallback) => (
                                            <MenuItem
                                                className={className}
                                                onClick={this.getSaveToComputerHandler(downloadProjectCallback)}
                                            >
                                                <img className={styles.icon} src={fileManagerDownloadIcon} />
                                                <span className={styles.desc}>
                                                    <FormattedMessage
                                                        defaultMessage="Save to your computer"
                                                        description="Menu bar item for downloading a project to your computer" // eslint-disable-line max-len
                                                        id="gui.menuBar.downloadToComputer"
                                                    />
                                                </span>
                                            </MenuItem>
                                        )}</SB3Downloader>
                                        <SBFileUploader
                                            canSave={this.props.canSave}
                                            userOwnsProject={this.props.userOwnsProject}
                                        >
                                            {(className, renderFileInput, handleLoadProject) => (
                                                <MenuItem
                                                    className={className}
                                                    onClick={handleLoadProject}
                                                >
                                                    <img className={styles.icon} src={fileManagerOpenIcon} />
                                                    <span className={styles.desc}>
                                                        <FormattedMessage
                                                            defaultMessage="Load from your computer"
                                                            description="Title for uploading a project from your computer" // eslint-disable-line max-len
                                                            id="gui.sharedMessages.loadFromComputerTitle"
                                                        />
                                                    </span>
                                                    {renderFileInput()}
                                                </MenuItem>
                                            )}
                                        </SBFileUploader>
                                    </MenuSection>
                                </MenuBarMenu>
                            </div>
                        )}
                    </div>
                    <Divider className={classNames(styles.divider)} />
                    <div
                        aria-label={this.props.intl.formatMessage(ariaMessages.tutorials)}
                        className={classNames(styles.menuBarItem, styles.hoverable)}
                        onClick={this.props.onOpenTipLibrary}
                    >
                        <img
                            className={styles.helpIcon}
                            src={helpIcon}
                        />
                        <FormattedMessage {...ariaMessages.tutorials} />
                    </div>
                    <Divider className={classNames(styles.divider)} />
                    {this.props.canEditTitle ? (
                        <div className={classNames(styles.menuBarItem, styles.growable)}>
                            <MenuBarItemTooltip
                                enable
                                id="title-field"
                            >
                                <ProjectTitleInput
                                    className={classNames(styles.titleFieldGrowable)}
                                />
                            </MenuBarItemTooltip>
                        </div>
                    ) : ((this.props.authorUsername && this.props.authorUsername !== this.props.username) ? (
                        <AuthorInfo
                            className={styles.authorInfo}
                            imageUrl={this.props.authorThumbnailUrl}
                            projectTitle={this.props.projectTitle}
                            userId={this.props.authorId}
                            username={this.props.authorUsername}
                        />
                    ) : null)}
                    {this.getHomeworkMode() == 'free-creation' &&
                        <FlyingbearsFreeCreationUploader
                            onUploadFinished={this.onFreeCreationUploadFinished.bind(this)}
                        >
                            {(className, upload) => (
                                <FlyingbearsSubmitFreeCreationButton
                                    className={styles.menuBarButton}
                                    onClick={e => upload()}
                                />
                            )}
                        </FlyingbearsFreeCreationUploader>
                    }
                    {this.getHomeworkMode() == 'new-homework' &&
                        <FlyingbearsHomeworkUploader
                            onUploadFinished={this.onNewHomeworkUploadFinished.bind(this)}
                        >
                            {(className, upload) => (
                                <FlyingbearsSubmitHomeworkButton
                                    className={styles.menuBarButton}
                                    isSubmited={this.state.isFlyingbearsHomeworkSubmited}
                                    onClick={e => upload()}
                                />
                            )}
                        </FlyingbearsHomeworkUploader>
                    }
                    {this.getHomeworkMode() == 'edit-homework' &&
                        <FlyingbearsHomeworkUploader
                        onUploadFinished={this.onEditHomeworkUploadFinished.bind(this)}
                        >
                        {(className, upload) => (
                            <FlyingbearsSubmitHomeworkButton
                                className={styles.menuBarButton}
                                isSubmited={this.state.isFlyingbearsHomeworkSubmited}
                                onClick={e => upload()}
                            />
                        )}
                        </FlyingbearsHomeworkUploader>
                    }
                </div>
            </Box>
        );
    }
}

MenuBar.propTypes = {
    accountMenuOpen: PropTypes.bool,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    authorThumbnailUrl: PropTypes.string,
    authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    autoUpdateProject: PropTypes.func,
    canChangeLanguage: PropTypes.bool,
    canCreateCopy: PropTypes.bool,
    canCreateNew: PropTypes.bool,
    canEditTitle: PropTypes.bool,
    canManageFiles: PropTypes.bool,
    canRemix: PropTypes.bool,
    canSave: PropTypes.bool,
    canShare: PropTypes.bool,
    className: PropTypes.string,
    confirmReadyToReplaceProject: PropTypes.func,
    editMenuOpen: PropTypes.bool,
    enableCommunity: PropTypes.bool,
    fileMenuOpen: PropTypes.bool,
    intl: intlShape,
    isRtl: PropTypes.bool,
    isShared: PropTypes.bool,
    isFlyingbearsHomeworkSubmited: PropTypes.bool,
    isShowingProject: PropTypes.bool,
    isUpdating: PropTypes.bool,
    languageMenuOpen: PropTypes.bool,
    locale: PropTypes.string.isRequired,
    loginMenuOpen: PropTypes.bool,
    logo: PropTypes.string,
    onClickAccount: PropTypes.func,
    onClickEdit: PropTypes.func,
    onClickFile: PropTypes.func,
    onClickLanguage: PropTypes.func,
    onClickLogin: PropTypes.func,
    onClickLogo: PropTypes.func,
    onClickNew: PropTypes.func,
    onClickRemix: PropTypes.func,
    onClickSave: PropTypes.func,
    onClickSaveAsCopy: PropTypes.func,
    onLogOut: PropTypes.func,
    onOpenRegistration: PropTypes.func,
    onOpenTipLibrary: PropTypes.func,
    onProjectTelemetryEvent: PropTypes.func,
    onRequestCloseAccount: PropTypes.func,
    onRequestCloseEdit: PropTypes.func,
    onRequestCloseFile: PropTypes.func,
    onRequestCloseLanguage: PropTypes.func,
    onRequestCloseLogin: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onShare: PropTypes.func,
    onToggleLoginOpen: PropTypes.func,
    projectTitle: PropTypes.string,
    renderLogin: PropTypes.func,
    sessionExists: PropTypes.bool,
    shouldSaveBeforeTransition: PropTypes.func,
    showComingSoon: PropTypes.bool,
    userOwnsProject: PropTypes.bool,
    username: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired,
};

MenuBar.defaultProps = {
    logo: 'static/logo-white.png',
    onShare: () => {}
};

const mapStateToProps = (state, ownProps) => {
    const loadingState = state.scratchGui.projectState.loadingState;
    const user = state.session && state.session.session && state.session.session.user;
    return {
        accountMenuOpen: accountMenuOpen(state),
        fileMenuOpen: fileMenuOpen(state),
        editMenuOpen: editMenuOpen(state),
        isRtl: state.locales.isRtl,
        isUpdating: getIsUpdating(loadingState),
        isShowingProject: getIsShowingProject(loadingState),
        languageMenuOpen: languageMenuOpen(state),
        locale: state.locales.locale,
        loginMenuOpen: loginMenuOpen(state),
        projectTitle: state.scratchGui.projectTitle,
        sessionExists: state.session && typeof state.session.session !== 'undefined',
        username: user ? user.username : null,
        userOwnsProject: ownProps.authorUsername && user &&
            (ownProps.authorUsername === user.username),
        vm: state.scratchGui.vm
    };
};

const mapDispatchToProps = dispatch => ({
    autoUpdateProject: () => dispatch(autoUpdateProject()),
    onOpenTipLibrary: () => dispatch(openTipsLibrary()),
    onClickAccount: () => dispatch(openAccountMenu()),
    onRequestCloseAccount: () => dispatch(closeAccountMenu()),
    onClickFile: () => dispatch(openFileMenu()),
    onRequestCloseFile: () => dispatch(closeFileMenu()),
    onClickEdit: () => dispatch(openEditMenu()),
    onRequestCloseEdit: () => dispatch(closeEditMenu()),
    onClickLanguage: () => dispatch(openLanguageMenu()),
    onRequestCloseLanguage: () => dispatch(closeLanguageMenu()),
    onClickLogin: () => dispatch(openLoginMenu()),
    onRequestCloseLogin: () => dispatch(closeLoginMenu()),
    onClickNew: needSave => dispatch(requestNewProject(needSave)),
    onClickRemix: () => dispatch(remixProject()),
    onClickSave: () => dispatch(manualUpdateProject()),
    onClickSaveAsCopy: () => dispatch(saveProjectAsCopy()),
    onSeeCommunity: () => dispatch(setPlayer(true)),
});

export default compose(
    injectIntl,
    MenuBarHOC,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(MenuBar);
