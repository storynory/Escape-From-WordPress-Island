import fs from 'fs/promises';
import TurndownService from 'turndown';
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

async function createFolder(path) {
  if (!(await fs.stat(path).catch(() => false))) {
    await fs.mkdir(path, { recursive: true });
  }
}

function addImageDimensions(turndownService) {
  turndownService.addRule('img', {
    filter: 'img',
    replacement: function (content, node) {
      const alt = node.alt ? ' "' + node.alt + '"' : '';
      const src = node.getAttribute('src');
      const width = node.getAttribute('width');
      const height = node.getAttribute('height');
      const dimensions = width && height ? ` {width="${width}" height="${height}"}` : '';
      return `![${alt}](${src}${dimensions})`;
    },
  });
}

async function organizePosts() {
  try {
    for (const categoryKey in categories) {
      if (Object.hasOwnProperty.call(categories, categoryKey)) {
        const category = categories[categoryKey];
        const parentCategoryFolder = `./content/${category.slug}`;

        await createFolder(parentCategoryFolder);

        for (const subcategory of category.subcategories) {
          const subcategoryFolder = `${parentCategoryFolder}/${subcategory.slug}`;

          await createFolder(subcategoryFolder);

          const url = `${website}/wp-json/wp/v2/posts?per_page=100&categories=${subcategory.id}`;
          const stories = await fetchPosts(url);

          for (const story of stories) {
            let title = `title: "${story.title.rendered}"`;
            let date = `date: "${story.date}"`;
            let mp3 = `mp3: "${story.enclosure.split("\n")[0].trim()}"`;
            let slug = `permalink: "/${story.slug}/"`;
            let excerpt = `excerpt: "${story.excerpt.rendered.trim().replace(/(<([^>]+)>)/ig, '').replaceAll('\0', '')}"`;
            let content = story.content.rendered;

            const turndownService = new TurndownService();
            addImageDimensions(turndownService);

            let markdown = turndownService.turndown(content);
            let image = '';

            if (story.featured_media) {
              const mediaResponse = await fetch(`${website}/wp-json/wp/v2/media/${story.featured_media}`);
              const mediaData = await mediaResponse.json();

              let featuredMediaUrl = mediaData.source_url;
              let featuredMediaAlt = mediaData.alt_text;
              let featuredMediaDimensions = '';

              if (mediaData.media_details && mediaData.media_details.width && mediaData.media_details.height) {
                featuredMediaDimensions = `width: ${mediaData.media_details.width}\n  height: ${mediaData.media_details.height}`;
              }

              image = `featured_image:\n  src: "${featuredMediaUrl}"\n  alt: "${featuredMediaAlt}"\n  ${featuredMediaDimensions}`;
            }

            let data =
              "---\n" +
              title + "\n" +


              date + "\n" +
              mp3 + "\n" +
              slug + "\n" +
              excerpt + "\n" +
              image + "\n" +
              "---\n" +
              markdown;

            let file = `${subcategoryFolder}/${story.slug}.md`;
            await fs.writeFile(file, data);
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