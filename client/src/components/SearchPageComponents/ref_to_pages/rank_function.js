import axios from 'axios';
import make_bar_style from '../../common_functions/make_bar_style';

export default function rank_function(this_of_page_ref, rank_type, up_or_down)
{
    var string_for_upArrow_color = rank_type + "_upArrowColor";
    var string_for_downArrow_color = rank_type + "_downArrowColor";
    var upArrow = this_of_page_ref.state[string_for_upArrow_color];
    var downArrow = this_of_page_ref.state[string_for_downArrow_color];

    var rank_code = 0;
    if (up_or_down == "up")
    {
        if (upArrow != 'green')
            rank_code = 1;
    }
    else
        if (downArrow != 'red')
            rank_code = 2;

    if (rank_type == 'liked')
    {
        var edgeID=this_of_page_ref.props.page_ref._id;
        var opts={
            edgeID: edgeID,
            rank_type: rank_type,
            rank_code: rank_code
        };
        var api_path= "/api/page_topic_edges/rank_page_topic_edge";
    }
    else
    {
        var pageID=this_of_page_ref.props.page_ref.page._id
        var opts={
        pageID: pageID,
        rank_type: rank_type,
        rank_code: rank_code
        }
        var api_path= "/api/pages/rank_page";
    }

    axios.post(api_path, opts, {
        headers: {'findel-auth-token': this_of_page_ref.token}
    })
        .then((result) => {
            var res_data = result.data;
            var recived_time = new Date(res_data.ranking_date);
            if (this_of_page_ref.last_ranking_timeStamp != null)
                {
                    /*
                        if ids are the same then a deletion was made, so if rank_code is not 0 then
                        the deletion was received earlier
                    */
                        if (this_of_page_ref['last_ranking_id_'+rank_type] == res_data.ranking_id)
                            if (res_data.rank_code != 0)
                                return;
                    
                    if (recived_time - this_of_page_ref['last_ranking_timeStamp_'+rank_type] < 0)
                        return;
                }
            this_of_page_ref['last_ranking_id_'+rank_type] = res_data.ranking_id;
            this_of_page_ref['last_ranking_timeStamp_'+rank_type] = recived_time;

            var string_for_rank_type_positive_points = rank_type + "_positive_points";
            var string_for_domain_rank_type_positive_points = "domain_" + rank_type + "_positive_points";
            var string_for_rank_type_negative_points = rank_type + "_negative_points";
            var string_for_domain_rank_type_negative_points = "domain_" + rank_type + "_negative_points";

            var json_for_state_change = {};
            json_for_state_change[string_for_rank_type_positive_points] = res_data.positive_points;
            json_for_state_change[string_for_domain_rank_type_positive_points] = res_data.domain_positive_points;
            json_for_state_change[string_for_rank_type_negative_points] = res_data.negative_points;
            json_for_state_change[string_for_domain_rank_type_negative_points] = res_data.domain_negative_points;
            if (res_data.rank_code == 0)
            {
                json_for_state_change[string_for_upArrow_color] = 'black';
                json_for_state_change[string_for_downArrow_color] = 'black';
            }
            else if (res_data.rank_code == 1)
            {
                json_for_state_change[string_for_upArrow_color] = 'green';
                json_for_state_change[string_for_downArrow_color] = 'black';
            }
            else
            {
                json_for_state_change[string_for_upArrow_color] = 'black';
                json_for_state_change[string_for_downArrow_color] = 'red';
            }
            json_for_state_change['rank_code'] = res_data.rank_code;

            var bar_style=make_bar_style(
                res_data.positive_points,
                res_data.negative_points
              )
            var domain_bar_style=make_bar_style(
            res_data.domain_positive_points,
            res_data.domain_negative_points
            )
            json_for_state_change[rank_type + '_bar_style']=bar_style;
            json_for_state_change['domain_' + rank_type + '_bar_style']=domain_bar_style;
            this_of_page_ref.setState(json_for_state_change);
        }).catch((error) => {
            if (error.response != null)
                this_of_page_ref.setState({rank_error: error.response.data});
            else
                this_of_page_ref.setState({rank_error: error.message});
        });
}