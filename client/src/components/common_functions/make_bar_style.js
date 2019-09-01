export default function make_bar_style(positive, negative)
{
  if (positive == 0 && negative ==0)
      return [0, 'warning'];
  var now = (positive/(positive+negative))*100;
  if (now < 10)
    return [10, 'danger'];
  if (now < 40)
    return [now, 'danger'];
  if (now < 60)
    return [now, 'warning'];
  return [now, 'success'];
}
