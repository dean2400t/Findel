class Jaccard_similarity {
	R;
	Q;
    numOfChars;
    RM;
	constructor(primeQ, numOfChars, prime_page_text) {
	  var R = 65536;
	  var Q = primeQ;
      this.RM = 1;
	  for (var i = 1; i < numOfChars; i++)
      this.RM = (R * this.RM) % Q;
	  this.R=R;
	  this.Q=primeQ;
      this.numOfChars=numOfChars;
      var prime_page_hash=this.creatHashTable(prime_page_text);
      this.create_sets_array(prime_page_text, prime_page_hash);
    }
	hash(pattern, patLength) {
		var h = 0;
		for (var j = 0; j < patLength; j++)
			h = (this.R * h + pattern.charCodeAt(j)) % this.Q;
		return h;
	}

	creatHashTable(pageText) {
        var hashTableLength=pageText.length-this.numOfChars+1;
        var hashedTable=[];
        var txtHash = this.hash(pageText, this.numOfChars);
        hashedTable[0]=txtHash;
        for (var index = 1; index < hashTableLength; index++) {
            txtHash = (txtHash + this.Q - this.RM*pageText.charCodeAt(index-1)% this.Q) % this.Q;
            txtHash = (txtHash*this.R + pageText.charCodeAt(index-1+this.numOfChars)) % this.Q;
            hashedTable[index]=txtHash;
            }
        return hashedTable;
    }
    
    create_sets_array(prime_page_text, prime_page_hash)
    {
        var index=0;
        var hashed_set_array = [];
        hashed_set_array[this.Q-1]=undefined;
        prime_page_hash.forEach(hashed => {
            var sub_string = prime_page_text.substring(index, index+this.numOfChars);
            if (hashed_set_array[hashed]==undefined)
            {
                hashed_set_array[hashed]={};
                hashed_set_array[hashed][sub_string] = {primePage: 1, page_to_compare: 0};
            }
            else if (hashed_set_array[hashed][sub_string] == undefined)
                hashed_set_array[hashed][sub_string] = {primePage: 1, page_to_compare: 0};
            index++;
        });
        this.hashed_set_array = hashed_set_array;
    }

	compute_page_similarity(pageText)
	{
        var index=0;
        var pageHash=this.creatHashTable(pageText);
        pageHash.forEach(hashed => {
            var sub_string = pageText.substring(index, index+this.numOfChars); 
            if (this.hashed_set_array[hashed]==undefined)
            {
                this.hashed_set_array[hashed]={};
                this.hashed_set_array[hashed][sub_string] = {primePage: 0, page_to_compare: 1};
            }
            else if(this.hashed_set_array[hashed][sub_string]==undefined)
                this.hashed_set_array[hashed][sub_string] = {primePage: 0, page_to_compare: 1};
            else if (this.hashed_set_array[hashed][sub_string].page_to_compare!=1)
                this.hashed_set_array[hashed][sub_string].page_to_compare=1;
            index++;
        });

        var union=0;
        var intersection=0;
        this.hashed_set_array.forEach(set_array => {
            if (set_array)
                Object.keys(set_array).forEach(set => {
                    if (set_array[set].primePage==1 && set_array[set].page_to_compare==1)
                    {
                        union++;
                        intersection++;
                        set_array[set].page_to_compare=0;
                    }
                    else if (set_array[set].primePage==0 && set_array[set].page_to_compare==1)
                    {
                        union++;
                        set_array[set].page_to_compare=0;
                    }
                    else if (set_array[set].primePage==1 && set_array[set].page_to_compare==0)
                        union++;
                });
        });
        var jaccard_similarity= intersection/union;
        return jaccard_similarity;
	}

}

export default Jaccard_similarity;