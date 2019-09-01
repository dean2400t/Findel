const {Accumulate_ranking}= require('../../accumulate_rankings');
const {accumulate_ranking_save}= require('../save_securely_to_database');
const {accumulate_rankings_selection}= require('../../common_fields_selection/accumulate_rankings_selections');
module.exports= async function add_rank_to_accumulate_ranking(ranking, object_id, object_collection_name, user)
{
    var accumulating_ranking_find={
        object_id: object_id,
        object_collection_name: object_collection_name,
        user: user._id,
        rank_type: ranking.rank_type
    }

    while (!accumulate_ranking)
    {
        var prev_accumulate_ranking= await Accumulate_ranking.findOne(accumulating_ranking_find)
        .select(accumulate_rankings_selection())
        .lean();
        
        if (!prev_accumulate_ranking)
            {
                prev_accumulate_ranking = new Accumulate_ranking(accumulating_ranking_find);
                prev_accumulate_ranking= await accumulate_ranking_save(prev_accumulate_ranking);
                if (prev_accumulate_ranking.error != null)
                    return prev_accumulate_ranking;
            }
        if (prev_accumulate_ranking)
        {
            var overall_prev_rankings= prev_accumulate_ranking.positive_rankings + prev_accumulate_ranking.negative_rankings;
            if (overall_prev_rankings == 0)
            {
                var positive_prev_points= 0;
                var negative_prev_points= 0
            }
            else
            {
                var positive_prev_points= prev_accumulate_ranking.positive_rankings / overall_prev_rankings * prev_accumulate_ranking.user_score;
                var negative_prev_points= prev_accumulate_ranking.negative_rankings / overall_prev_rankings * prev_accumulate_ranking.user_score;
            }
            var positive_rankings= prev_accumulate_ranking.positive_rankings;
            var negative_rankings= prev_accumulate_ranking.negative_rankings;
        }
        else
        {
            var positive_rankings= 0;
            var negative_rankings= 0;
        }

        if (ranking.rank_code == 1)
        {
            var inc_field={
                positive_rankings: 1
            }
            positive_rankings++;
        }
        else
        {
            var inc_field={
                negative_rankings: 1
            }
            negative_rankings++;
        }

        var overall_rankings= positive_rankings + negative_rankings;
        if (overall_rankings == 0)
        {
            var positive_points= 0;
            var negative_points= 0;
        }
        else
        {
            var positive_points= positive_rankings / overall_rankings * user.user_score;
            var negative_points= negative_rankings / overall_rankings * user.user_score;
        }
        accumulating_ranking_find.__v=prev_accumulate_ranking.__v;
        inc_field.__v=1;
        var accumulate_ranking= await Accumulate_ranking.findOneAndUpdate(
            accumulating_ranking_find,
            {
                $inc: inc_field, 
                $push: {rankings: ranking._id},
                user_score: user.user_score
            }, 
            {
                new: true
            });
    }
    var diff_positive= positive_points - positive_prev_points;
    var diff_negative= negative_points - negative_prev_points;

    return [accumulate_ranking._id, diff_positive, diff_negative];
}