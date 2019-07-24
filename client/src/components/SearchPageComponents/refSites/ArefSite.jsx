import React, { Component } from 'react';
import './ArefSite.css';
import PropsTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowAltCircleUp} from '@fortawesome/free-solid-svg-icons';
import {faArrowAltCircleDown} from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import Ref_site_functions from './ref_site_functions';

const cookies = new Cookies();
const ref_site_functions=new Ref_site_functions();

class ArefSite extends Component {
  constructor(props) {
    super(props);
    var liked_upArrow='black';
    var liked_downArrow='black';
    var trustworthy_upArrow='black';
    var trustworthy_downArrow='black';
    var educational_upArrow='black';
    var educational_downArrow='black';

    var users_rankings = this.props.aRefSite.user_rankings_for_edge
    users_rankings.forEach(ranking => {
        if (ranking.rank_type == "liked")
        {
          if (ranking.rankCode == 1)
            liked_upArrow = 'green'
          else
            liked_downArrow = 'red'
        }

        if (ranking.rank_type == "trustworthy")
        {
          if (ranking.rankCode == 1)
            trustworthy_upArrow = 'green'
          else
            trustworthy_downArrow = 'red'
        }

        if (ranking.rank_type == "educational")
        {
          if (ranking.rankCode == 1)
            educational_upArrow = 'green'
          else
            educational_downArrow = 'red'
        }
      });
    this.state = {
      liked_upArrowColor: liked_upArrow,
      liked_downArrowColor: liked_downArrow,
      trustworthy_upArrowColor: trustworthy_upArrow,
      trustworthy_downArrowColor: trustworthy_downArrow,
      educational_upArrowColor: educational_upArrow,
      educational_downArrowColor: educational_downArrow,
      rank_error: "",
      edge_liked_weight: this.props.aRefSite.liked_weight,
      edge_trustworthy_weight: this.props.aRefSite.trustworthy_weight,
      edge_educational_weight: this.props.aRefSite.educational_weight,
      rankCode: this.props.aRefSite.userRankCode,
      domain_liked_weight: this.props.aRefSite.domain.liked_weight,
      domain_trustworthy_weight: this.props.aRefSite.domain.trustworthy_weight,
      domain_educational_weight: this.props.aRefSite.domain.educational_weight
    }
    this.last_ranking_timeStamp = null;
    this.last_ranking_id = null;
    this.token=cookies.get('findel-auth-token') || "";
  }
  render() {
    var redText={color: "red"};
    var more_on_site_textStyle={color: '#0587c3'};
    return (
          <div className="aSiteRef">
            <text><a target="_blank" rel="noopener noreferrer" href={this.props.aRefSite.siteURL}>{this.props.aRefSite.formatedURL}</a></text>
            <br/><text>{this.props.aRefSite.siteSnap}</text>
            <br/>
            <text>
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.liked_upArrowColor} onClick={() => this.rank_click_up("liked")}/> 
              ({this.state.edge_liked_weight}) 
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.liked_downArrowColor} onClick={() => this.rank_click_down("liked")}/>
              &nbsp; ציון משתמשים שאהבו את הדף
            </text><br/>
            
            <text> 
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.trustworthy_upArrowColor} onClick={() => this.rank_click_up("trustworthy")}/> 
              ({this.state.edge_trustworthy_weight}) 
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.trustworthy_downArrowColor} onClick={() => this.rank_click_down("trustworthy")}/>
              &nbsp; ציון משתמשים שאמרו שהדף אמין
            </text>
            <br/>
            

            <text>
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.educational_upArrowColor} onClick={() => this.rank_click_up("educational")}/> 
              ({this.state.edge_educational_weight}) 
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.educational_downArrowColor} onClick={() => this.rank_click_down("educational")}/>
              &nbsp; ציון מתשתמשים שאמרו שהדף מכיל תוכן חינוכי 
            </text>

            <br/><text> {this.state.domain_liked_weight} אהבו את הדומיין</text>
            <br/><text>{this.state.domain_trustworthy_weight} אמינות הדומיין</text>
            <br/><text>{this.state.domain_educational_weight} חינוכיות הדומיין</text>
            <br/><text style={redText}>{this.state.rank_error}</text>
            <a target="_blank" rel="noopener noreferrer" style={more_on_site_textStyle} href={"/SitePage/"+this.siteURL}>עוד על הדף...</a>
          </div>
    );
  }
  rank_click_up(rank_type)
  {
    ref_site_functions.ranking_function(this, rank_type, "up")
  }
  rank_click_down(rank_type)
  {
    ref_site_functions.ranking_function(this, rank_type, "down")
  }
}
ArefSite.PropsTypes={
    aRefSite: PropsTypes.object.isRequired
}   
export default ArefSite;