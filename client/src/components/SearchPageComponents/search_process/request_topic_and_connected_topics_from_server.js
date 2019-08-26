import axios from 'axios';

export default async function request_topic_and_connected_topics_from_server(this_of_searchPage)
{
    this_of_searchPage.topic=null;
    await axios.get("/api/topics_to_topics/search_for_connected_topics_in_db_and_wikipedia/?search="+this_of_searchPage.curSearch,{
        headers: {'findel-auth-token': this_of_searchPage.token}
    })
    .then(async(result) => {
        if (result.data.ambig!=null)
        {
            result.data.ambig.forEach(category => {
                category.id=this_of_searchPage.id;
                this_of_searchPage.id++;
                category.subID=this_of_searchPage.id;
                this_of_searchPage.id++;
                category["subjects"].forEach(subject => {
                    subject.id=this_of_searchPage.id;
                    this_of_searchPage.id++;
                });
            });
            this_of_searchPage.setState({
                ambigousData: result.data.ambig
            });
            this_of_searchPage.ambig_for_history=result.data.ambig;
            this_of_searchPage.search_button_function_stop_search();
        }
        else 
        {
            this_of_searchPage.topic = result.data;
            this_of_searchPage.connected_topics_edges= result.data.topic_topic_edges;
            if (result.data.wikiText!=null)
                this_of_searchPage.wikiText= result.data.wikiText;
        }
    }).catch( (error) => {
        if (error.respnse!=null)
            this_of_searchPage.setState({
                server_message: error.respnse.data
            });
        else
            this_of_searchPage.setState({
                server_message: error.message
            });
        this_of_searchPage.search_button_function_stop_search();
    });
}