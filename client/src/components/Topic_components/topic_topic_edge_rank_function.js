import axios from 'axios';

export default function topic_topic_edge_rank_function(this_of_topic, rank_type, up_or_down)
{
    var string_for_edge_upArrow_color = rank_type + "_upArrowColor";
    var string_for_edge_downArrow_color = rank_type + "_downArrowColor";
    var upArrow = this_of_topic.state[string_for_edge_upArrow_color];
    var downArrow = this_of_topic.state[string_for_edge_downArrow_color];

    var rank_code = 0;
    if (up_or_down == "up")
    {
        if (upArrow != 'green')
            rank_code = 1;
    }
    else
        if (downArrow != 'red')
            rank_code = 2;

    var edgeID=this_of_topic.props.topic_topic_edge._id;
    var opts={
        edgeID: edgeID,
        rank_type: rank_type,
        rank_code: rank_code
    };
    axios.post("/api/topic_topic_edges/rank_topic_topic_edge", opts, {
        headers: {'findel-auth-token': this_of_topic.token}
    })
        .then((result) => {
            var res_data = result.data;
            var recived_time = new Date(res_data.ranking_date);
            if (this_of_topic.last_ranking_timeStamp != null)
                {
                    /*
                        if ids are the same then a deletion was made, so if rank_code is not 0 then
                        the deletion was received earlier
                    */
                        if (this_of_topic.last_ranking_id == res_data.ranking_id)
                        if (res_data.rank_code != 0)
                            return;
                    
                    if (recived_time - this_of_topic.last_ranking_timeStamp < 0)
                        return;
                }
            this_of_topic.last_ranking_id = res_data.ranking_id;
            this_of_topic.last_ranking_timeStamp = recived_time;

            var string_for_edge_rank_type_positive_points = "edge_" + rank_type + "_positive_points";
            var string_for_edge_rank_type_negative_points = "edge_" + rank_type + "_negative_points";

            var json_for_state_change = {};
            json_for_state_change[string_for_edge_rank_type_positive_points] = res_data.positive_points;
            json_for_state_change[string_for_edge_rank_type_negative_points] = res_data.negative_points;
            if (res_data.rank_code == 0)
            {
                json_for_state_change[string_for_edge_upArrow_color] = 'black';
                json_for_state_change[string_for_edge_downArrow_color] = 'black';
            }
            else if (res_data.rank_code == 1)
            {
                json_for_state_change[string_for_edge_upArrow_color] = 'green';
                json_for_state_change[string_for_edge_downArrow_color] = 'black';
            }
            else
            {
                json_for_state_change[string_for_edge_upArrow_color] = 'black';
                json_for_state_change[string_for_edge_downArrow_color] = 'red';
            }
            json_for_state_change['rank_code'] = res_data.rank_code;

            this_of_topic.setState(json_for_state_change);
        }).catch((error) => {
            this_of_topic.setState({rank_error: error.response.data});
        });
}