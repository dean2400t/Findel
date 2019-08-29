import React, { Component } from 'react';
import axios from 'axios';
import PropsTypes from 'prop-types';
import Comments from './Comments'; 
import arrange_comments from './arrange_comments';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

class Comments_loader extends Component {
  constructor(props) {
    super(props);
    this.state={
      are_comments_loaded: false,
      comments: []
    }
    this.token=cookies.get('findel-auth-token') || "";
  }
  render() {
      var load_comments_text_style={cursor: 'pointer'};
      return (
        <div>
          <div hidden={this.state.are_comments_loaded}>
              <text onClick= {() => this.load_comments_text_clicked()} style={load_comments_text_style}>
                תגובות+ ({this.props.data_for_comments.number_of_comments})
              </text>
          </div>
          <div hidden={!this.state.are_comments_loaded}>
              <Comments comments={this.state.comments} parrent_object_data={{
                  object_id: this.props.data_for_comments.object_id,
                  object_id_collection_name: this.props.data_for_comments.object_id_collection_name,
                  root_comment_id: null,
                  parrent_comments_array: null
                  }
                }/>
          </div>
        </div>
      );
    }
    load_comments_text_clicked()
    {
        var opts={
          object_id: this.props.data_for_comments.object_id,
          object_id_collection_name: this.props.data_for_comments.object_id_collection_name
        }
        axios.get("/api/comments/retrieve_comments/?object_id="+opts.object_id+"&object_id_collection_name="+opts.object_id_collection_name, {
            headers: {'findel-auth-token': this.token}
        })
            .then((result) => {
                return result.data;
            })
            .then((comments) =>
            {
                comments = arrange_comments(comments);
                this.setState({
                    comments: comments,
                    are_comments_loaded: true
                })
                    
            })
            .catch((error) => {
                console.log(error.message);
            });
    }
}
Comments.PropsTypes={
  comments: PropsTypes.array.isRequired
}  
export default Comments_loader;