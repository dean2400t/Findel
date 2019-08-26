const {google} = require('googleapis');
module.exports=async function googleSearch(search)
{
    var cusSearch=google.customsearch({
    version:'v1'
    });
    var params={
    q: search,
    key: 'AIzaSyCUTlh1nkTWMgeTEQeH3B2D3U63FHOIs2k',
    cx: '018379670787079815574:w_a1jjwdpqm'
    };

    results_array=[];
    results_array.push(cusSearch.cse.list(params));
    
    params.start=11;
    results_array.push(cusSearch.cse.list(params));
    
    params.start=21;
    results_array.push(cusSearch.cse.list(params));
    
    params.start=31;
    results_array.push(cusSearch.cse.list(params));
    
    allRes= await Promise.all(results_array);
    var pages=[];
    for (var r=0; r<4; r++)
        if (allRes[r]!=null)
            for (var index=0; index<10; index++)
                if (allRes[r].data.items[index]!=null)
                {
                    var order_index_by_google=index+r*10;
                    var pageURL= allRes[r].data.items[index].link;
                    try {
                        var decoded_url= decodeURI(pageURL)
                        pageURL= decoded_url;
                    } catch (error) {
                        
                    }
                    pages.push({pageURL: pageURL,
                    snippet: allRes[r].data.items[index].snippet,
                    order_index_by_google: order_index_by_google
                });
                }
    pages.sort((page_a, page_b)=>{if (page_b.pageURL>page_a.pageURL) return -1; else return 1;});
    return pages;
}