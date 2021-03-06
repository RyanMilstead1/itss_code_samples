import React, { PropTypes } from 'react';
import { connect }          from 'react-redux';
import { OverlayTrigger, Popover }      from 'react-bootstrap';
import * as ActivityActions from '../../actions/ActivityActions';
import * as UserActions     from '../../actions/UserActions';
import CompositionResponse  from '../../models/responses/CompositionResponse';

class CompositionActivity extends React.Component {
  static propTypes = {
    activity: PropTypes.any.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      response: new CompositionResponse(props.activity)
    };
  }

  componentWillReceiveProps(nextProps) {
    // Reset response if activity is different
    if(this.props.activity.id !== nextProps.activity.id) {
      this.setState({ response: new CompositionResponse(nextProps.activity) });
    }
  }

  render() {
    const { activity, responseDisabled, user } = this.props;
    if(activity.type != "CompositionActivity") {return(<div />);}
    let is_disabled = user.preferred_language != "en";

    if(!activity.questions) { return (<div/>); }

    let questions = activity.questions.map((question, key) => {
      return (
        <div key={key}>
          <div className="act-response__question">
            { question.content }
          </div>
          <div className="act-response__response">
            <textarea rows="5" className="form-input"
              placeholder="Write your answer here."
              disabled={is_disabled}
              onChange={(e) => this.handleAnswerChange(e, key)} value={this.state.response.answers[key].content || ""}/>
          </div>
        </div>
      );
    });

    let submitButton = () => {
      let popover = (<Popover id="popover-positioned-top" className="es-continue-button-popover">Las preguntas son contestadas solamente en las páginas en inglés.</Popover>);
      let submitText = "Submit";
      if(user.preferred_language == "es") {
        submitText = "Inglés";
        return (
          <OverlayTrigger trigger={['hover', 'focus']}
            placement="top" overlay={popover}>
            <button disabled={responseDisabled}
              className="act-response__submit-btn o-btn-action"
              onClick={() => this.handleSubmit()}>
              {submitText}
            </button>
          </OverlayTrigger>
        );
      } else {
        return (
          <button disabled={responseDisabled}
            className="act-response__submit-btn o-btn-action"
            onClick={() => this.handleSubmit()}>
            {submitText}
          </button>
        );
      }
    };

    return (
      <div className="act-response act-response--composition">
        <div className="act-response__submission">
          {this.props.alertUI()}
          <p className="act-response__instructions">
            Use the text areas below to compose your response.
          </p>
          {questions}
        </div>
        {submitButton()}
      </div>
    );
  }

  handleAnswerChange(e, index) {
    let response = this.state.response;
    response.answers[index].content = e.target.value;
    this.setState({ response: response });
  }

  handleSubmit() {
    const { response } = this.state;
    const { user, activity, dispatch } = this.props;
    let monologueCount = activity.monologues.length;

    if(user.preferred_language != "en" && monologueCount !== 0){
      dispatch(ActivityActions.setNextInstruction(false));
      dispatch(UserActions.setMonologueReplay({replay:true, language:"en"}));
    } else if(user.preferred_language != "en" && monologueCount === 0) {
      dispatch(UserActions.setPreferredLanguage("en"));
    } else if(response.isValid()) {
      this.props.onSubmit(response);
    } else {
      let message = 'Please provide an answer in each field.';
      dispatch(ActivityActions.showAlert(message));
    }
  }
}

function select(state) {
  return state;
}

export default connect(select)(CompositionActivity);
