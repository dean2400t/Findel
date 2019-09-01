import React, { Component } from 'react';
import axios from 'axios';
import './add_comment.css';
import Cookies from 'universal-cookie';
import Comments_Array_mapper from './Comments_Array_mapper';
const cookies = new Cookies();

class Add_comment extends Component {
    constructor(props) {
        super(props);
        this.token=cookies.get('findel-auth-token') || "";
        this.state ={
            comment_text: '',
            comments_added: []
        }
      }
    render() {
        return (
            <div className="Add_comment">
                <Comments_Array_mapper comments={this.state.comments_added}/>
                <textarea value={this.state.comment_text}
                id='comment_textArea'
                rows={6}
                cols={50}
                placeholder="רשום שאלה/תשובה/תגובה כאן..." 
                onChange={evt => this.comment_text_change(evt)}/><br/>
                <button onClick={() => this.send_comment_to_server()}>הכנס תגובה</button>
                <br/>
                <text>{this.state.server_message}</text>
            </div>
        );
    }
    comment_text_change(evt)
    {
        this.setState(
            {
                comment_text: evt.target.value
            }
        );
    }

    send_comment_to_server()
    {
        var opts={
            text: this.state.comment_text,
            object_id: this.props.parrent_object_data.object_id,
            object_collection_name: this.props.parrent_object_data.object_collection_name,
            root_comment_id: this.props.parrent_object_data.root_comment_id
          };
        axios.post('/api/comments/add_comment', opts, {
        headers: {'findel-auth-token': this.token}}
            ).then(response => {
                response.data.collection_name=response.data.object_collection_name;
                response.data.id=response.data._id;
                response.data.sub_comments=[];
                var comments_added= this.state.comments_added;
                comments_added.push(response.data);
                this.setState({
                    server_message: "הוכנס בהצלחה",
                    comments_added: comments_added
                });
            }).catch(error=> {
                if (error.response==undefined)
                this.setState({server_message: "אין חיבור לשרת"});
                else
                this.setState({server_message: error.response.data});
        });
    }
}

  export default Add_comment;