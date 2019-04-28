let axios = require('axios');

module.exports = async function webScrapeURL(url)
{
  var texts="";
  await axios.get(url)
  .then((response) => {

      if(response.status === 200) {
      const html = response.data;
      texts=html;
  }
  }, (error) => {
    console.log(error);

    } );
  return texts;
}