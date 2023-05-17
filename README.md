# Escape-From-WordPress-Island
Some scripts to escape from WordPress and use content in Jamstack

This will make mardown files out of your wordpress content, and organise it into folders.  There
are also scripts to pull down images and audio. 

## Preparation for more complete version
Before doing anyting, you need to run data.js (edit to use your website).  This will create
settings.js.   Also create a content folder root of your project. 
Then you can run escapewp.js


##Simple version, maybe best to get started
Alternatively, there is a simple-version.js which is my original code before it started to grow. 
You can hack this to download one category at a time.  You don't need to run data or set up external settings. Hack this part
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

## How I wrote it (with help!) and how you can modify it. 
I started with the simple version, gave it to Chatgpt, and then started going over iterations to 
do more an more things, like organising the categories, downloading images, etc.  So if you want to modifiy it,
you can try using Chatgpt.
