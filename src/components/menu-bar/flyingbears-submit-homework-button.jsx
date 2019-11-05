import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Button from '../button/button.jsx';

import styles from './flyingbears-submit-homework-button.css';

const FlyingbearsSubmitHomeworkButton = ({
    className,
    isSubmited,
    onClick
}) => (
    <Button
        className={classNames(
            className,
            styles.submitHomeworkButton,
            styles.hoverable,
            {[styles.submitHomeworkButtonIsSubmited]: isSubmited}
        )}
        onClick={onClick}
    >
        {isSubmited ? (
            <FormattedMessage
                defaultMessage="Homework Submited"
                id="gui.menuBar.isHomeworkSubmited"
            />
        ) : (
            <FormattedMessage
                defaultMessage="Submit Homework"
                id="gui.menuBar.submitHomework"
            />
        )}
    </Button>
);

FlyingbearsSubmitHomeworkButton.propTypes = {
    className: PropTypes.string,
    isSubmited: PropTypes.bool,
    onClick: PropTypes.func
};

FlyingbearsSubmitHomeworkButton.defaultProps = {
    onClick: () => {}
};

export default FlyingbearsSubmitHomeworkButton;
