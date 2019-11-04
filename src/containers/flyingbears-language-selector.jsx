import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {selectLocale} from '../reducers/locales';

import styles from '../components/menu-bar/menu-bar.css';
import languageIconEn from '../components/language-selector/en.svg';
import languageIconZhCn from '../components/language-selector/zh-cn.svg';

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
        return (
            <div>
                {(currentLocale == 'zh-cn') && (
                    <div onClick={this.handleChangeLocale.bind(this, 'en')} >
                        <img className={styles.languageIcon} src={languageIconEn} />
                        <span className={styles.languageDesc}>英文</span>
                    </div>
                )}
                {(currentLocale == 'en') && (
                    <div onClick={this.handleChangeLocale.bind(this, 'zh-cn')} >
                        <img className={styles.languageIcon} src={languageIconZhCn} />
                        <span className={styles.languageDesc}>Chinese</span>
                    </div>
                )}
            </div>
        );
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
