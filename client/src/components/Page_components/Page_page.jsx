import React, { Component } from 'react';
import './Page_page.css'
import axios from 'axios';
import Connected_topics_edges_component from './connected_topics_edges_component';
import Comments_loader from '../Comments_components/Comments_loader';
import Cookies from 'universal-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowAltCircleUp} from '@fortawesome/free-solid-svg-icons';
import {faArrowAltCircleDown} from '@fortawesome/free-solid-svg-icons';
import {faHeart} from '@fortawesome/free-regular-svg-icons';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {faBook} from '@fortawesome/free-solid-svg-icons';
import {faGlobe} from '@fortawesome/free-solid-svg-icons';
import {faCircle} from '@fortawesome/free-solid-svg-icons';
import {ProgressBar} from 'react-bootstrap';
import make_bar_style from '../common_functions/make_bar_style';
import page_rank_function from './page_rank_function';
import round from '../round_function';
const cookies = new Cookies();

class Page_page extends Component {
    constructor(props) {
        super(props);
        var topics=[];
        const {encoded_pageURL} = this.props.match.params;
        try {
            var pageURL=decodeURI(encoded_pageURL);
        } catch (error) {
            console.log("failed to decode url");
        }
        
        var domain= {domainURL: ""};
        this.state = {
            page_loading: true,
            liked_bar_style: [0, 'info'],
            credibility_bar_style: [0, 'info'],
            educational_bar_style: [0, 'info'],
            domain_liked_bar_style: [0, 'info'],
            domain_credibility_bar_style: [0, 'info'],
            domain_educational_bar_style: [0, 'info'],
            pageID: "",
            topics:topics,
            pageURL: pageURL,
            domain: domain,
            page_topic_edges: [],
            data_for_comments: {
                object_id: "",
                object_collection_name: '',
                number_of_comments: 0
            }
        };
        this.id=1;
        this.token=cookies.get('findel-auth-token') || "";
        if (pageURL)
            axios.get("/api/pages/page_data/?encoded_pageURL="+encoded_pageURL,{
            headers: {'findel-auth-token': this.token}})
            .then((result) => {
                return result.data;
            }).then((page) => {
                var page_topic_edges=page.page_topic_edges;
                page_topic_edges.sort((edge_a, edge_b)=>{return edge_b.web_scrape_score-edge_a.web_scrape_score;});
                page_topic_edges.sort((edge_a, edge_b)=>{return edge_b.liked_positive_points-edge_a.liked_positive_points;});
                page_topic_edges.forEach(edge => {
                    edge.id = this.id;
                    edge.page={ pageURL: page.pageURL }
                    this.id++;
                });
                
                var credibility_upArrow='black';
                var credibility_downArrow='black';
                var educational_upArrow='black';
                var educational_downArrow='black';

                if (page.rankings)
                    page.rankings.forEach(ranking => {
                        if (ranking.rank_type == "credibility")
                        {
                        if (ranking.rank_code == 1)
                            credibility_upArrow = 'green'
                        else
                            credibility_downArrow = 'red'
                        }

                        if (ranking.rank_type == "educational")
                        {
                        if (ranking.rank_code == 1)
                            educational_upArrow = 'green'
                        else
                            educational_downArrow = 'red'
                        }
                    });

                var liked_bar_style=make_bar_style(
                page.liked_positive_points,
                page.liked_negative_points,
                )
                var credibility_bar_style=make_bar_style(
                page.credibility_positive_points,
                page.credibility_negative_points,
                )
                var educational_bar_style=make_bar_style(
                page.educational_positive_points,
                page.educational_negative_points,
                )
                var domain_liked_bar_style=make_bar_style(
                page.domain.liked_positive_points,
                page.domain.liked_negative_points,
                )
                var domain_credibility_bar_style=make_bar_style(
                page.domain.credibility_positive_points,
                page.domain.credibility_negative_points,
                )
                var domain_educational_bar_style=make_bar_style(
                page.domain.educational_positive_points,
                page.domain.educational_negative_points,
                )
                page.credibility_upArrowColor= credibility_upArrow;
                page.credibility_downArrowColor= credibility_downArrow;
                page.educational_upArrowColor= educational_upArrow;
                page.educational_downArrowColor= educational_downArrow;
                page.rank_error= "";
                page.domain_liked_positive_points= page.domain.liked_positive_points;
                page.domain_credibility_positive_points= page.domain.credibility_positive_points;
                page.domain_educational_positive_points= page.domain.educational_positive_points;
                page.domain_liked_negative_points= page.domain.liked_negative_points;
                page.domain_credibility_negative_points= page.domain.credibility_negative_points;
                page.domain_educational_negative_points= page.domain.educational_negative_points;
                page.liked_bar_style= liked_bar_style;
                page.credibility_bar_style= credibility_bar_style;
                page.educational_bar_style= educational_bar_style;
                page.domain_liked_bar_style= domain_liked_bar_style;
                page.domain_credibility_bar_style= domain_credibility_bar_style;
                page.domain_educational_bar_style= domain_educational_bar_style
                this['last_ranking_timeStamp_credibility'] = null;
                this['last_ranking_id_credibility'] = null;
                this['last_ranking_timeStamp_educational'] = null;
                this['last_ranking_id_educational'] = null;
                page.data_for_comments={
                    object_id: page._id,
                    object_collection_name: 'pages',
                    number_of_comments: page.number_of_comments
                }
                page.page_loading=false;
                this.setState(page);
            }).catch((error) => {
                console.log(error);
            });
      }
    render() {
        
      return (
        <div className='page_page'>
            <div className="Page" style={{ backgroundColor:'#0587c3'}}>
                <h1 style={{fontSize:'10', textAlign: 'center', color: 'white', padding: '10px'}}>
                פרטים על הדף</h1>
                
            </div>
            <div>
                <h3 id="page_headLine">{this.state.pageURL}</h3>
                <div hidden={this.state.page_loading}>
                    <text>{this.state.pageSnap}</text>
                    <br/>
                    <text>ניקוד הדף:</text><br/>
                    <table>
                        <tr>
                        <td align='left'>
                            ({round(this.state.liked_negative_points)})
                            <FontAwesomeIcon icon={faCircle} color='black'/>
                        </td>
                        <td className='progress_bar_td'>
                            <ProgressBar
                            variant={this.state.liked_bar_style[1]}
                            now={this.state.liked_bar_style[0]} />
                        </td>
                        <td align='right'>
                            <FontAwesomeIcon icon={faCircle} color='black'/>
                            ({round(this.state.liked_positive_points)})
                            <FontAwesomeIcon icon={faHeart}/>
                        </td>
                        </tr>
                        <tr>
                        <td align='left'>
                        ({round(this.state.credibility_negative_points)}) 
                        <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.credibility_downArrowColor} onClick={() => this.rank_click_down("credibility")}/>
                        </td>
                        <td>
                        <ProgressBar
                            variant={this.state.credibility_bar_style[1]}
                            now={this.state.credibility_bar_style[0]} />
                        </td>
                        
                        <td align='right'>
                        <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.credibility_upArrowColor} onClick={() => this.rank_click_up("credibility")}/> 
                        ({round(this.state.credibility_positive_points)}) 
                        <FontAwesomeIcon icon={faSearch}/>
                        </td>
                        </tr>
                        <tr>
                        <td align='left'>
                        ({round(this.state.educational_negative_points)}) 
                        <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.educational_downArrowColor} onClick={() => this.rank_click_down("educational")}/>
                        </td>
                        <td>
                        <ProgressBar
                            variant={this.state.educational_bar_style[1]}
                            now={this.state.educational_bar_style[0]} />
                        </td>
                        
                        <td align='right'>
                        <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.educational_upArrowColor} onClick={() => this.rank_click_up("educational")}/> 
                        ({round(this.state.educational_positive_points)})
                        <FontAwesomeIcon icon={faBook}/>
                        </td>
                        </tr>
                        </table>

                        <table>
                        <tr>
                        <td align='left'>({round(this.state.domain_liked_negative_points)})</td>
                        <td className='progress_bar_domain_td'>
                        <ProgressBar
                            variant={this.state.domain_liked_bar_style[1]}
                            now={this.state.domain_liked_bar_style[0]} />
                        </td>
                        <td align='right'>
                            ({round(this.state.domain_liked_positive_points)})
                            <FontAwesomeIcon icon={faGlobe}/>
                            <small><FontAwesomeIcon icon={faHeart}/></small>
                        </td>
                        </tr>
                        
                        <tr>
                        <td align='left'>({round(this.state.domain_credibility_negative_points)})</td>
                        <td>
                        <ProgressBar
                            variant={this.state.domain_credibility_bar_style[1]}
                            now={this.state.domain_credibility_bar_style[0]} />
                        </td>
                        <td align='right'>
                            ({round(this.state.domain_credibility_positive_points)})
                            <FontAwesomeIcon icon={faGlobe}/>
                            <small><FontAwesomeIcon icon={faSearch}/></small>
                        </td>
                        </tr>
                        <tr>
                        <td align='left'>({round(this.state.domain_educational_negative_points)})</td>
                        <td>
                        <ProgressBar
                            variant={this.state.domain_educational_bar_style[1]}
                            now={this.state.domain_educational_bar_style[0]} />
                        </td>
                        <td align='right'>
                            ({round(this.state.domain_educational_positive_points)})
                            <FontAwesomeIcon icon={faGlobe}/>
                            <small><FontAwesomeIcon icon={faBook}/></small>
                        </td>
                        </tr>
                    </table>
                    <br/>
                    <Comments_loader data_for_comments={this.state.data_for_comments}/> 
                    <Connected_topics_edges_component connected_topics_edges={this.state.page_topic_edges}/>
                </div>
            </div>
        </div>
      ); 
    }
    rank_click_up(rank_type)
    {
      page_rank_function(this, rank_type, "up");
    }
    rank_click_down(rank_type)
    {
      page_rank_function(this, rank_type, "down");
    }
}

  export default Page_page;