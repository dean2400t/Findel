import axios from 'axios';


class Topic_function {
    constructor() {
    }
    cancelRank(this_of_topic)
    {
        var edgeID=this_of_topic.props.topic.edgeID;
        var opts={
            edgeID: edgeID,
            rankCode: 0
        };
        if (this_of_topic.token=="")
        this_of_topic.setState({rank_error: "יש להתחבר על מנת לדרג"});
        else{
        axios.post("/api/userRanking/rank_connected_topic", opts, {
            headers: {'findel-auth-token': this_of_topic.token}
        })
            .then((result) => {
                var newWeight=this_of_topic.state.edge_weight;
                if (this_of_topic.state.rankCode==1)
                newWeight--;
                else
                newWeight++
                this_of_topic.setState({
                upArrowColor: 'black',
                downArrowColor: 'black',
                rank_error: "",
                edge_weight: newWeight,
                rankCode: 0
                })
            }).catch((error) => {
                this_of_topic.setState({rank_error: error.response.data});
            });
        }
    }
    upClick(this_of_topic)
    {
        if (this_of_topic.state.upArrowColor=='green')
            this.cancelRank(this_of_topic);
        else
        {
            var edgeID=this_of_topic.props.topic.edgeID;
            var opts={
                edgeID: edgeID,
            rankCode: 1
            };
            if (this_of_topic.token=="")
                this_of_topic.setState({rank_error: "יש להתחבר על מנת לדרג"});
            else
            {
                axios.post("/api/userRanking/rank_connected_topic", opts, {
                headers: {'findel-auth-token': this_of_topic.token}
                })
                .then((result) => {
                    var newWeight=this_of_topic.state.edge_weight;
                    if (this_of_topic.state.rankCode==2)
                        newWeight++;
                    newWeight++;
                    this_of_topic.setState({
                        upArrowColor: 'green',
                        downArrowColor: 'black',
                        rank_error: "",
                        edge_weight:newWeight,
                        rankCode: 1
                    })
                    }).catch((error) => {
                    this_of_topic.setState({rank_error: error.response.data});
                });
            }
        }
    }
    downClick(this_of_topic)
    {
        if (this_of_topic.state.downArrowColor=='red')
          this.cancelRank(this_of_topic);
        else
        {
            var edgeID=this_of_topic.props.topic.edgeID;
            var opts={
                edgeID: edgeID,
            rankCode: 2
          };
          if (this_of_topic.token=="")
            this_of_topic.setState({rank_error: "יש להתחבר על מנת לדרג"});
          else{
          axios.post("/api/userRanking/rank_connected_topic", opts, {
              headers: {'findel-auth-token': this_of_topic.token}
          })
              .then((result) => {
                var newWeight=this_of_topic.state.edge_weight;
                if (this_of_topic.state.rankCode==1)
                  newWeight--;
                newWeight--;
                this_of_topic.setState({
                    upArrowColor: 'black',
                    downArrowColor: 'red',
                    rank_error: "",
                    edge_weight:newWeight,
                    rankCode: 2
                  });
                }).catch((error) => {
                  this_of_topic.setState({rank_error: error.response.data});
              });
          }
        }
      }
}

export default Topic_function;