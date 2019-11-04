import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {selectLocale} from '../reducers/locales';

import styles from '../components/menu-bar/menu-bar.css';
import languageIconEn from '../components/language-selector/en.svg';
import languageIconZhCn from '../components/language-selector/zh-cn.svg';
import classNames from 'classnames';

class FlyingbearsLanguageSelector extends React.Component {
    constructor (props) {
        super(props);
        document.documentElement.lang = props.currentLocale;
    }
    handleChangeLocale (newLocale) {
        if (this.props.messagesByLocale[newLocale]) {
            this.props.onChangeLanguage(newLocale);
            document.documentElement.lang = newLocale;
        }
    }
    render () {
        const {
            currentLocale
        } = this.props;
        if (currentLocale == 'zh-cn') {
            return (
                <div onClick={this.handleChangeLocale.bind(this, 'en')} className={classNames(styles.menuBarItem, styles.hoverable, styles.languageMenu)}>
                    <img className={styles.icon} src={languageIconEn} />
                    <span className={styles.desc}>英文</span>
                </div>
            );
        }
        if (currentLocale == 'en') {
            return (
                <div onClick={this.handleChangeLocale.bind(this, 'zh-cn')} className={classNames(styles.menuBarItem, styles.hoverable, styles.languageMenu)}>
                    <img className={styles.icon} src={languageIconZhCn} />
                    <span className={styles.desc}>Chinese</span>
                </div>
            );
        }
    }
}

FlyingbearsLanguageSelector.propTypes = {
    currentLocale: PropTypes.string.isRequired,
    // Only checking key presence for messagesByLocale, no need to be more specific than object
    messagesByLocale: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChangeLanguage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    currentLocale: state.locales.locale,
    messagesByLocale: state.locales.messagesByLocale
});

const mapDispatchToProps = dispatch => ({
    onChangeLanguage: locale => {
        dispatch(selectLocale(locale));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FlyingbearsLanguageSelector);
