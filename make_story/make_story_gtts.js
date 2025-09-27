/**
 * Story Generator Tool
 * --------------------
 * Reads a story text file with embedded emotion tags,
 * generates speech audio (via Google TTS),
 * merges audio segments, and outputs a JSON metadata file
 * describing the story and its emotion timeline.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');
const ffmpeg = require('fluent-ffmpeg');
const gTTS = require('gtts');

// Promisified filesystem methods for async/await usage
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const accessAsync = promisify(fs.access);
const mkdirAsync = promisify(fs.mkdir);

// CLI interface for prompting user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Ask a question in the terminal and resolve with user input
 */
async function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Ensure a directory exists, creating it recursively if needed
 */
async function ensureDirectoryExists(dir) {
    try {
        await accessAsync(dir);
    } catch {
        await mkdirAsync(dir, { recursive: true });
    }
}

/**
 * Normalize string: remove accents for consistent filenames
 */
function removeAccents(str) {
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Convert public/ paths to web-facing relative paths
 */
function publicPathToWebPath(path) {
    return path.replace(/^public\//, '');
}

/**
 * Retrieve audio duration (in seconds) using ffprobe
 */
async function getAudioDuration(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) reject(err);
            else resolve(metadata.format.duration);
        });
    });
}

/**
 * Parse a text file for [emotion] tags
 * Returns parts of the story with associated emotions
 */
async function extractEmotions(text) {
    const regex = /\[(.*?)\]/g;
    let match;
    const emotions = [];
    const parts = [];
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
        const emotion = match[1].trim();
        emotions.push(emotion);

        // Extract text segment before the emotion tag
        const precedingText = text.substring(lastIndex, match.index).trim();
        if (precedingText) {
            parts.push({ text: precedingText, emotion });
        }
        lastIndex = regex.lastIndex;
    }

    return { parts, emotions };
}

/**
 * Generate speech audio from text using Google TTS
 */
async function generateAudio(text, filePath) {
    return new Promise((resolve, reject) => {
        const gtts = new gTTS(text, 'fr');
        gtts.save(filePath, function (err) {
            if (err) {
                console.error('Erreur TTS :', err);
                reject(err);
            } else {
                console.log(`Audio sauvegardé : ${filePath}`);
                resolve(filePath);
            }
        });
    });
}

/**
 * Merge multiple audio segments into a single file
 */
async function mergeAudioFiles(audioFiles, outputFile) {
    return new Promise((resolve, reject) => {
        let command = ffmpeg();
        audioFiles.forEach(file => command.input(file));
        command
            .on('end', () => resolve(outputFile))
            .on('error', err => reject(err))
            .mergeToFile(outputFile, './temp');
    });
}

/**
 * Main workflow:
 * 1. Prompt for story name
 * 2. Parse text file for emotions
 * 3. Generate audio for segments
 * 4. Merge into one audio file
 * 5. Output JSON metadata + update index
 */
async function processStory() {
    try {
        const storyName = await askQuestion("Entrez le nom de l'histoire : ");
        rl.close();

        const formattedName = removeAccents(storyName).toLowerCase().replace(/\s+/g, '_');
        const rawText = await readFileAsync('make_story/text.txt', 'utf8');
        const { parts } = await extractEmotions(rawText);

        // Ensure output directories exist
        await ensureDirectoryExists('public/audio/audio_story');
        await ensureDirectoryExists('public/stories');
        await ensureDirectoryExists('make_story/story');

        // Generate "story name" audio (for preview on hover)
        const nameAudioPath = `public/audio/audio_story/${formattedName}_name.mp3`;
        await generateAudio(storyName, nameAudioPath);

        // Generate each story part audio + collect emotion timestamps
        const audioFiles = [];
        const emotionTimestamps = [];
        let totalDuration = 0;

        for (let i = 0; i < parts.length; i++) {
            const audioPath = `make_story/story/audio_part_${i}.mp3`;
            await generateAudio(parts[i].text, audioPath);
            audioFiles.push(audioPath);

            const duration = await getAudioDuration(audioPath);
            totalDuration += duration;

            emotionTimestamps.push({ time: totalDuration, emotion: parts[i].emotion });
        }

        // Merge parts into final story audio
        const finalAudioPath = `public/audio/audio_story/${formattedName}.mp3`;
        await mergeAudioFiles(audioFiles, finalAudioPath);
        console.log(`Final audio généré : ${finalAudioPath}`);

        // Build story metadata
        const jsonData = {
            name: storyName,
            audio_name: publicPathToWebPath(nameAudioPath),
            audio: publicPathToWebPath(finalAudioPath),
            emotions: emotionTimestamps
        };

        const jsonFilePath = `public/stories/${formattedName}.json`;
        await writeFileAsync(jsonFilePath, JSON.stringify(jsonData, null, 2));
        console.log(`Fichier JSON créé : ${jsonFilePath}`);

        // Update central story index
        const indexPath = 'public/stories/index.json';
        let index = [];

        try {
            const existing = await readFileAsync(indexPath, 'utf8');
            index = JSON.parse(existing);
        } catch {
            console.log('Création d’un nouveau fichier index...');
        }

        index.push(`stories/${formattedName}.json`);
        await writeFileAsync(indexPath, JSON.stringify(index, null, 2));
        console.log(`Index mis à jour : ${indexPath}`);
    } catch (error) {
        console.error('Erreur lors du traitement de l’histoire :', error);
    }
}

// Run the workflow
processStory();
