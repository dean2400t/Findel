const {page_to_topic_selection}= require('../../models/common_fields_selection/page_topic_edges_selections');
const {page_populate}= require('../../models/common_fields_selection/page_selections');
const {Page_topic_edge} = require('../../models/page_topic_edges');

let axios = require('axios');
async function webScrapeURL(url)
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

module.exports= async function web_scrape(edgeID, force_scrape, res)
{
    var edgeID = req.query.edgeID;
    var force_scrape=req.query.force_scrape;
    
    var edge= await Page_topic_edge.findById(edgeID)
    .select(page_to_topic_selection())
    .populate(page_populate())
    .lean();
    if (!edge)
        return res.status(400).send("Topic to page edge not in database");

    var url = edge.page.pageURL
    if (edge.lastCalculated != null && force_scrape == "false")
    {
        var lastCalculated=new Date() - edge.lastCalculated;
        var numOfDaysToLive=2;
        if (lastCalculated <= numOfDaysToLive*86400000)
            return res.status(200).send({
                is_edge_up_to_date: true,
                jaccard_similarity: edge.jaccard_similarity,
                num_of_links_in_page: edge.num_of_links_in_page
            });
    }
    else
    {
        var html=await webScrapeURL(url);
        if (html!="")
            return res.status(200).send({is_edge_up_to_date: false, pageHTML: html});
        else
            return res.status(404).send("Page can't be scraped");
    }
    return res.status(404).send("Page can't be scraped");
}