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
    var urls=[];
    var allRes=[];
    allRes.push(results1);
    allRes.push(results2);
    var siteNum=0;
    for (var r=0; r<2; r++)
        if (allRes[r]!=null)
            for (var index=0; index<10; index++)
                if (allRes[r].data.items[index]!=null)
                {
                urls.push(allRes[r].data.items[index].formattedUrl);
                siteNum++;
                }
    return urls;
}