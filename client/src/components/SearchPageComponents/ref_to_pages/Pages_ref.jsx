import React, { Component } from 'react';
import Pages_ref_mapper from './Pages_ref_mapper';
import PropsTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faHeart} from '@fortawesome/free-regular-svg-icons';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {faBook} from '@fortawesome/free-solid-svg-icons';
import {faGlobe} from '@fortawesome/free-solid-svg-icons';
class Pages_refs extends Component {
    render() {
        if (this.props.pages_ref.length > 0)
            return(
                <div>
                <div style={{"text-align": "right"}}>
                    <span className="field-tip">
                        <FontAwesomeIcon icon={faHeart}/>*
                        <span className="tip-content">
                            ניקוד להאם אהבתם את תוכן הדף (יישמר בהקשר לחיפוש)
                        </span>
                    </span>&nbsp;
                    <span className="field-tip">
                        <FontAwesomeIcon icon={faSearch}/>*
                        <span className="tip-content">
                        אמינות התוכן בדף:
                        <br/>
                        •	עד כמה השפה ואוצר המילים ברמה גבוהה ומקצועית?
                        <br/>
                        <br/>
                        •	כמה פרסומות קיימות בדף? באתרים המרוויחים כסף מפרסום קיים סיכוי גבוהה יותר, של גורמים חיצוניים, לממן כתבות ו/או להשפיע על תוכן האתר.
                        <br/>
                        <br/>
                        •	מי כתב את הדף? האם יש לו מניעה מסוים שיכול להשפיע על שיקול דעתו?
                        מהו מקור הידע שלו?
                        <br/>
                        <br/>
                        <br/>
                        לאחר ששאלתם שאלות אלו: אם אתם ברושם שהדף אמין, סמנו אותו ככזה. אם נתקלתם באחד או מספר דברים לא תקינים, סמנו אותו כלא אמין. אם אינכם בטוחים, השאירו אותו במצב הקיים.
                        </span>
                    </span>&nbsp;
                    <span className="field-tip">
                        <FontAwesomeIcon icon={faBook}/>*
                        <span className="tip-content">
                            ניקוד להאם הדף מכיל תוכן לימודי
                        </span>
                    </span>&nbsp;
                    <span className="field-tip">
                        <FontAwesomeIcon icon={faGlobe}/>*
                        <span className="tip-content">
                            ניקוד מצטבר מכלל הדפים באתר
                        </span>
                    </span>
                </div>
                <div>
                    <Pages_ref_mapper pages_ref={this.props.pages_ref}/>
                </div>
                </div>
            );
        else
            return(
                <div>
                    <Pages_ref_mapper pages_ref={this.props.pages_ref}/>
                </div>
            );
    }
}
Pages_refs.PropsTypes={
    pages_refs: PropsTypes.array.isRequired
} 
  export default Pages_refs;