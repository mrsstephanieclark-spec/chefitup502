const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the project directory
app.use(express.static(__dirname, {
    setHeaders: (res, filePath) => {
        // Guarantee proper MIME type matching for video assets
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.mp4') {
            res.setHeader('Content-Type', 'video/mp4');
        } else if (ext === '.mov') {
            res.setHeader('Content-Type', 'video/quicktime');
        }
    }
}));

// SPA-style routing fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
