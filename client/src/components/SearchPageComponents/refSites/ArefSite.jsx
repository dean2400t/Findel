import React, { Component } from 'react';
import './ArefSite.css';
import PropsTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowAltCircleUp} from '@fortawesome/free-solid-svg-icons';
import {faArrowAltCircleDown} from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import axios from 'axios';
const cookies = new Cookies();

class ArefSite extends Component {
  constructor(props) {
    super(props);
    var upArrow='black';
    var downArrow='black';
    if (this.props.aRefSite.userRankCode==1)
      upArrow='green';
    if (this.props.aRefSite.userRankCode==2)
      downArrow='red';
    this.state = {
      upArrowColor: upArrow,
      downArrowColor: downArrow,
      rank_error: "",
      edgeWeight: this.props.aRefSite.edgeWeight,
      rankCode: this.props.aRefSite.userRankCode
    }
    
    this.token=cookies.get('findel-auth-token') || "";
  }
  render() {
    var redText={color: "red"};
    return (
          <div className="aSiteRef">
            <text><a target="_blank" rel="noopener noreferrer" href={this.props.aRefSite.url}>{this.props.aRefSite.formatedURL}</a> 
            <br/><text>{this.props.aRefSite.siteSnap}</text>
            <br/>דירוג משתמשים: <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.upArrowColor} onClick={() => this.upClick()}/> ({this.state.edgeWeight}) <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.downArrowColor} onClick={() => this.downClick()}/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; דירוג אלגוריתם: ({this.props.aRefSite.hits})</text>
            <br/><text style={redText}>{this.state.rank_error}</text>
          </div>
    );
  }
  cancelRank()
  {
    var topic=this.props.aRefSite.topic;
    var siteURL=this.props.aRefSite.url;
    var opts={
      topic: topic,
      siteURL: siteURL,
      rankCode: 0
    };
    if (this.token=="")
      this.setState({rank_error: "יש להתחבר על מנת לדרג"});
    else{
    axios.post("/api/userRanking/rankSite", opts, {
        headers: {'findel-auth-token': this.token}
     })
        .then((result) => {
            var newWeight=this.state.edgeWeight;
            if (this.state.rankCode==1)
              newWeight--;
            else
              newWeight++
            this.setState({
              upArrowColor: 'black',
              downArrowColor: 'black',
              rank_error: "",
              edgeWeight: newWeight,
              rankCode: 0
            })
        }).catch((error) => {
            this.setState({rank_error: error.response.data});
        });
    }
  }

  upClick= () => {
    if (this.state.upArrowColor=='green')
      this.cancelRank();
    else
    {
      var topic=this.props.aRefSite.topic;
      var siteURL=this.props.aRefSite.url;
      var opts={
        topic: topic,
        siteURL: siteURL,
        rankCode: 1
      };
      if (this.token=="")
        this.setState({rank_error: "יש להתחבר על מנת לדרג"});
      else{
      axios.post("/api/userRanking/rankSite", opts, {
          headers: {'findel-auth-token': this.token}
      })
          .then((result) => {
              var newWeight=this.state.edgeWeight;
              if (this.state.rankCode==2)
                newWeight++;
              newWeight++;
              this.setState({
                upArrowColor: 'green',
                downArrowColor: 'black',
                rank_error: "",
                edgeWeight:newWeight,
                rankCode: 1
              })
            }).catch((error) => {
              this.setState({rank_error: error.response.data});
          });
      }
    }
  }
  downClick= () => {
    if (this.state.downArrowColor=='red')
      this.cancelRank();
    else
    {
      var topic=this.props.aRefSite.topic;
      var siteURL=this.props.aRefSite.url;
      var opts={
        topic: topic,
        siteURL: siteURL,
        rankCode: 2
      };
      if (this.token=="")
        this.setState({rank_error: "יש להתחבר על מנת לדרג"});
      else{
      axios.post("/api/userRanking/rankSite", opts, {
          headers: {'findel-auth-token': this.token}
      })
          .then((result) => {
            var newWeight=this.state.edgeWeight;
            if (this.state.rankCode==1)
              newWeight--;
            newWeight--;
            this.setState({
                upArrowColor: 'black',
                downArrowColor: 'red',
                rank_error: "",
                edgeWeight:newWeight,
                rankCode: 2
              });
            }).catch((error) => {
              this.setState({rank_error: error.response.data});
          });
      }
    }
  }
}
ArefSite.PropsTypes={
    aRefSite: PropsTypes.object.isRequired
}   
export default ArefSite;