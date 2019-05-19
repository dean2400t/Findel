import React, { Component } from 'react';
import axios from 'axios';
import Domains_component from './Domains_component';

class DomainsPage extends Component {
    constructor(props) {
        super(props);
        var domains=[];
        this.state = {
            domains:domains
        };
        this.id=1;
        axios.get("/api/present_data/domains")
          .then((result) => {
              // Get the result
              // If we want text, call result.text()
              return result.data;
          }).then((domains) => {
              // Do something with the result
              domains.sort((domain_a, domain_b) => {return domain_b.score-domain_a.score;})
              domains.forEach(domain => {
                domain.id=this.id;
                domain.sites=[];
                domain.request_sites_of_domain_function= () => this.request_sites_of_domain(domain._id);
                domain.is_more_sites_button_hidden=false;
                this.id++;
              });
              this.setDomains(domains)
          }).catch((error) => {
              console.log(error);
              var domains=[];
              this.setDomains(domains)
          });
          
        
      }
    setDomains(domains)
    {
      this.setState({
        domains:domains
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
        </div>
      );
          
    }
    request_sites_of_domain = (domain_id) =>
    {
      axios.get("/api/present_data/domain_sites/?id="+domain_id)
          .then((result) => {
              // Get the result
              // If we want text, call result.text()
              return result.data;
          }).then((domain) => {
              // Do something with the result
                domain.sites.forEach(site => {
                  site.id=this.id;
                  this.id++;
                });
              var domains=this.state.domains;
              for (var index=0; index<domains.length; index++)
                if (domains[index]._id == domain._id)
                {
                    domains[index].sites=domain.sites;
                    domains[index].is_more_sites_button_hidden=true;
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