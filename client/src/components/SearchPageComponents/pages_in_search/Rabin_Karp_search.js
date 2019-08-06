class rabinKarpSearch {
	R;
	Q;
	numOfChars;
	RMarray;
	constructor(primeQ, numOfPatternsLength, num_of_pages) {
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
	  this.num_of_pages=num_of_pages;
	  
	  this.pages_hashes=[];
	  for (var index=0; index<num_of_pages; index++)
	  {
		  var arr=[];
		  arr[numOfPatternsLength-1]=null;
		  this.pages_hashes.push(arr);
	  }

	  this.texts=[];
	  this.texts[num_of_pages-1]=null;

	  this.wikiLinks_hashes_to_word_by_length=null;
	  this.words_matricies_by_length=null;
	  }
	  
	hash(pattern, patLength) {
		var h = 0;
		for (var j = 0; j < patLength; j++)
			h = (this.R * h + pattern.charCodeAt(j)) % this.Q;
		return h;
	}

	hashWikiLinks(wikiLinks){
	var words_matricies_by_length=[];
	var wikiLinks_hashes_to_word_by_length=[];
	for (var index=0; index<this.numOfChars; index++)
	{
		wikiLinks_hashes_to_word_by_length.push([]);
		var arr=[];
		arr[this.Q-1]=undefined;
		words_matricies_by_length.push(arr);
	}

	
	for (index=0; index<wikiLinks.length; index++)
		if (wikiLinks[index].topicName!=null)
			if (wikiLinks[index].topicName.length<this.numOfChars)
			{
				var pages_hits=[];
				pages_hits[this.num_of_pages-1]=null;
				var page=wikiLinks[index].topicName;
				var patLength=page.length-1;
				wikiLinks_hashes_to_word_by_length[patLength].push({linkName: page, 
					index_in_connected_topics_edges: wikiLinks[index].index_in_connected_topics_edges, 
					hash: -1, 
					pages_hits: pages_hits});
			}
	var curLength=1;
		wikiLinks_hashes_to_word_by_length.forEach(linksInLength => {
		if (linksInLength[0]!=null)
		{
			var linkLength=curLength;
			var linkIndex=0;
			linksInLength.forEach(link => {
				link.hash=this.hash(link.linkName, linkLength);
				var wordsMatriciesInLenght=words_matricies_by_length[linkLength-1];
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
	this.wikiLinks_hashes_to_word_by_length=wikiLinks_hashes_to_word_by_length;
	this.words_matricies_by_length=words_matricies_by_length;
	}

	creatHashTables(text, pageIndex) {
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
			this.pages_hashes[pageIndex][curNumOfChars-1]=hashedTable;
		}
		this.texts[pageIndex]=text;
	}

	add_hits_from_page(page, pageIndex)
	{
		var pageText=this.texts[pageIndex];
		var page_hashes=this.pages_hashes[pageIndex]
		var stringFromText;
		var num_of_links_in_page=0;
		//pageHit[pageIndex]={"pageHits": 0, "pageOriginalIndex": pageIndex};
		for (var curNumOfChars=0; curNumOfChars<this.numOfChars; curNumOfChars++)
		{
			var hashed_link_martix=this.words_matricies_by_length[curNumOfChars];
			var page_hash=page_hashes[curNumOfChars];
			var textIndex=0;
			page_hash.forEach(hash => {
				if (hashed_link_martix[hash]!=undefined)
				{
					stringFromText=pageText.substring(textIndex,textIndex+curNumOfChars+1);
					hashed_link_martix[page_hash[textIndex]].forEach(element => {
						if (stringFromText==element.linkName)
							if (this.wikiLinks_hashes_to_word_by_length[curNumOfChars][element.linkIndex].pages_hits[pageIndex]==null)
							{
								this.wikiLinks_hashes_to_word_by_length[curNumOfChars][element.linkIndex].pages_hits[pageIndex]=1;
								num_of_links_in_page++;
							}
							else{
								this.wikiLinks_hashes_to_word_by_length[curNumOfChars][element.linkIndex].pages_hits[pageIndex]++;
							}
					});
				}
				textIndex++;
			});
		}
		page.num_of_links_in_page=num_of_links_in_page;
		
	}

}

export default rabinKarpSearch;