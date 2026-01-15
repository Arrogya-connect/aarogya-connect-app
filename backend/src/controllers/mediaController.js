const cloudinary = require('cloudinary').v2;

// Configure Cloudinary explicitly 
// (Hardcoded for immediate Vercel fix since .env isn't pushed)
cloudinary.config({
    cloud_name: 'dawhrba86',
    api_key: '946915478358729',
    api_secret: 'lgIobuR5rceViVorHgDKSBACJMQ'
});

async function getUploadSignature(req, res) {
    try {
        const timestamp = Math.round((new Date()).getTime() / 1000);
        const folder = 'user_uploads'; // Optional: Organize files

        // Parameters to sign
        const params = {
            timestamp: timestamp,
            folder: folder,
        };

        const signature = cloudinary.utils.api_sign_request(params, cloudinary.config().api_secret);

        return res.json({
            ok: true,
            signature,
            timestamp,
            cloudName: 'dawhrba86',
            apiKey: '946915478358729',
            folder
        });
    } catch (err) {
        console.error('getUploadSignature error', err);
        return res.status(500).json({ ok: false, error: 'failed to generate signature' });
    }
}

module.exports = { getUploadSignature };
