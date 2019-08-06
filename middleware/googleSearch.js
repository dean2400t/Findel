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
    var results1= await cusSearch.cse.list(params);
    params.start=11;
    var results2= await cusSearch.cse.list(params);
    params.start=21;
    var results3= await cusSearch.cse.list(params);
    params.start=31;
    var results4= await cusSearch.cse.list(params);
    var pages=[];
    var allRes=[];
    allRes.push(results1);
    allRes.push(results2);
    allRes.push(results3);
    allRes.push(results4);
    for (var r=0; r<4; r++)
        if (allRes[r]!=null)
            for (var index=0; index<10; index++)
                if (allRes[r].data.items[index]!=null)
                {
                    var order_index_by_google=index+r*10;
                    pages.push({pageURL: allRes[r].data.items[index].link,
                    formattedUrl: allRes[r].data.items[index].formattedUrl,
                    snippet: allRes[r].data.items[index].snippet,
                    order_index_by_google: order_index_by_google
                });
                }
    pages.sort((page_a, page_b)=>{if (page_b.pageURL>page_a.pageURL) return -1; else return 1;});
    return pages;
}