export default function display_pages_scrape_process(this_of_searchPage)
{
    var pageToSearchArray=[];
    var stats="fa fa-spinner fa-spin";
    for (var index=0; index<this_of_searchPage.pages_from_server_to_use.length; index++)
        {
            pageToSearchArray.push({id: this_of_searchPage.id, pageURL: this_of_searchPage.pages_from_server_to_use[index].pageURL, scrape: stats});
            this_of_searchPage.id++;
        }
    this_of_searchPage.setState({
        pages_in_search: pageToSearchArray
    });
    
}