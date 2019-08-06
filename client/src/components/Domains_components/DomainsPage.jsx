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
              // Get the result
              // If we want text, call result.text()
              return result.data;
          }).then((domains) => {
              // Do something with the result


              domains.sort((domain_a, domain_b) => {return domain_b.educational_weight-domain_a.educational_weight;});
              domains.sort((domain_a, domain_b) => {return domain_b.credibility_weight-domain_a.credibility_weight;});
              domains.sort((domain_a, domain_b) => {return domain_b.liked_weight-domain_a.liked_weight;});
              var not_educational_or_credibal_domains = [];
              var all_positive_domains = [];
              domains.forEach(domain => {
                domain.id=this.id;
                domain.pages=[];
                domain.request_pages_of_domain_function= () => this.request_pages_of_domain(domain._id);
                domain.is_more_pages_button_hidden=false;
                this.id++;
                if (domain.educational_weight >= 2 &&
                    domain.credibility_weight >= 2 &&
                    domain.liked_weight >= 2)
                    all_positive_domains.push(domain);
                if (domain.credibility_weight < 1 ||
                    domain.educational_weight < 1)
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
              this.setDomains(domains)
          }).catch((error) => {
              console.log(error);
              var domains=[];
              this.setDomains(domains)
          });
    }
}

  export default DomainsPage;