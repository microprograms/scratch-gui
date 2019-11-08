const getSignature = (callback) => {
    const serverUrl = 'http://47.105.83.254:9702/api';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', serverUrl);
    xhr.send();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
            callback(xhr.responseText);
        }
    };
}

const upload = (finalFilename, blob, uploadFinishedCallback) => {
    getSignature((responseText) => {
        const signatureObject = JSON.parse(responseText);

        const formData = new FormData();
        formData.append('name', finalFilename);
        formData.append('key', signatureObject['dir'] + finalFilename);
        formData.append('policy', signatureObject['policy']);
        formData.append('OSSAccessKeyId', signatureObject['accessid']);
        formData.append('success_action_status', '200');
        formData.append('callback', signatureObject['callback']);
        formData.append('signature', signatureObject['signature']);
        formData.append('file', blob);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', signatureObject['host']);
        xhr.send(formData);
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                uploadFinishedCallback(finalFilename);
            }
        };
    });
}

export default upload;
