const cloudinary = require('cloudinary').v2;

// Configure Cloudinary explicitly if not picked up from env automatically, 
// but CLOUDINARY_URL in env is usually sufficient. 
// We parse it manually just to be safe or rely on auto-config.
// However, for the signature, we need the api_secret explicitly available or via the SDK.

if (process.env.CLOUDINARY_URL) {
    // Cloudinary SDK auto-configures from this variable
}

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
            cloudName: cloudinary.config().cloud_name,
            apiKey: cloudinary.config().api_key,
            folder
        });
    } catch (err) {
        console.error('getUploadSignature error', err);
        return res.status(500).json({ ok: false, error: 'failed to generate signature' });
    }
}

module.exports = { getUploadSignature };
