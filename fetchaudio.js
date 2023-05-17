import fs from 'fs/promises';
import path from 'path';
import { website, categories } from './settings.js';

async function fetchPosts(url) {
    const allStories = [];

    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
        const response = await fetch(`${url}&page=${page}`);
        const json = await response.json();

        if (response.headers.has('x-wp-totalpages')) {
            totalPages = Number(response.headers.get('x-wp-totalpages'));
        }

        allStories.push(...json);

        page++;
    }

    return allStories;
}

async function createFolder(folderPath) {
    if (!(await fs.stat(folderPath).catch(() => false))) {
        await fs.mkdir(folderPath, { recursive: true });
    }
}

async function checkFileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (error) {
        return false;
    }
}

async function downloadAudioFile(url, filePath) {
    const audioFilePath = `./content/audio/${filePath}`;
    const fileExists = await checkFileExists(audioFilePath);

    if (fileExists) {
        console.log('File already exists:', audioFilePath);
        return;
    }

    try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const fileData = new Uint8Array(buffer);

        await createFolder(path.dirname(audioFilePath));
        await fs.writeFile(audioFilePath, fileData);
        console.log('Downloaded:', audioFilePath);
    } catch (error) {
        console.error('Error downloading audio file:', error);
    }
}

async function organizePosts() {
    try {
        for (const categoryKey in categories) {
            if (Object.hasOwnProperty.call(categories, categoryKey)) {
                const category = categories[categoryKey];

                for (const subcategory of category.subcategories) {
                    const subcategoryFolder = `./content/${subcategory.slug}`;

                    await createFolder(subcategoryFolder);

                    const url = `${website}/wp-json/wp/v2/posts?per_page=100&categories=${subcategory.id}`;
                    const stories = await fetchPosts(url);

                    for (const story of stories) {
                        let mp3Url = story.enclosure.split("\n")[0].trim();
                        if (mp3Url) {
                            let fileName = mp3Url.split('/').pop();
                            let filePath = path.join(subcategory.slug, fileName);
                            const mp3FilePath = `./content/audio/${filePath}`;
                            const mp3FileExists = await checkFileExists(mp3FilePath);

                            if (mp3FileExists) {
                                console.log('MP3 file already exists:', mp3FilePath);
                            } else {
                                await downloadAudioFile(mp3Url, filePath);
                            }
                        }

                        // ... Rest of the code
                    }
                }
            }
        }

        console.log('Posts organized successfully!');
    } catch (error) {
        console.error('Error organizing posts:', error);
    }
}

organizePosts();
