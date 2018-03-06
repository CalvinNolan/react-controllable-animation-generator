import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gifFrames from 'gif-frames';

const emptyFunction = () => {};

class AnimationForm extends Component {
  constructor(props) {
    super(props);
    this.handleAnimationSubmission = this.handleAnimationSubmission.bind(this);
    this.onAnimationNameChange = this.onAnimationNameChange.bind(this);
    this.onAnimationFileChange = this.onAnimationFileChange.bind(this);
    this.onAnimationClimaxChange = this.onAnimationClimaxChange.bind(this);

    this.state = {
      animationName: props.existingData.animation,
      nameError: '',
      animationFile: props.existingData.spritesheetBlob,
      fileError: '',
      animationClimax: props.existingData.climax
    };
  }

  onAnimationNameChange(e) {
    this.setState({
      animationName: e.target.value,
      nameError: ''
    });
  }

  onAnimationFileChange(e) {
    this.setState({
      animationFile: e.target.files[0],
      fileError: ''
    });
  }

  onAnimationClimaxChange(e) {
    this.setState({
      animationClimax: e.target.value
    });
  }

  allValidInputs() {
    const { animationData, existingData } = this.props;
    const { animationName, animationFile } = this.state;
    let hasError = false;

    if (animationName === '') {
      this.setState({
        nameError: "Animation name cannot be empty"
      });
      hasError = true;
    }

    const existingAnimations = Object.keys(animationData);
    const nameHasChanged = ((animationName !== existingData.animation) || (existingData.animation === ''))
    const isNameExisting = (existingAnimations.indexOf(animationName) > -1) && nameHasChanged;
    if (isNameExisting) {
      this.setState({
        nameError: "An animation of this name already exists"
      });
      hasError = true;
    }

    if (animationFile === undefined) {
      this.setState({
        fileError: "You must select a gif file"
      });
      hasError = true;
    }

    return !hasError;
  }

  handleAnimationSubmission(evt) {
    evt.preventDefault();

    if (!this.allValidInputs()) {
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      gifFrames({ 
        url: e.target.result, 
        frames: 'all', 
        outputType: 'canvas',
      }).then(frameData => {
        const image = frameData[0].getImage();
        
        // Set up canvas element;
        var c = document.createElement('canvas');
        c.width = frameData.length * image.width;
        c.height = image.height;

        frameData.forEach(frame => {
          var ctx = c.getContext('2d');
          ctx.drawImage(frame.getImage(), frame.frameIndex * image.width, 0);
        });

        const { animationName, animationClimax, animationFile } = this.state;
        const { existingData } = this.props;
        const resultPayload = {
          spritesheet: c,
          spritesheetBlob: animationFile,
          frameWidth: image.width,
          frameHeight: image.height,
          frames: frameData.length,
          animation: animationName,
          climax: animationClimax > frameData.length ? -1 : animationClimax
        }
        this.props.onAnimationDataReady(resultPayload, existingData.animation)
      });
    }.bind(this);

    reader.readAsDataURL(this.state.animationFile);
  }

  renderFileInputName() {
    const { animationFile } = this.state;
    if (animationFile === undefined) {
      return(<p>No file selected</p>);
    }
    return(<p>{animationFile.name}</p>);
  }

  renderRemoveButton() {
    const { existingData, removeAnimation } = this.props;
    return (
      <p className="formRemove" onClick={() => removeAnimation(existingData.animation)}>Delete Animation</p>
    );
  }

  render() {
    const { nameError, fileError } = this.state;
    const hasNameError = nameError !== '';
    const hasFileError = fileError !== '';
    return (
      <div className="animationForm">
        <form onSubmit={this.handleAnimationSubmission}>
          { !this.props.newAnimation && this.renderRemoveButton() }
          <div className="formInput">
            <p className="formLabel">Animation Name</p>
            <input 
              className={hasNameError ? 'formInputError' : ''} 
              type="text" 
              onChange={this.onAnimationNameChange} 
              placeholder={"Animation Name"} 
              value={this.state.animationName} 
            />
            { hasNameError && <p className='inputErrorDescription'>{nameError}</p>}
          </div>
          <div className="fileFormInput">
            <p className="formLabel">File</p>
            <input type="file" id="selectedFile" style={{display: 'none'}} onChange={this.onAnimationFileChange} />
            <div className="fileInputButton">
              <input  className={hasFileError ? 'formInputError' : ''} type="button" value="Choose file" onClick={() => document.getElementById('selectedFile').click()} />
              {this.renderFileInputName()}
            </div>
            { hasFileError && <p className='inputErrorDescription'>{fileError}</p>}
          </div>
          <div className="formInput">
            <p className="formLabel">Climax Frame</p>
            <p className="formSublabel">Optional</p>
            <input type="number" onChange={this.onAnimationClimaxChange} placeholder={"0"} value={this.state.animationClimax} />
          </div>
          <div className="formButtons">
            <input className="formSubmit" type="submit" value={this.props.newAnimation ? "Create" : "Update"} />
            <p className="formCancel" onClick={this.props.cancelForm}>Cancel</p>
          </div>
        </form>
      </div>
    );
  }
}

AnimationForm.propTypes = {
  onAnimationDataReady: PropTypes.func.isRequired,
  animationData: PropTypes.object.isRequired,
  removeAnimation: PropTypes.func,
  cancelForm: PropTypes.func.isRequired,
  newAnimation: PropTypes.bool,
  existingData: PropTypes.object,
}

AnimationForm.defaultProps = {
  newAnimation: false,
  removeAnimation: emptyFunction,
  existingData: {
    animation: '',
    climax: '',
    spritesheetBlob: undefined
  }
}

export default AnimationForm;
