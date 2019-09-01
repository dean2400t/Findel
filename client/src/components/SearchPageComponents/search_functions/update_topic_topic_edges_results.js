import axios from 'axios';

export default async function update_topic_topic_edges_results(this_of_searchPage)
{
    var connected_topics_edges=this_of_searchPage.connected_topics_edges;
    var edges_to_update=[];
    connected_topics_edges.forEach(connected_topic_edge => {
        if (connected_topic_edge.is_search_required)
            edges_to_update.push({
                _id: connected_topic_edge._id,
                web_scrape_score: connected_topic_edge.linkHits
            })
    });
    if (edges_to_update.length>0)
    {
        var opts={
            edges: edges_to_update
        };
        axios.post('/api/topic_topic_edges/insert_topic_topic_edges_scores', opts
            ).then(response => {
                console.log(response.data);
            }).catch(error=> {
                if (error.response==undefined)
                console.log("אין חיבור לשרת");
                else
                console.log(error.response.data);
        });
    }
}