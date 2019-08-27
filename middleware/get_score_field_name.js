module.exports= function get_score_field_name(rank_type, rank_code)
{
  var score_field_name = rank_type;
  if (rank_code == 1)
    score_field_name = `${score_field_name}_positive_points`;
  else
    score_field_name = `${score_field_name}_negative_points`;
  return score_field_name;
}