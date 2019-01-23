function extractDataFromRefLink(refData)
{
    var data=[];
    var categoryArray=refData.split(";");
    categoryArray.forEach(category => {
    if (category!="")
    {
        var subjectsArray = category.split("*");
        var title= subjectsArray[0].trim();
        var refineSubjectsArray=[];
        for (var index=1; index<subjectsArray.length; index++)
        {
        var name=subjectsArray[index].split("–");
        if (name.length<=1)
            name=subjectsArray[index].split("-");
        if (name.length>1)
        {
            var description=name[1].trim();
            name= name[0].trim();
            refineSubjectsArray.push({"name": name, "description": description});
        }
        }
        data.push({"title": title, "subjects": refineSubjectsArray});
    }
    });
    return data;
}

module.exports = extractDataFromRefLink=extractDataFromRefLink;