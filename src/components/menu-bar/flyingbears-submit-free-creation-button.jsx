import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Button from '../button/button.jsx';

import styles from './flyingbears-submit-free-creation-button.css';

const FlyingbearsSubmitFreeCreationButton = ({
    className,
    onClick
}) => (
    <>
        <span style={{paddingLeft: '1em', paddingRight: '1em'}}>自由创作</span>
        <Button
            className={classNames(
                className,
                styles.submitFreeCreationButton,
                styles.hoverable,
            )}
            onClick={onClick}
        >
            <FormattedMessage
                defaultMessage="保存"
                id="gui.menuBar.submitFreeCreation"
            />
        </Button>
    </>
);

FlyingbearsSubmitFreeCreationButton.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func
};

FlyingbearsSubmitFreeCreationButton.defaultProps = {
    onClick: () => {}
};

export default FlyingbearsSubmitFreeCreationButton;
