const getSignature = (callback) => {
    const serverUrl = 'http://127.0.0.1:9702/api';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', serverUrl);
    xhr.send();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
            callback(xhr.responseText);
        }
    };
}

const upload = (filename, blob, uploadFinishedCallback) => {
    getSignature((responseText) => {
        const signatureObject = JSON.parse(responseText);

        const formData = new FormData();
        formData.append('name', filename);
        formData.append('key', signatureObject['dir'] + '${filename}');
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
                uploadFinishedCallback(xhr);
            }
        };
    });
}

export default upload;
