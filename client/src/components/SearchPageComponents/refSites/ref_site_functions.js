import axios from 'axios';


class Ref_site_functions {
    constructor() {
    }
    cancelRank(this_of_refSite)
    {
        var edgeID=this_of_refSite.props.aRefSite.edgeID;
        var siteID=this_of_refSite.props.aRefSite.siteID;
        var opts={
            edgeID: edgeID,
            siteID: siteID,
            rankCode: 0
        };
        if (this_of_refSite.token=="")
        this_of_refSite.setState({rank_error: "יש להתחבר על מנת לדרג"});
        else{
        axios.post("/api/userRanking/rankSite", opts, {
            headers: {'findel-auth-token': this_of_refSite.token}
        })
            .then((result) => {
                var newWeight=this_of_refSite.state.edgeWeight;
                if (this_of_refSite.state.rankCode==1)
                newWeight--;
                else
                newWeight++
                this_of_refSite.setState({
                upArrowColor: 'black',
                downArrowColor: 'black',
                rank_error: "",
                edgeWeight: newWeight,
                rankCode: 0
                })
            }).catch((error) => {
                this_of_refSite.setState({rank_error: error.response.data});
            });
        }
    }
    upClick(this_of_refSite)
    {
        if (this_of_refSite.state.upArrowColor=='green')
            this.cancelRank(this_of_refSite);
        else
        {
            var edgeID=this_of_refSite.props.aRefSite.edgeID;
            var siteID=this_of_refSite.props.aRefSite.siteID;
            var opts={
                edgeID: edgeID,
                siteID: siteID,
            rankCode: 1
            };
            if (this_of_refSite.token=="")
                this_of_refSite.setState({rank_error: "יש להתחבר על מנת לדרג"});
            else
            {
                axios.post("/api/userRanking/rankSite", opts, {
                headers: {'findel-auth-token': this_of_refSite.token}
                })
                .then((result) => {
                    var newWeight=this_of_refSite.state.edgeWeight;
                    if (this_of_refSite.state.rankCode==2)
                        newWeight++;
                    newWeight++;
                    this_of_refSite.setState({
                        upArrowColor: 'green',
                        downArrowColor: 'black',
                        rank_error: "",
                        edgeWeight:newWeight,
                        rankCode: 1
                    })
                    }).catch((error) => {
                    this_of_refSite.setState({rank_error: error.response.data});
                });
            }
        }
    }
    downClick(this_of_refSite)
    {
        if (this_of_refSite.state.downArrowColor=='red')
          this.cancelRank(this_of_refSite);
        else
        {
            var edgeID=this_of_refSite.props.aRefSite.edgeID;
            var siteID=this_of_refSite.props.aRefSite.siteID;
            var opts={
                edgeID: edgeID,
                siteID: siteID,
            rankCode: 2
          };
          if (this_of_refSite.token=="")
            this_of_refSite.setState({rank_error: "יש להתחבר על מנת לדרג"});
          else{
          axios.post("/api/userRanking/rankSite", opts, {
              headers: {'findel-auth-token': this_of_refSite.token}
          })
              .then((result) => {
                var newWeight=this_of_refSite.state.edgeWeight;
                if (this_of_refSite.state.rankCode==1)
                  newWeight--;
                newWeight--;
                this_of_refSite.setState({
                    upArrowColor: 'black',
                    downArrowColor: 'red',
                    rank_error: "",
                    edgeWeight:newWeight,
                    rankCode: 2
                  });
                }).catch((error) => {
                  this_of_refSite.setState({rank_error: error.response.data});
              });
          }
        }
      }
}

export default Ref_site_functions;