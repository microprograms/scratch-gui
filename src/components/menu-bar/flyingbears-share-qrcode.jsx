import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './flyingbears-share-qrcode.css';

class FlyingbearsShareQrcode extends React.Component {
    render () {
        return (<div>
            <img
                src={this.props.qrcodeDataUrl}
                className={classNames(
                    styles.qrcode
                )}
            />
            <p>作业提交成功</p>
            <p>微信扫描二维码，和朋友们分享乐趣</p>
        </div>)
    }
}

FlyingbearsShareQrcode.propTypes = {
    qrcodeDataUrl: PropTypes.string
};
FlyingbearsShareQrcode.defaultProps = {
};

export default FlyingbearsShareQrcode;
