const add_rank_to_accumulate_ranking= require('../../models/common_functions_for_collections/ranking_functions/add_rank_to_accumulate_ranking');
const remove_rank_from_accumulate_rankings= require('../../models/common_functions_for_collections/ranking_functions/remove_rank_from_accumulate_ranking');

const {Domain}= require('../../models/domains');

async function rank_domain_remove_accumulate_ranking(ranking, domain, user)
{
    [accumulate_ranking_id, diff_positive, diff_negative]
    = await remove_rank_from_accumulate_rankings(ranking, domain._id, 'domains', user);

    var json_for_inc={};
    json_for_inc[ranking.rank_type + "_positive_points"]= diff_positive;
    json_for_inc[ranking.rank_type + "_negative_points"]= diff_negative;
    await Domain.findByIdAndUpdate(domain._id,
        {
            $inc: json_for_inc
        })
    domain[ranking.rank_type + "_positive_points"]+= diff_positive;
    domain[ranking.rank_type + "_negative_points"]+= diff_negative;
}

async function rank_domain_add_accumulate_ranking(ranking, domain, user)
{
    [accumulate_ranking_id, diff_positive, diff_negative]
    = await add_rank_to_accumulate_ranking(ranking, domain._id, 'domains', user);

    var json_for_inc={};
    json_for_inc[ranking.rank_type + "_positive_points"]= diff_positive;
    json_for_inc[ranking.rank_type + "_negative_points"]= diff_negative;
    await Domain.findByIdAndUpdate(domain._id,
        {
            $addToSet: {rankings: ranking},
            $inc: json_for_inc
        });
    domain[ranking.rank_type + "_positive_points"]+= diff_positive;
    domain[ranking.rank_type + "_negative_points"]+= diff_negative;
}
module.exports.rank_domain_remove_accumulate_ranking=rank_domain_remove_accumulate_ranking;
module.exports.rank_domain_add_accumulate_ranking=rank_domain_add_accumulate_ranking;