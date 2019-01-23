

var linksWordsObject;
var hashedLinkWords;
var linksSum;
var siteHit;

var numOfChars;
var prime;
var rad;
var numOfSites;

	var M; //int pattern length
	var Q; //long a large prime, small enough
	// to avoid long overflow
	var R; // radix
	var RM; //long R^(M-1) % Q
	
	function initRabinKarp(Qval, Rval, patLength) {
		// save pattern (needed only for Las Vegas)
		R = Rval;
		Q = Qval;
		M = patLength;
		// precompute R^(M-1) % Q
		// for use in removing leading digit
		RM = 1;
		for (var i = 1; i <= M-1; i++)
			RM = (R * RM) % Q;
		} 
	
	function hash(key) {
		var h = 0;
		for (var j = 0; j < M; j++)
			h = (R * h + key.charCodeAt(j)) % Q;
		return h;
		}
	
	function creatHashTable(text) {
		var hashTableLength=text.length-M+1;
		var hashedTable=[];
		var txtHash = hash(text, M);
		hashedTable[0]=txtHash;
		for (var index = 1; index < hashTableLength; index++) {
			txtHash = (txtHash + Q - RM*text.charCodeAt(index-1)% Q) % Q;
			txtHash = (txtHash*R + text.charCodeAt(index-1+M)) % Q;
			hashedTable[index]=txtHash;
			}
		return hashedTable;
	}

	function pushToLinksHash()
	{
		var patLength;
		for (var index=0; index<numOfChars; index++)
		{
			patLength=index+1
			if (patLength>4)
			{
				initRabinKarp(prime, rad, patLength);
				var linksInLength=linksWordsObject[index];
				var linksArrayOfLenght=hashedLinkWords[index];
				for (var linkIndex=0; linkIndex<linksInLength.length; linkIndex++)
				{
					var patHash=hash(linksInLength[linkIndex])
					if (linksArrayOfLenght[patHash]==null)
					{
						linksArrayOfLenght[patHash]=[];
						var siteArr=[];
						siteArr[numOfSites-1]=0;
						for (var sIndex=0; sIndex<numOfSites; sIndex++)
							siteArr[sIndex]=0;
						var linkOBJ={"page": linksInLength[linkIndex], "hits": 1, "sitesHits": siteArr};
						linksArrayOfLenght[patHash].push(linkOBJ);
						console.log("pushed: " +patHash + " Page: " + linksInLength[linkIndex]);
					}
					else
					{
						console.log("colided: " + patHash + " Page: " + linksInLength[linkIndex]);
						var isInArray=false;
						for (var hashIndex=0; hashIndex<linksArrayOfLenght[patHash].length && isInArray==false; hashIndex++)
							if (linksArrayOfLenght[patHash][hashIndex].page==linksInLength[linkIndex])
							{
								isInArray=true;
								linksArrayOfLenght[patHash][hashIndex].hits++;
							}
						if (isInArray==false)
						{
							var siteArr=[];
							siteArr[numOfSites-1]=0;
							for (var sIndex=0; sIndex<numOfSites; sIndex++)
							siteArr[sIndex]=0;
							var linkOBJ={"page": linksInLength[linkIndex], "hits": 1, "sitesHits": siteArr};
							linksArrayOfLenght[patHash].push(linkOBJ);
						}
					}
				}
			}
		}
	}

	function addHitsFromSites(sitesArray)
	{
		var siteIndex=0;
		siteHit=[];
		sitesArray.forEach(siteInArray => {
			site=siteInArray.text;
			console.log("site "+ siteIndex);
			siteHit[siteIndex]={"siteHits": 0, "siteOriginalIndex": siteIndex};
			for (var index=0; index<numOfChars; index++)
			{
				
				initRabinKarp(prime, rad, index+1);
				var linksArrayOfLenght=hashedLinkWords[index];
				if (site.length>=index)
				{
					var hashedSite=creatHashTable(site);
					for (var charIndexInSite=0; charIndexInSite<hashedSite.length; charIndexInSite++)
						if (linksArrayOfLenght[hashedSite[charIndexInSite]]!=null)
							for (var indexInHash=0; indexInHash<linksArrayOfLenght[hashedSite[charIndexInSite]].length; indexInHash++)
								if (site.substring(charIndexInSite, charIndexInSite+index+1)==linksArrayOfLenght[hashedSite[charIndexInSite]][indexInHash].page)
									{
										linksArrayOfLenght[hashedSite[charIndexInSite]][indexInHash].sitesHits[siteIndex]++;
										siteHit[siteIndex].siteHits++;
										//console.log("Hit: " + linksArrayOfLenght[hashedSite[charIndexInSite]][indexInHash].page);
									}
				}
			}
			siteIndex++;
		});
	}

	function arrangeHitsByTOP()
	{
		//get top Sites and add their hits to links hits
		siteHit.sort(function(a, b){
			return b.siteHits - a.siteHits;
		});

		linksSum=[];
		for (var patLengthIndex=0; patLengthIndex<numOfChars; patLengthIndex++)
			for (var index=0; index<Q; index++)
				if (hashedLinkWords[patLengthIndex][index]!=null)
					for (var linkIndexInHash=0; linkIndexInHash<hashedLinkWords[patLengthIndex][index].length; linkIndexInHash++)
					{
						for (var topSiteIndex=0; topSiteIndex<5; topSiteIndex++)
						{
							if (hashedLinkWords[patLengthIndex][index][linkIndexInHash]==undefined)
								var x=3;
							if (hashedLinkWords[patLengthIndex][index][linkIndexInHash].sitesHits==undefined)
								var x=3;
							if (siteHit[topSiteIndex]==undefined)
								var x=3;
							var topSiteCurHits= hashedLinkWords[patLengthIndex][index][linkIndexInHash].sitesHits[siteHit[topSiteIndex].siteOriginalIndex];
							var curHits=hashedLinkWords[patLengthIndex][index][linkIndexInHash].hits;
							if (topSiteCurHits!=null && topSiteCurHits>0)
								hashedLinkWords[patLengthIndex][index][linkIndexInHash].hits= curHits + topSiteCurHits;
						}
						linksSum.push(hashedLinkWords[patLengthIndex][index][linkIndexInHash]);

					}
		linksSum.sort(function(a, b){
			return b.hits - a.hits;
		});
		var x=3;
	}
	module.exports = function rabinKarpSearch(wikiLinks, sitesArray){
		linksWordsObject=[];
		hashedLinkWords=[];
		numOfChars=22;
		prime= 3001;
		rad=65536;
		numOfSites=sitesArray.length;
		for (var index=0; index<numOfChars; index++)
		{
			linksWordsObject.push([]);
			var arr=[];
			arr[prime-1]=undefined;
			hashedLinkWords.push(arr);
		}
		for (var index=0; index<wikiLinks.length; index++)
			if (wikiLinks[index].page!=null)
				if (wikiLinks[index].page.length<=numOfChars-3)
				{
					var page=" "+wikiLinks[index].page+" ";
					var patLength=page.length-1;
					linksWordsObject[patLength].push(page);
				}
		pushToLinksHash();
		addHitsFromSites(sitesArray);
		arrangeHitsByTOP();
		var x=siteHit;
		return linksSum;
		
	}