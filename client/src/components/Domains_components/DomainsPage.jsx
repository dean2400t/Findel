import React, { Component } from 'react';
import axios from 'axios';
import Domains_component from './Domains_component';
import List_for_googleAPI_component from './List_for_googleAPI_component';

class DomainsPage extends Component {
    constructor(props) {
        super(props);
        var domains=[];
        this.state = {
            domains:domains,
            not_educational_or_credibal_domains: [],
            all_positive_domains: []
        };
        this.id=1;
        axios.get("/api/present_data/domains")
          .then((result) => {
              return result.data;
          }).then((domains) => {
              domains.sort((domain_a, domain_b) => {return domain_b.educational_positive_points-domain_a.educational_positive_points;});
              domains.sort((domain_a, domain_b) => {return domain_b.credibilityֹ_positive_points-domain_a.credibilityֹ_positive_points;});
              domains.sort((domain_a, domain_b) => {return domain_b.likedֹ_positive_points-domain_a.likedֹ_positive_points;});
              var not_educational_or_credibal_domains = [];
              var all_positive_domains = [];
              domains.forEach(domain => {
                domain.id=this.id;
                domain.pages=[];
                domain.request_pages_of_domain_function= () => this.request_pages_of_domain(domain._id);
                domain.is_more_pages_button_hidden=false;
                this.id++;
                if (domain.educational_positive_points - domain.educational_negative_points >= 1 &&
                    domain.credibility_positive_points - domain.credibility_negative_points >= 1 &&
                    domain.likedֹ_positive_points - domain.likedֹ_negative_points >= 1)
                    all_positive_domains.push(domain);
                if (domain.credibility_positive_points - domain.credibility_negative_points < 0 ||
                    domain.educational_positive_points - domain.educational_negative_points < 0)
                    not_educational_or_credibal_domains.push(domain);
              });
              this.setState({
                domains:domains,
                not_educational_or_credibal_domains: not_educational_or_credibal_domains,
                all_positive_domains: all_positive_domains
              });
          }).catch((error) => {
              console.log(error);
              this.setState({
                domains:[],
                not_educational_or_credibal_domains: [],
                all_positive_domains: []
              });
          });
      }
    render() {
        
      return (
        <div>
            <div className="Domains" style={{ backgroundColor:'#0587c3'}}>
            <h1 style={{fontSize:'10', textAlign: 'center', color: 'white'}}>
            דומיינים</h1>
        </div>
        <div>
            <Domains_component domains={this.state.domains}/>
        </div>
        <div style={{"text-align": "right"}}>
            <br/><br/>
            <text>דומיינים טובים:</text>
            <List_for_googleAPI_component domains_list={this.state.all_positive_domains}/>
            <br/><br/><br/>
            <text>דומיינים לא חינוכיים או לא אמינים:</text>
            <List_for_googleAPI_component domains_list={this.state.not_educational_or_credibal_domains}/>
        </div>
        </div>
      );
          
    }
    request_pages_of_domain = (domain_id) =>
    {
      axios.get("/api/present_data/domain_pages/?id="+domain_id)
          .then((result) => {
              // Get the result
              // If we want text, call result.text()
              return result.data;
          }).then((domain) => {
              // Do something with the result
                domain.pages.forEach(page => {
                  page.id=this.id;
                  this.id++;
                });
              var domains=this.state.domains;
              for (var index=0; index<domains.length; index++)
                if (domains[index]._id == domain._id)
                {
                    domains[index].pages=domain.pages;
                    domains[index].is_more_pages_button_hidden=true;
                    break;
                }
              this.setState({
                domains: domains
              });
          }).catch((error) => {
              console.log(error);
              var domains=[];
              this.setState({
                domains: domains
              });
          });
    }
}

  export default DomainsPage;