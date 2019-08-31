const remove_rank_from_accumulate_rankings= require('../../models/common_functions_for_collections/ranking_functions/remove_rank_from_accumulate_ranking');
const add_rank_to_accumulate_ranking= require('../../models/common_functions_for_collections/ranking_functions/add_rank_to_accumulate_ranking');
const {rank_domain_remove_accumulate_ranking,
    rank_domain_add_accumulate_ranking}=
    require('../domains/rank_domain_accumulate_ranking_functions');
const {Page}= require('../../models/pages');

async function rank_page_remove_accumulate_ranking(ranking, page, user)
{
    [accumulate_ranking, diff_positive, diff_negative]
    = await remove_rank_from_accumulate_rankings(ranking, page._id, 'pages', user);

    var json_for_inc={};
    json_for_inc[ranking.rank_type + "_positive_points"]= diff_positive;
    json_for_inc[ranking.rank_type + "_negative_points"]= diff_negative;
    await Page.findByIdAndUpdate(page._id,
        {
            $inc: json_for_inc
        })
    page[ranking.rank_type + "_positive_points"]+= diff_positive;
    page[ranking.rank_type + "_negative_points"]+= diff_negative;
    await rank_domain_remove_accumulate_ranking(ranking, page.domain, user)
}

async function rank_page_add_accumulate_ranking(ranking, page, user)
{
    [accumulate_ranking, diff_positive, diff_negative]
    = await add_rank_to_accumulate_ranking(ranking, page._id, 'pages', user);

    var json_for_inc={};
    json_for_inc[ranking.rank_type + "_positive_points"]= diff_positive;
    json_for_inc[ranking.rank_type + "_negative_points"]= diff_negative;
    await Page.findByIdAndUpdate(page._id,
        {
            $addToSet: {accumulate_rankings: accumulate_ranking},
            $inc: json_for_inc
        });
    page[ranking.rank_type + "_positive_points"]+= diff_positive;
    page[ranking.rank_type + "_negative_points"]+= diff_negative;
    await rank_domain_add_accumulate_ranking(ranking, page.domain, user)
}
module.exports.rank_page_remove_accumulate_ranking=rank_page_remove_accumulate_ranking;
module.exports.rank_page_add_accumulate_ranking=rank_page_add_accumulate_ranking;