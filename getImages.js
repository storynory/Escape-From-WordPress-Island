import fs from 'fs/promises';
import fetch from 'node-fetch';
import { website, categories } from './settings.js';

async function downloadImage(url, filename) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        await fs.writeFile(filename, Buffer.from(arrayBuffer));
    } catch (error) {
        console.error(`Error downloading image from ${url}:`, error);
    }
}

async function createFolder(path) {
    if (!(await fs.stat(path).catch(() => false))) {
        await fs.mkdir(path, { recursive: true });
    }
}

async function downloadFeaturedMediaImages() {
    try {
        const imagesFolder = './images';
        await createFolder(imagesFolder);

        for (const categoryKey in categories) {
            if (Object.hasOwnProperty.call(categories, categoryKey)) {
                const category = categories[categoryKey];
                for (const subcategory of category.subcategories) {
                    const url = `${website}/wp-json/wp/v2/posts?per_page=100&categories=${subcategory.id}`;
                    const response = await fetch(url);
                    const posts = await response.json();

                    for (const post of posts) {
                        if (post.featured_media) {
                            try {
                                const mediaResponse = await fetch(`${website}/wp-json/wp/v2/media/${post.featured_media}`);
                                if (!mediaResponse.ok) {
                                    throw new Error(`Failed to fetch media: ${mediaResponse.status} ${mediaResponse.statusText}`);
                                }
                                const mediaData = await mediaResponse.json();

                                const imageUrl = mediaData.source_url;
                                const mediaType = mediaData.media_type || 'image';
                                const fileExtension = mediaType.split('/')[1] || 'jpg';
                                const imageFilename = `${imagesFolder}/${mediaData.slug}.${fileExtension}`;
                                await downloadImage(imageUrl, imageFilename);
                            } catch (error) {
                                console.error(`Error downloading featured media for post ID ${post.id}:`, error);
                            }
                        }
                    }
                }
            }
        }

        console.log('Featured media images downloaded successfully!');
    } catch (error) {
        console.error('Error downloading featured media images:', error);
    }
}

downloadFeaturedMediaImages();
