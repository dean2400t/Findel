import axios from 'axios';
import cheerio from 'cheerio';

export default async function hash_and_search_page(page, html, this_of_searchPage)
{
    var $ = cheerio.load(html);
    var text= $.text();
    if (text.length>20)
    {
        this_of_searchPage.rabinKarp.creatHashTables(text, page.index);
        this_of_searchPage.rabinKarp.add_hits_from_page(page, page.index);
        page.jaccard_similarity = this_of_searchPage.jaccard_similarity.compute_page_similarity(text);
        page.was_page_searched=true;
        var opts={
            edgeID: page.edgeID,
            jaccard_similarity: page.jaccard_similarity,
            num_of_links_in_page: page.num_of_links_in_page
          };
        await axios.post('/api/pages_to_topics/insert_page_topic_edge_scores', opts, {
        headers: {'findel-auth-token': this.token}}
            ).then(response => {
                console.log("edge successfuly added");
            }).catch(error=> {
                console.log("edge could not be added");
        });
        return true;
    }
    else
        return false;
}