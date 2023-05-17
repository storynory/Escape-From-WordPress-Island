import fs from 'fs-extra';
import TurndownService from 'turndown';

async function fetchpost(url) {
  let response = await fetch(url);
  let stories = await response.json();
  return stories;
}

const cat = {
  katie: {
    id: 95,
    name: "katie",
    slug: "/category/original-stories-for-children/the-ordinary-witch/"
  },
  bertie: {
    name: "bertie",
    slug: "/category/original-stories-for-children/bertie-stories"
  },
  various:   {
    "id": 103,
    "name": "World Fairytales",
    "slug": "various-fairy-tales"
  },
};

let posts = cat.various;
let website = "https://storynory.com";

var story = fetchpost(website + '/wp-json/wp/v2/posts?per_page=100&categories=' + posts.id)
  .then(story => {
    for (let i = 0; i < story.length; i++) {
      let title = `title: "${story[i].title.rendered}"`;
      let date = `date: "${story[i].date}"`;
      let mp3 = `mp3: "${story[i].enclosure.split("\n")[0].trim()}"`;
      let slug = `permalink: "/${story[i].slug}/"`;
      let excerpt = `excerpt: "${story[i].excerpt.rendered.trim().replace(/(<([^>]+)>)/ig, '')}"`;
      let content = story[i].content.rendered;
      let turndownService = new TurndownService();
      let markdown = turndownService.turndown(content);
      let image = ''; // Initialize the image variable

      // Check if featured media exists in the response
      if (story[i].featured_media) {
        let featuredMediaId = story[i].featured_media;
        fetch(`${website}/wp-json/wp/v2/media/${featuredMediaId}`)
          .then(response => response.json())
          .then(mediaData => {
            let featuredMediaUrl = mediaData.source_url;
            image = `featured_image: "${featuredMediaUrl}"`; // Set the featured image URL

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

            let file = "./content/" +  story[i].slug + ".md";
            fs.writeFile(file, data);story
          })
          .catch(error => {
            console.error(error);
          });
      } else {
        let data =
          "---\n" +
          title + "\n" +
          date + "\n" +
          mp3 + "\n" +
          slug + "\n" +
          excerpt + "\n" +
          "---\n" +
          markdown;

        let file = "./content/" + posts.slug + "/" + story[i].slug + ".md";
        fs.writeFile(file, data);
      }
    }
  });
