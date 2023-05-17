import fs from 'fs/promises';
import sharp from 'sharp';
import path from 'path';

async function createFolder(path) {
    if (!(await fs.stat(path).catch(() => false))) {
        await fs.mkdir(path, { recursive: true });
    }
}

async function processImage(imagePath, outputFolder) {
    try {
        const image = sharp(imagePath);
        const { width, height } = await image.metadata();

        const minSize = 300;
        const targetSize = Math.max(width, height, minSize);
        const resizeOptions = {
            width: targetSize,
            height: targetSize,
            fit: 'inside',
        };
        const offsetX = Math.floor((targetSize - width) / 2);
        const offsetY = Math.floor((targetSize - height) / 2);

        const outputFilename = `${outputFolder}/${path.basename(imagePath)}`;

        await image
            .resize(resizeOptions)
            .extend({
                top: offsetY,
                bottom: targetSize - height - offsetY,
                left: offsetX,
                right: targetSize - width - offsetX,
                background: { r: 255, g: 255, b: 240 }, // Ivory (RGB: 255, 255, 240)
            })
            .toFile(outputFilename);
    } catch (error) {
        console.error(`Error processing image ${imagePath}:`, error);
    }
}

async function batchProcessImages(inputFolder, outputFolder) {
    try {
        await createFolder(outputFolder);

        const imageFiles = await fs.readdir(inputFolder);

        for (const file of imageFiles) {
            const imagePath = `${inputFolder}/${file}`;
            const fileExtension = path.extname(imagePath).toLowerCase();

            // Check if the file is an image based on the extension
            if (fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png') {
                await processImage(imagePath, outputFolder);
            }
        }

        console.log('Images processed successfully!');
    } catch (error) {
        console.error('Error processing images:', error);
    }
}

const inputFolder = './images'; // Specify the folder where the downloaded images are located
const outputFolder = './square_images'; // Specify the folder to save the processed square images

batchProcessImages(inputFolder, outputFolder);
