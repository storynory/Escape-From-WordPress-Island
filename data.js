import fetch from 'node-fetch';
import fs from 'fs/promises';

const website = 'https://www.storynory.com';

async function fetchAllCategories() {
  const categories = await fetchCategories();
  console.log('Fetched categories:', categories);

  const parentCategories = categories.filter(category => category.parent === 0);

  const categoriesWithSubcategories = await Promise.all(
    parentCategories.map(async category => {
      const subcategories = await fetchSubcategories(category.id);
      console.log('Fetched subcategories for', category.slug, ':', subcategories);

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        subcategories: subcategories.map(subcategory => ({
          id: subcategory.id,
          name: subcategory.name,
          slug: subcategory.slug,
        })),
      };
    })
  );

  return categoriesWithSubcategories;
}

async function fetchCategories() {
  const url = `${website}/wp-json/wp/v2/categories?per_page=100`;
  const response = await fetch(url);
  const categories = await response.json();
  return categories;
}

async function fetchSubcategories(parentId) {
  const url = `${website}/wp-json/wp/v2/categories?per_page=100&parent=${parentId}`;
  const response = await fetch(url);
  const subcategories = await response.json();
  return subcategories;
}

fetchAllCategories()
  .then(categories => {
    console.log('Categories with subcategories:', categories);

    // Generate the settings file content
    const settingsContent = `export const website = "${website}";

export const categories = ${JSON.stringify(categories, null, 2)};
`;

    // Write the settings file
    fs.writeFile('settings.js', settingsContent)
      .then(() => {
        console.log('Settings file generated successfully.');
      })
      .catch(error => {
        console.error('Error writing settings file:', error);
      });
  })
  .catch(error => {
    console.error('Error fetching categories:', error);
  });
