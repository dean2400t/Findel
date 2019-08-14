import React, { Component } from 'react';
import './Page_ref.css';
import PropsTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowAltCircleUp} from '@fortawesome/free-solid-svg-icons';
import {faArrowAltCircleDown} from '@fortawesome/free-solid-svg-icons';
import {faHeart} from '@fortawesome/free-regular-svg-icons';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {faBook} from '@fortawesome/free-solid-svg-icons';
import {faGlobe} from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import rank_function from './rank_function';
import {ProgressBar} from 'react-bootstrap';

const cookies = new Cookies();

class Page_ref extends Component {
  constructor(props) {
    super(props);
    var liked_upArrow='black';
    var liked_downArrow='black';
    var credibility_upArrow='black';
    var credibility_downArrow='black';
    var educational_upArrow='black';
    var educational_downArrow='black';

    var users_rankings = this.props.page_ref.user_rankings_for_edge
    users_rankings.forEach(ranking => {
        if (ranking.rank_type == "liked")
        {
          if (ranking.rankCode == 1)
            liked_upArrow = 'green'
          else
            liked_downArrow = 'red'
        }

        if (ranking.rank_type == "credibility")
        {
          if (ranking.rankCode == 1)
            credibility_upArrow = 'green'
          else
            credibility_downArrow = 'red'
        }

        if (ranking.rank_type == "educational")
        {
          if (ranking.rankCode == 1)
            educational_upArrow = 'green'
          else
            educational_downArrow = 'red'
        }
      });
    var liked_bar_style=this.make_bar_style(
      this.props.page_ref.liked_positive_points,
      this.props.page_ref.liked_negative_points,
      )
    var credibility_bar_style=this.make_bar_style(
      this.props.page_ref.credibility_positive_points,
      this.props.page_ref.credibility_negative_points,
      )
    var educational_bar_style=this.make_bar_style(
      this.props.page_ref.educational_positive_points,
      this.props.page_ref.educational_negative_points,
      )
    var domain_liked_bar_style=this.make_bar_style(
      this.props.page_ref.domain.liked_positive_points,
      this.props.page_ref.domain.liked_negative_points,
      )
    var domain_credibility_bar_style=this.make_bar_style(
      this.props.page_ref.domain.credibility_positive_points,
      this.props.page_ref.domain.credibility_negative_points,
      )
    var domain_educational_bar_style=this.make_bar_style(
      this.props.page_ref.domain.educational_positive_points,
      this.props.page_ref.domain.educational_negative_points,
      )

    this.state = {
      liked_upArrowColor: liked_upArrow,
      liked_downArrowColor: liked_downArrow,
      credibility_upArrowColor: credibility_upArrow,
      credibility_downArrowColor: credibility_downArrow,
      educational_upArrowColor: educational_upArrow,
      educational_downArrowColor: educational_downArrow,
      rank_error: "",
      liked_positive_points: this.props.page_ref.liked_positive_points,
      credibility_positive_points: this.props.page_ref.credibility_positive_points,
      educational_positive_points: this.props.page_ref.educational_positive_points,
      liked_negative_points: this.props.page_ref.liked_negative_points,
      credibility_negative_points: this.props.page_ref.credibility_negative_points,
      educational_negative_points: this.props.page_ref.educational_negative_points,
      rankCode: this.props.page_ref.userRankCode,
      domain_liked_positive_points: this.props.page_ref.domain.liked_positive_points,
      domain_credibility_positive_points: this.props.page_ref.domain.credibility_positive_points,
      domain_educational_positive_points: this.props.page_ref.domain.educational_positive_points,
      domain_liked_negative_points: this.props.page_ref.domain.liked_negative_points,
      domain_credibility_negative_points: this.props.page_ref.domain.credibility_negative_points,
      domain_educational_negative_points: this.props.page_ref.domain.educational_negative_points,
      liked_bar_style: liked_bar_style,
      credibility_bar_style: credibility_bar_style,
      educational_bar_style: educational_bar_style,
      domain_liked_bar_style: domain_liked_bar_style,
      domain_credibility_bar_style: domain_credibility_bar_style,
      domain_educational_bar_style: domain_educational_bar_style,
    }
    this.last_ranking_timeStamp = null;
    this.last_ranking_id = null;
    this.token=cookies.get('findel-auth-token') || "";
  }
  render() {
    var redText={color: "red"};
    var more_on_page_textStyle={color: '#0587c3'};
    return (
          <div className="a_page_ref">
            <text><a target="_blank" rel="noopener noreferrer" href={this.props.page_ref.pageURL}>{this.props.page_ref.formatedURL}</a></text>
            <br/><text>{this.props.page_ref.pageSnap}</text>
            <table>
            <tr>
              <td>
                ({this.state.liked_positive_points})
                <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.liked_upArrowColor} onClick={() => this.rank_click_up("liked")}/>
              </td>
              <td width='60%'>
                <ProgressBar
                variant={this.state.liked_bar_style[1]}
                now={this.state.liked_bar_style[0]} />
              </td> 
              <td>
                <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.liked_downArrowColor} onClick={() => this.rank_click_down("liked")}/>
                ({this.state.liked_negative_points}) 
                <FontAwesomeIcon icon={faHeart}/>
              </td>
            </tr>
            <tr>
              <td>
              ({this.state.credibility_positive_points}) 
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.credibility_upArrowColor} onClick={() => this.rank_click_up("credibility")}/> 
              </td>
              <td>
              <ProgressBar
                variant={this.state.credibility_bar_style[1]}
                now={this.state.credibility_bar_style[0]} />
              </td>
              <td>
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.credibility_downArrowColor} onClick={() => this.rank_click_down("credibility")}/>
              ({this.state.credibility_negative_points}) 
              <FontAwesomeIcon icon={faSearch}/>
              </td>
            </tr>
            <tr>
              <td>
              ({this.state.educational_positive_points}) 
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.educational_upArrowColor} onClick={() => this.rank_click_up("educational")}/> 
              </td>
              <td>
              <ProgressBar
                variant={this.state.educational_bar_style[1]}
                now={this.state.educational_bar_style[0]} />
              </td>
              <td>
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.educational_downArrowColor} onClick={() => this.rank_click_down("educational")}/>
              ({this.state.educational_negative_points}) 
                <FontAwesomeIcon icon={faBook}/>
              </td>
            </tr>
            </table>

            <table>
              <tr>
              <td>({this.state.domain_liked_positive_points})</td>
              <td width='60%'>
              <ProgressBar
                variant={this.state.domain_liked_bar_style[1]}
                now={this.state.domain_liked_bar_style[0]} />
              </td>
              <td>
                ({this.state.domain_liked_negative_points})
                <FontAwesomeIcon icon={faGlobe}/>
                <small><FontAwesomeIcon icon={faHeart}/></small>
              </td>
              </tr>
            
            <tr>
              <td>({this.state.domain_credibility_positive_points})</td>
              <td>
              <ProgressBar
                variant={this.state.domain_credibility_bar_style[1]}
                now={this.state.domain_credibility_bar_style[0]} />
              </td>
              <td>
                ({this.state.domain_credibility_negative_points})
                <FontAwesomeIcon icon={faGlobe}/>
                <small><FontAwesomeIcon icon={faSearch}/></small>
              </td>
            </tr>
            <tr>
              <td>({this.state.domain_educational_positive_points})</td>
              <td>
              <ProgressBar
                variant={this.state.domain_educational_bar_style[1]}
                now={this.state.domain_educational_bar_style[0]} />
              </td>
              <td>
                ({this.state.domain_educational_negative_points})
                <FontAwesomeIcon icon={faGlobe}/>
                <small><FontAwesomeIcon icon={faBook}/></small>
              </td>
            </tr>
            </table>
            <text style={redText}>{this.state.rank_error}</text>
            <a target="_blank" rel="noopener noreferrer" style={more_on_page_textStyle} href={"/Page_page/"+encodeURIComponent(this.props.page_ref.formatedURL)}>עוד על הדף...</a>
          </div>
    );
  }
  rank_click_up(rank_type)
  {
    rank_function(this, rank_type, "up")
  }
  rank_click_down(rank_type)
  {
    rank_function(this, rank_type, "down")
  }

  make_bar_style(positive, negative)
  {
    if (positive == 0 && negative ==0)
        return [50, 'warning'];
    var now = (positive/(positive+negative))*100;
    if (now < 10)
      return [100, 'danger'];
    if (now < 40)
      return [now, 'danger'];
    if (now < 60)
      return [now, 'warning'];
    return [now, 'success'];
  }
}
Page_ref.PropsTypes={
    page_ref: PropsTypes.object.isRequired
}   
export default Page_ref;