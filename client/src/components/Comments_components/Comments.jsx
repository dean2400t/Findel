import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import Add_comment from './add_comment';
import Comments_Array_mapper from './Comments_Array_mapper'; 

class Comments extends Component {
  constructor(props) {
    super(props);
    this.state={
      are_comments_hidden: false,
      show_hide_instruction: "-הצג תגובות"
    }
  }
  render() {
      var show_hide_comments_text_style={cursor: 'pointer'};
      return (
        <div>
          <div>
              <text onClick= {() => this.show_hide_comments_text_clicked()} style={show_hide_comments_text_style}>
              {this.state.show_hide_instruction}
              </text>
          </div>
          <div hidden={this.state.are_comments_hidden}>
              <Comments_Array_mapper comments={this.props.comments}/>
              <br/>
              <text>אוסף תגובה ראשית חדשה</text>
              <Add_comment parrent_object_data={this.props.parrent_object_data}/>
          </div>
        </div>
      );
    }
    show_hide_comments_text_clicked()
    {
      if (this.state.are_comments_hidden)
        this.setState({
          are_comments_hidden: false,
          show_hide_instruction: "-הסתר תגובות"
        });
      else
        this.setState({
          are_comments_hidden: true,
          show_hide_instruction: "+הצג תגובות"
        });
    }
}
Comments.PropsTypes={
  comments: PropsTypes.array.isRequired
}  
export default Comments;