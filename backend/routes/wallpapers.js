const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/authenticateToken');

// List built-in wallpapers available to all users
router.get('/builtin', (req, res) => {
    const builtinDir = path.join(__dirname, '../../Web/htmlOS-Next/public');
    const wallpapers = [];

    if (fs.existsSync(builtinDir)) {
        const files = fs.readdirSync(builtinDir);
        const wallpaperFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.webp', '.png', '.jpg', '.jpeg'].includes(ext) && file.startsWith('wallpaper-');
        });

        wallpaperFiles.forEach(file => {
            wallpapers.push({
                name: file,
                url: `/wallpapers/builtin/${file}`
            });
        });
    }

    res.json({ wallpapers });
});

// Serve a built-in wallpaper file
router.get('/builtin/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../Web/htmlOS-Next/public', filename);

    // Security: Ensure the file is within the public directory and is a wallpaper
    const publicDir = path.normalize(path.join(__dirname, '../../Web/htmlOS-Next/public'));
    const normalizedPath = path.normalize(filePath);

    if (!normalizedPath.startsWith(publicDir + path.sep)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const ext = path.extname(normalizedPath).toLowerCase();
    if (!['.webp', '.png', '.jpg', '.jpeg'].includes(ext) || !normalizedPath.includes('wallpaper-')) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(filePath);
});

// List available wallpapers (user wallpapers from config directory)
router.get('/list', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const wallpapers = [];

    // Add user wallpapers from config directory
    const userWallpaperDir = path.join(__dirname, '../data', String(userId), 'config', 'sys.next.settings', 'wallpapers');
    if (fs.existsSync(userWallpaperDir)) {
        const files = fs.readdirSync(userWallpaperDir);
        files.forEach(file => {
            // Return just the filename
            wallpapers.push(file);
        });
    }

    res.json({ wallpapers });
});

// Serve a user wallpaper file
router.get('/user/:filename', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { filename } = req.params;
    
    // Construct path to the wallpaper in config directory
    const filePath = path.join(__dirname, '../data', String(userId), 'config', 'sys.next.settings', 'wallpapers', filename);
    
    // Security: Ensure the file is within the wallpapers directory
    const wallpapersDir = path.join(__dirname, '../data', String(userId), 'config', 'sys.next.settings', 'wallpapers');
    const normalizedPath = path.normalize(filePath);
    const normalizedWallpapersDir = path.normalize(wallpapersDir);
    
    if (!normalizedPath.startsWith(normalizedWallpapersDir + path.sep)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(filePath);
});

module.exports = router;
