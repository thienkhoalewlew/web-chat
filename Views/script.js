function openFileUploader() {
    document.getElementById('file-upload').click();
}

document.getElementById('file-upload').addEventListener('change', function() {
    var fileName = this.value.split('\\').pop();
    document.getElementById('file-label').innerText = fileName || 'Choose a file';
});