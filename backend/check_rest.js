
const https = require('https');

const projectId = 'admin-dashboard-5c0bb';
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pages/home`;

console.log(`Checking connectivity to: ${url}`);

https.get(url, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    let data = '';
    res.on('data', (d) => {
        data += d;
    });

    res.on('end', () => {
        console.log('Body:', data);
    });

}).on('error', (e) => {
    console.error('Error:', e);
});
