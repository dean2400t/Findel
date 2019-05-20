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
            <text><a target="_blank" rel="noopener noreferrer" href={this.props.aRefSite.siteURL}>{this.props.aRefSite.formatedURL}</a> 
            <br/><text>{this.props.aRefSite.siteSnap}</text>
            <br/>דירוג משתמשים: <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.upArrowColor} onClick={() => this.upClick()}/> ({this.state.edgeWeight}) <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.downArrowColor} onClick={() => this.downClick()}/></text>
            <br/><text style={redText}>{this.state.rank_error}</text>
          </div>
    );
  }
  cancelRank()
  {
    ref_site_functions.cancelRank(this);
  }

  upClick= () => {
    ref_site_functions.upClick(this);
  }
  downClick= () => {
    ref_site_functions.downClick(this);
  }
}
ArefSite.PropsTypes={
    aRefSite: PropsTypes.object.isRequired
}   
export default ArefSite;