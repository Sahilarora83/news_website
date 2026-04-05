const fs = require('fs');
const file = 'c:/Users/Sahil/Downloads/New folder (5)/server/.runtime/cms-data.json';
try {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (data.articles && data.articles.length > 0) {
    data.articles[0].tags = ['राजनीति', 'Tech', 'featured'];
    data.articles[0].category = 'देश';
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log('Successfully added tags to the first article.');
  } else {
    console.log('No articles found in DB.');
  }
} catch (e) {
  console.error(e);
}
