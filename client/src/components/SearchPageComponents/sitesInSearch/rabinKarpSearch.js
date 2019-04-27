class rabinKarpSearch {
	R;
	Q;
	numOfChars;
	RMarray;
	constructor(primeQ, numOfPatternsLength, numOfSites) {
	  var R = 65536;
	  var Q = primeQ;
	  var numOfChars = numOfPatternsLength;
	  var RMarray=[];
	  RMarray.push(1);
	  for (var i = 1; i < numOfChars; i++)
		  RMarray.push((R * RMarray[i-1]) % Q);
	  this.R=R;
	  this.Q=primeQ;
	  this.numOfChars=numOfPatternsLength;
	  this.RMarray=RMarray;	
	  this.numOfSites=numOfSites;
	  
	  this.sitesHashes=[];
	  for (var index=0; index<numOfSites; index++)
	  {
		  var arr=[];
		  arr[numOfPatternsLength-1]=null;
		  this.sitesHashes.push(arr);
	  }

	  this.texts=[];
	  this.texts[numOfSites-1]=null;

	  this.wikiLinksHashesToWordByLength=null;
	  this.wordsMatriciesByLength=null;
	  }
	  
	hash(pattern, patLength) {
		var h = 0;
		for (var j = 0; j < patLength; j++)
			h = (this.R * h + pattern.charCodeAt(j)) % this.Q;
		return h;
	}

	hashWikiLinks(wikiLinks){
	var wordsMatriciesByLength=[];
	var wikiLinksHashesToWordByLength=[];
	for (var index=0; index<this.numOfChars; index++)
	{
		wikiLinksHashesToWordByLength.push([]);
		var arr=[];
		arr[this.Q-1]=undefined;
		wordsMatriciesByLength.push(arr);
	}

	
	for (index=0; index<wikiLinks.length; index++)
		if (wikiLinks[index].page!=null)
			if (wikiLinks[index].page.length<this.numOfChars)
			{
				var sitesHits=[];
				sitesHits[this.numOfSites-1]=null;
				var page=wikiLinks[index].page;
				var patLength=page.length-1;
				wikiLinksHashesToWordByLength[patLength].push({linkName: page, hash: -1, sitesHits: sitesHits});
			}
	var curLength=1;
		wikiLinksHashesToWordByLength.forEach(linksInLength => {
		if (linksInLength[0]!=null)
		{
			var linkLength=curLength;
			var linkIndex=0;
			linksInLength.forEach(link => {
				link.hash=this.hash(link.linkName, linkLength);
				var wordsMatriciesInLenght=wordsMatriciesByLength[linkLength-1];
				if (wordsMatriciesInLenght[link.hash]==undefined)
				{
					wordsMatriciesInLenght[link.hash]=[{
						linkName: link.linkName,
						linkIndex: linkIndex
					}]
				}
				else
				{
					var findIfLinkAlreadyInHashInMatrix=wordsMatriciesInLenght[link.hash].find(element=>{
						return element.linkName=link.linkName;
					});
					if (!findIfLinkAlreadyInHashInMatrix)
						wordsMatriciesInLenght[link.hash].push({
							linkName: link.linkName,
							linkIndex: linkIndex
						})
				}
				linkIndex++;
				
			});
		}
		curLength++;
	});
	this.wikiLinksHashesToWordByLength=wikiLinksHashesToWordByLength;
	this.wordsMatriciesByLength=wordsMatriciesByLength;
	}

	creatHashTables(text, siteIndex) {
		for (var curNumOfChars=1; curNumOfChars<=this.numOfChars; curNumOfChars++)
		{
			var hashTableLength=text.length-curNumOfChars+1;
			var hashedTable=[];
			var txtHash = this.hash(text, curNumOfChars);
			hashedTable[0]=txtHash;
			for (var index = 1; index < hashTableLength; index++) {
				txtHash = (txtHash + this.Q - this.RMarray[curNumOfChars-1]*text.charCodeAt(index-1)% this.Q) % this.Q;
				txtHash = (txtHash*this.R + text.charCodeAt(index-1+curNumOfChars)) % this.Q;
				hashedTable[index]=txtHash;
				}
			this.sitesHashes[siteIndex][curNumOfChars-1]=hashedTable;
		}
		this.texts[siteIndex]=text;
	}

	addHitsFromSite(siteIndex)
	{
		var siteText=this.texts[siteIndex];
		var siteHashes=this.sitesHashes[siteIndex]
		var stringFromText;
		//siteHit[siteIndex]={"siteHits": 0, "siteOriginalIndex": siteIndex};
		for (var curNumOfChars=0; curNumOfChars<this.numOfChars; curNumOfChars++)
		{
			var hashedLinkMartix=this.wordsMatriciesByLength[curNumOfChars];
			var siteHash=siteHashes[curNumOfChars];
			var textIndex=0;
			siteHash.forEach(hash => {
				if (hashedLinkMartix[hash]!=undefined)
				{
					stringFromText=siteText.substring(textIndex,textIndex+curNumOfChars+1);
					hashedLinkMartix[siteHash[textIndex]].forEach(element => {
						if (stringFromText==element.linkName)
							if (this.wikiLinksHashesToWordByLength[curNumOfChars][element.linkIndex].sitesHits[siteIndex]==null)
							{
								this.wikiLinksHashesToWordByLength[curNumOfChars][element.linkIndex].sitesHits[siteIndex]=1;
							}
							else{
								this.wikiLinksHashesToWordByLength[curNumOfChars][element.linkIndex].sitesHits[siteIndex]++;
							}
					});
				}
				textIndex++;
			});
		}
		
	}

}

export default rabinKarpSearch;