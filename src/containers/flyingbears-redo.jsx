import PropTypes from 'prop-types';
import React from 'react';

import styles from '../components/menu-bar/menu-bar.css';
import redoIcon from '../components/menu-bar/redo.svg';
import classNames from 'classnames';

class FlyingbearsRedo extends React.Component {
    constructor (props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange () {
        location.reload();
    }
    render () {
        return (
            <div onClick={this.handleChange} className={classNames(styles.menuBarItem, styles.hoverable)} >
                <img className={styles.icon} src={redoIcon} />
                <span className={styles.desc}>重做</span>
            </div>
        );
    }
}

FlyingbearsRedo.propTypes = {
    currentHomeworkId: PropTypes.string.isRequired
};

export default FlyingbearsRedo;
