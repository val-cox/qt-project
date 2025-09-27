/**
 * Story Generator Tool (OpenAI TTS version)
 * -----------------------------------------
 * Uses OpenAI's text-to-speech API to convert a story text (with emotion tags)
 * into audio segments, merges them into a final track, and generates metadata.
 */

const fs = require('fs');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const readline = require('readline');
const { promisify } = require('util');
const openaiApiKey = process.env.OPENAI_API_KEY; // API key from environment

// Promisified filesystem methods for async/await usage
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const accessAsync = promisify(fs.access);
const mkdirAsync = promisify(fs.mkdir);

// CLI interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Prompt the user in CLI and resolve with their answer.
 */
async function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Ensure that a directory exists (create it recursively if not).
 */
async function ensureDirectoryExists(dir) {
    try {
        await accessAsync(dir);
    } catch {
        await mkdirAsync(dir, { recursive: true });
    }
}

/**
 * Normalize a string: remove accents for clean filenames.
 */
function removeAccents(str) {
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Convert public/ paths to web-facing relative paths.
 */
function publicPathToWebPath(path) {
    return path.replace(/^public\//, '');
}

/**
 * Get duration (in seconds) of an audio file using ffprobe.
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
 * Parse text for [emotion] tags.
 * Returns parts of text paired with associated emotions.
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

        const precedingText = text.substring(lastIndex, match.index).trim();
        if (precedingText) {
            parts.push({ text: precedingText, emotion });
        }
        lastIndex = regex.lastIndex;
    }

    return { parts, emotions };
}

/**
 * Generate audio for a text string using OpenAI TTS.
 */
async function generateAudio(text, filePath) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/audio/speech',
            {
                model: "tts-1",
                input: text,
                voice: "alloy",
                response_format: "mp3",
                language: "fr"
            },
            {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        await writeFileAsync(filePath, response.data);
        console.log(`Audio saved: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error(`Audio generation error:`, error);
        return null;
    }
}

/**
 * Merge multiple audio files into one track using ffmpeg.
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
 * 3. Generate audio segments via OpenAI TTS
 * 4. Merge into one audio file
 * 5. Write metadata JSON and update story index
 */
async function processStory() {
    try {
        const storyName = await askQuestion("Entrez le nom de l'histoire : ");
        rl.close();

        const formattedName = removeAccents(storyName).toLowerCase().replace(/\s+/g, '_');
        const rawText = await readFileAsync('make_story/text.txt', 'utf8');
        const { parts } = await extractEmotions(rawText);

        // Ensure output directories
        await ensureDirectoryExists('public/audio/audio_story');
        await ensureDirectoryExists('public/stories');
        await ensureDirectoryExists('make_story/story');

        // Generate preview audio for story name
        const nameAudioPath = `public/audio/audio_story/${formattedName}_name.mp3`;
        await generateAudio(storyName, nameAudioPath);

        // Generate each story part
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

        // Merge into final audio
        const finalAudioPath = `public/audio/audio_story/${formattedName}.mp3`;
        await mergeAudioFiles(audioFiles, finalAudioPath);
        console.log(`Final audio generated: ${finalAudioPath}`);

        // Build metadata
        const jsonData = {
            name: storyName,
            audio_name: publicPathToWebPath(nameAudioPath),
            audio: publicPathToWebPath(finalAudioPath),
            emotions: emotionTimestamps
        };

        const jsonFilePath = `public/stories/${formattedName}.json`;
        await writeFileAsync(jsonFilePath, JSON.stringify(jsonData, null, 2));
        console.log(`Metadata JSON created: ${jsonFilePath}`);

        // Update index
        const indexPath = 'public/stories/index.json';
        let index = [];

        try {
            const existing = await readFileAsync(indexPath, 'utf8');
            index = JSON.parse(existing);
        } catch {
            console.log('Creating new index file...');
        }

        index.push(`stories/${formattedName}.json`);
        await writeFileAsync(indexPath, JSON.stringify(index, null, 2));
        console.log(`Index updated: ${indexPath}`);
    } catch (error) {
        console.error('Story processing error:', error);
    }
}

// Run workflow
processStory();
