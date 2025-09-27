// Import required Node.js core modules
const http = require('http');   // For creating the HTTP server
const fs = require('fs');       // For reading files from the filesystem
const path = require('path');   // For safely handling file paths

// Import ffmpeg for audio handling
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// Create an HTTP server
const server = http.createServer((req, res) => {
    /**
     * Case 1: Requesting an audio file (/audio/*)
     * -------------------------------------------------
     * If the URL starts with "/audio/", look inside the
     * "public/audio/" folder and serve the requested file.
     */
    if (req.url.startsWith('/audio/')) {
        const filePath = path.join(__dirname, 'public', req.url);   // e.g., public/audio/song.mp3
        const ext = path.extname(filePath);                         // File extension (.mp3, .opus, etc.)

        // Define MIME types for supported file formats
        const mimeTypes = {
            '.mp3': 'audio/mpeg',
            '.opus': 'audio/ogg',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json'
        };

        // Default to binary stream if type is unknown
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Check if file exists before serving
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Audio file not found');
                return;
            }

            // Read and send file contents
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Server error while serving audio');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content);
                }
            });
        });

    } else {
        /**
         * Case 2: Requesting other resources (default route)
         * -------------------------------------------------
         * - If "/", serve index.html
         * - Otherwise, serve requested file from "public/"
         */
        let filePath = path.join(
            __dirname,
            'public',
            req.url === '/' ? 'index.html' : req.url
        );

        let ext = path.extname(filePath);
        let contentType = 'text/html';  // Default to HTML if type unknown

        // Supported MIME types
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.mp3': 'audio/mpeg',
            '.opus': 'audio/ogg',
            '.json': 'application/json'
        };

        // Override contentType if file extension is recognized
        if (mimeTypes[ext]) contentType = mimeTypes[ext];

        // Check if requested file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Page not found');
                return;
            }

            // Read and send file contents
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Server error');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content);
                }
            });
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3000; // Render will inject PORT
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
