class Jaccard_similarity {
	R;
	Q;
    numOfChars;
    RM;
	constructor(primeQ, numOfChars, prime_site_text) {
	  var R = 65536;
	  var Q = primeQ;
      this.RM = 1;
	  for (var i = 1; i < numOfChars; i++)
      this.RM = (R * this.RM) % Q;
	  this.R=R;
	  this.Q=primeQ;
      this.numOfChars=numOfChars;
      var prime_site_hash=this.creatHashTable(prime_site_text);
      this.create_sets_array(prime_site_text, prime_site_hash);
    }
	hash(pattern, patLength) {
		var h = 0;
		for (var j = 0; j < patLength; j++)
			h = (this.R * h + pattern.charCodeAt(j)) % this.Q;
		return h;
	}

	creatHashTable(siteText) {
        var hashTableLength=siteText.length-this.numOfChars+1;
        var hashedTable=[];
        var txtHash = this.hash(siteText, this.numOfChars);
        hashedTable[0]=txtHash;
        for (var index = 1; index < hashTableLength; index++) {
            txtHash = (txtHash + this.Q - this.RM*siteText.charCodeAt(index-1)% this.Q) % this.Q;
            txtHash = (txtHash*this.R + siteText.charCodeAt(index-1+this.numOfChars)) % this.Q;
            hashedTable[index]=txtHash;
            }
        return hashedTable;
    }
    
    create_sets_array(prime_site_text, prime_site_hash)
    {
        var index=0;
        var hashed_set_array = [];
        hashed_set_array[this.Q-1]=undefined;
        prime_site_hash.forEach(hashed => {
            var sub_string = prime_site_text.substring(index, index+this.numOfChars);
            if (hashed_set_array[hashed]==undefined)
            {
                hashed_set_array[hashed]={};
                hashed_set_array[hashed][sub_string] = {primeSite: 1, site_to_compare: 0};
            }
            else if (hashed_set_array[hashed][sub_string] == undefined)
                hashed_set_array[hashed][sub_string] = {primeSite: 1, site_to_compare: 0};
            index++;
        });
        this.hashed_set_array = hashed_set_array;
    }

	compute_site_similarity(siteText)
	{
        var index=0;
        var siteHash=this.creatHashTable(siteText);
        siteHash.forEach(hashed => {
            var sub_string = siteText.substring(index, index+this.numOfChars); 
            if (this.hashed_set_array[hashed]==undefined)
            {
                this.hashed_set_array[hashed]={};
                this.hashed_set_array[hashed][sub_string] = {primeSite: 0, site_to_compare: 1};
            }
            else if(this.hashed_set_array[hashed][sub_string]==undefined)
                this.hashed_set_array[hashed][sub_string] = {primeSite: 0, site_to_compare: 1};
            else if (this.hashed_set_array[hashed][sub_string].site_to_compare!=1)
                this.hashed_set_array[hashed][sub_string].site_to_compare=1;
            index++;
        });

        var union=0;
        var intersection=0;
        this.hashed_set_array.forEach(set_array => {
            if (set_array)
                Object.keys(set_array).forEach(set => {
                    if (set_array[set].primeSite==1 && set_array[set].site_to_compare==1)
                    {
                        union++;
                        intersection++;
                        set_array[set].site_to_compare=0;
                    }
                    else if (set_array[set].primeSite==0 && set_array[set].site_to_compare==1)
                    {
                        union++;
                        set_array[set].site_to_compare=0;
                    }
                    else if (set_array[set].primeSite==1 && set_array[set].site_to_compare==0)
                        union++;
                });
        });
        var jaccard_similarity= intersection/union;
        return jaccard_similarity;
	}

}

export default Jaccard_similarity;