import axios from 'axios';
import sort_pages from './sort_pages';

export default async function request_pages_from_server(search, this_of_searchPage)
{
    await axios.get("/api/pages_to_topics/update_and_retrieve_topic_to_pages_edges_using_google/?search="+search,{
        headers: {'findel-auth-token': this_of_searchPage.token}
    })
        .then((result) => {
            return result.data;
        }).then((pages) => {
            var full_pages_array=pages;
            
            var shuffled_pages = sort_pages(full_pages_array);
            
            for (var index=0; index<shuffled_pages.length; index++)
                shuffled_pages[index].index=index;
            
            var pages_to_use=[];
            var num_of_initial_pages=9;
            for (var index=0; index<shuffled_pages.length && index<num_of_initial_pages; index++)
                pages_to_use.push(shuffled_pages[index]);
            
            this_of_searchPage.pages_from_server_to_use=pages_to_use;
            this_of_searchPage.full_pages_list_from_server=shuffled_pages;
        }).catch((error) => {
            if (error.message==="Network Error")
                this_of_searchPage.setState({
                    server_message: "לא מצליח להגיע לשרת"
                });
            else
                this_of_searchPage.setState({
                    server_message: error.response.data
                });
        });
}

