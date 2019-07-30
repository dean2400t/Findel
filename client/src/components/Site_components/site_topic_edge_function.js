import axios from 'axios';


class Site_topic_edge_function {
    constructor() {
    }

    ranking_function(this_of_edge, rank_type, up_or_down)
    {
        var string_for_edge_upArrow_color = rank_type + "_upArrowColor";
        var string_for_edge_downArrow_color = rank_type + "_downArrowColor";
        var upArrow = this_of_edge.state[string_for_edge_upArrow_color];
        var downArrow = this_of_edge.state[string_for_edge_downArrow_color];

        var rankCode = 0;
        if (up_or_down == "up")
        {
            if (upArrow != 'green')
                rankCode = 1;
        }
        else
            if (downArrow != 'red')
                rankCode = 2;

        var edgeID=this_of_edge.props.aRefSite.edgeID;
        var opts={
            edgeID: edgeID,
            rank_type: rank_type,
            rankCode: rankCode
        };
        axios.post("/api/userRanking/rank_site_topic_edge", opts, {
            headers: {'findel-auth-token': this_of_edge.token}
        })
            .then((result) => {
                var res_data = result.data;
                var recived_time = new Date(res_data.edge_ranking_date);
                if (this_of_edge.last_ranking_timeStamp != null)
                    {
                        /*
                         if ids are the same then a deletion was made, so if rankcode is not 0 then
                         the deletion was received earlier
                        */
                         if (this_of_edge.last_ranking_id == res_data.edge_ranking_id)
                            if (res_data.rankCode != 0)
                                return;
                        
                        if (recived_time - this_of_edge.last_ranking_timeStamp < 0)
                            return;
                    }
                this_of_edge.last_ranking_id = res_data.edge_ranking_id;
                this_of_edge.last_ranking_timeStamp = recived_time;

                var string_for_edge_rank_type_weight = "edge_" + rank_type + "_weight";
                //var string_for_domain_rank_type_weight = "domain_" + rank_type + "_weight";

                var json_for_state_change = {};
                json_for_state_change[string_for_edge_rank_type_weight] = res_data.weight;
                //json_for_state_change[string_for_domain_rank_type_weight] = res_data.domain_weight;
                if (res_data.rankCode == 0)
                {
                    json_for_state_change[string_for_edge_upArrow_color] = 'black';
                    json_for_state_change[string_for_edge_downArrow_color] = 'black';
                }
                else if (res_data.rankCode == 1)
                {
                    json_for_state_change[string_for_edge_upArrow_color] = 'green';
                    json_for_state_change[string_for_edge_downArrow_color] = 'black';
                }
                else
                {
                    json_for_state_change[string_for_edge_upArrow_color] = 'black';
                    json_for_state_change[string_for_edge_downArrow_color] = 'red';
                }
                json_for_state_change['rankCode'] = res_data.rankCode;

                this_of_edge.setState(json_for_state_change);
            }).catch((error) => {
                this_of_edge.setState({rank_error: error.response.data});
            });
    }
}

export default Site_topic_edge_function;