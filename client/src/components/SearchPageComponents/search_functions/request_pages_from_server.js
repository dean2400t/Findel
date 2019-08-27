import axios from 'axios';
import sort_page_topic_edges from './sort_page_topic_edges';

export default async function request_pages_from_server(search, this_of_searchPage)
{
    await axios.get("/api/pages_to_topics/update_and_retrieve_topic_to_pages_edges_using_google/?search="+search,{
        headers: {'findel-auth-token': this_of_searchPage.token}
    })
        .then((result) => {
            return result.data;
        }).then((page_topic_edges) => {
            var full_page_topic_edges_list_from_server=page_topic_edges;
            
            var sorted_page_topic_edges = sort_page_topic_edges(full_page_topic_edges_list_from_server);
            
            for (var index=0; index<sorted_page_topic_edges.length; index++)
                sorted_page_topic_edges[index].index=index;
            
            var page_topic_edges_use=[];
            this_of_searchPage.page_displayed_so_far_index=0;
            var num_of_initial_page_topic_edges=9;
            for (var index=0; index<sorted_page_topic_edges.length && index<num_of_initial_page_topic_edges; index++)
                {
                    page_topic_edges_use.push(sorted_page_topic_edges[index]);
                    this_of_searchPage.page_displayed_so_far_index++;
                }
            
            this_of_searchPage.page_topic_edges_from_server_to_use=page_topic_edges_use;
            this_of_searchPage.full_page_topic_edges_list_from_server=sorted_page_topic_edges;
        }).catch((error) => {
            if (error.message==="Network Error")
                this_of_searchPage.setState({
                    server_message: "לא מצליח להגיע לשרת"
                });
            else if (error.response == null)
                this_of_searchPage.setState({
                    server_message: error.message
                });
            else
                this_of_searchPage.setState({
                    server_message: error.response.data
                });
        });
}

