import React, { Component } from 'react';
import './Page_ref.css';
import PropsTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowAltCircleUp} from '@fortawesome/free-solid-svg-icons';
import {faArrowAltCircleDown} from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import rank_page_topic_edge_function from './rank_page_topic_edge_function';

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
    this.state = {
      liked_upArrowColor: liked_upArrow,
      liked_downArrowColor: liked_downArrow,
      credibility_upArrowColor: credibility_upArrow,
      credibility_downArrowColor: credibility_downArrow,
      educational_upArrowColor: educational_upArrow,
      educational_downArrowColor: educational_downArrow,
      rank_error: "",
      edge_liked_weight: this.props.page_ref.liked_weight,
      edge_credibility_weight: this.props.page_ref.credibility_weight,
      edge_educational_weight: this.props.page_ref.educational_weight,
      rankCode: this.props.page_ref.userRankCode,
      domain_liked_weight: this.props.page_ref.domain.liked_weight,
      domain_credibility_weight: this.props.page_ref.domain.credibility_weight,
      domain_educational_weight: this.props.page_ref.domain.educational_weight
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
            <br/>
            <text>
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.liked_upArrowColor} onClick={() => this.rank_click_up("liked")}/> 
              ({this.state.edge_liked_weight}) 
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.liked_downArrowColor} onClick={() => this.rank_click_down("liked")}/>
              &nbsp; ציון משתמשים שאהבו את הדף
            </text><br/>
            
            <text> 
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.credibility_upArrowColor} onClick={() => this.rank_click_up("credibility")}/> 
              ({this.state.edge_credibility_weight}) 
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.credibility_downArrowColor} onClick={() => this.rank_click_down("credibility")}/>
              &nbsp; ציון משתמשים שאמרו שהדף&nbsp;
              <span class="field-tip">
                  <text><u>אמין*</u></text>
                    <span class="tip-content">
                    •	עד כמה השפה ואוצר המילים ברמה גבוהה ומקצועית?
                    <br/>
                    <br/>
                    •	כמה פרסומות קיימות בדף? באתרים המרוויחים כסף מפרסום קיים סיכוי גבוהה יותר, של גורמים חיצוניים, לממן כתבות ו/או להשפיע על תוכן האתר.
                    <br/>
                    <br/>
                    •	מי כתב את הדף? האם יש לו מניעה מסוים שיכול להשפיע על שיקול דעתו?
                    מה רמת הידע של כותב הדף בנושא? האם הוא עבר הסמכה? אקדמאי בתחום? מאיפה הנתונים שלו מגיעים? 
                    <br/>
                    <br/>
                    •	האם קיים בדף משהו שאתם מזהים כשגוי או מוטה? אם כן יכול להיות שישנם עוד שגיאות והטיות.
                    <br/>
                    <br/>
                    <br/>
                    לאחר ששאלתם שאלות אלו: אם אתם ברושם שהדף אמין, סמנו אותו ככזה. אם נתקלתם באחד או מספר דברים לא תקינים, סמנו אותו כלא אמין. אם אינכם בטוחים, השאירו אותו במצב הקיים.
                  </span>
              </span>  
            </text>
            <br/>
            

            <text>
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.educational_upArrowColor} onClick={() => this.rank_click_up("educational")}/> 
              ({this.state.edge_educational_weight}) 
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.educational_downArrowColor} onClick={() => this.rank_click_down("educational")}/>
              &nbsp; ציון מתשתמשים שאמרו שהדף מכיל תוכן חינוכי 
            </text>

            <br/><text> {this.state.domain_liked_weight} אהבו את הדומיין</text>
            <br/><text>{this.state.domain_credibility_weight} אמינות הדומיין</text>
            <br/><text>{this.state.domain_educational_weight} חינוכיות הדומיין</text>
            <br/><text style={redText}>{this.state.rank_error}</text>
            <a target="_blank" rel="noopener noreferrer" style={more_on_page_textStyle} href={"/Page_page/"+encodeURIComponent(this.props.page_ref.formatedURL)}>עוד על הדף...</a>
          </div>
    );
  }
  rank_click_up(rank_type)
  {
    rank_page_topic_edge_function(this, rank_type, "up")
  }
  rank_click_down(rank_type)
  {
    rank_page_topic_edge_function(this, rank_type, "down")
  }
}
Page_ref.PropsTypes={
    page_ref: PropsTypes.object.isRequired
}   
export default Page_ref;