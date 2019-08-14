import axios from 'axios';

class Comments_functions {
    constructor() {
    }

    ranking_function(this_of_comment, rank_type, up_or_down)
    {
        var string_for_comment_upArrow_color = rank_type + "_upArrowColor";
        var string_for_comment_downArrow_color = rank_type + "_downArrowColor";
        var upArrow = this_of_comment.state[string_for_comment_upArrow_color];
        var downArrow = this_of_comment.state[string_for_comment_downArrow_color];

        var rankCode = 0;
        if (up_or_down == "up")
        {
            if (upArrow != 'green')
                rankCode = 1;
        }
        else
            if (downArrow != 'red')
                rankCode = 2;

        var opts={
            commentID: this_of_comment.props.comment._id,
            rank_type: rank_type,
            rankCode: rankCode
        };
        axios.post("/api/userRanking/rank_comment", opts, {
            headers: {'findel-auth-token': this_of_comment.token}
        })
            .then((result) => {
                var res_data = result.data;
                var recived_time = new Date(res_data.comment_ranking_date);
                if (this_of_comment.last_ranking_timeStamp != null)
                    {
                        /*
                         if ids are the same then a deletion was made, so if rankcode is not 0 then
                         the deletion was received earlier
                        */
                         if (this_of_comment.last_ranking_id == res_data.comment_ranking_id)
                            if (res_data.rankCode != 0)
                                return;
                        
                        if (recived_time - this_of_comment.last_ranking_timeStamp < 0)
                            return;
                    }
                this_of_comment.last_ranking_id = res_data.comment_ranking_id;
                this_of_comment.last_ranking_timeStamp = recived_time;

                var string_for_comment_rank_type_positive_points = rank_type + "_positive_points";
                var string_for_comment_rank_type_negative_points = rank_type + "_negative_points";

                var json_for_state_change = {};
                json_for_state_change[string_for_comment_rank_type_positive_points] = res_data.positive_points;
                json_for_state_change[string_for_comment_rank_type_negative_points] = res_data.negative_points;
                if (res_data.rankCode == 0)
                {
                    json_for_state_change[string_for_comment_upArrow_color] = 'black';
                    json_for_state_change[string_for_comment_downArrow_color] = 'black';
                }
                else if (res_data.rankCode == 1)
                {
                    json_for_state_change[string_for_comment_upArrow_color] = 'green';
                    json_for_state_change[string_for_comment_downArrow_color] = 'black';
                }
                else
                {
                    json_for_state_change[string_for_comment_upArrow_color] = 'black';
                    json_for_state_change[string_for_comment_downArrow_color] = 'red';
                }
                json_for_state_change['rankCode'] = res_data.rankCode;

                this_of_comment.setState(json_for_state_change);
            }).catch((error) => {
                this_of_comment.setState({rank_error: error.response.data});
            });
    }
}

export default Comments_functions;