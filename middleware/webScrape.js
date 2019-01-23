let axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function getTextFromURL(url)
{
  var uri = encodeURI(url); 
  var texts="";
  console.log(url);
  await axios.get(uri)
  .then((response) => {

      if(response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html); 
      const $body=$("body");
      texts=$body.find("*").text();
      return texts
  }
  }, (error) => {
    console.log(error);

    } );
  var x=3;
  return texts;
}