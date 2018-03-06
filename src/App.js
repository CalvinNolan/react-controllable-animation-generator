import React, { Component } from 'react';
import AnimationGenerator from './components/AnimationGenerator';
import AnimationSidebar from './components/AnimationSidebar';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.onAnimationFormSubmit = this.onAnimationFormSubmit.bind(this);
    this.onAnimationRemove = this.onAnimationRemove.bind(this);
    this.onControllableAnimationNameChange = this.onControllableAnimationNameChange.bind(this);
    this.onDefaultFrameChange = this.onDefaultFrameChange.bind(this);
    this.allValidInputs = this.allValidInputs.bind(this);

    this.state = {
      animationData: {},
      controllableAnimationName: '',
      controllableNameError: '',
      controllableAnimationDefaultFrame: '',
      controllableDefaultFrameError: ''
    };
  }

  allValidInputs() {
    const { controllableAnimationName, controllableAnimationDefaultFrame } = this.state;
    if (controllableAnimationName === '') {
      this.setState({
        controllableNameError: "Controllable animation name cannot be empty"
      });
    }

    if (controllableAnimationDefaultFrame === '') {
      this.setState({
        controllableDefaultFrameError: "Default frame cannot be empty"
      });
    } else if (controllableAnimationDefaultFrame < 1) {
      this.setState({
        controllableDefaultFrameError: "Default frame must be set above 0"
      });
    }

    return (controllableAnimationName !== '' && controllableAnimationDefaultFrame !== '' && controllableAnimationDefaultFrame > 0);
  }

  onControllableAnimationNameChange(e) {
    this.setState({
      controllableAnimationName: e.target.value,
      controllableNameError: ''
    });
  }

  onDefaultFrameChange(e) {
    const value = e.target.value;
    this.setState({
      controllableAnimationDefaultFrame: value === "" ? value : parseInt(value, 10),
      controllableDefaultFrameError: ''
    });
  }

  onAnimationFormSubmit(newAnimation, existingAnimation) {
    if (existingAnimation !== '') {
      this.onAnimationRemove(existingAnimation);
    }

    const updatedData = this.state.animationData;
    updatedData[newAnimation.animation] = newAnimation;
    this.setState({
      animationData: updatedData
    });
  }

  onAnimationRemove(animationName) {
    const { animationData } = this.state;
    const animationKeys = Object.keys(animationData);

    const newAnimationData = animationKeys.reduce((animData, key) => {
      if (key === animationName) {
        return animData;
      }
      animData[key] = animationData[key];
      return animData;
    }, {})
    this.setState({
      animationData: newAnimationData
    });
  }

  render() {
    const { controllableAnimationName, controllableAnimationDefaultFrame, controllableNameError, controllableDefaultFrameError } = this.state;
    return (
      <div className="App">
        <AnimationGenerator 
          animationData={this.state.animationData}
          validateControllableInputs={this.allValidInputs}
          hasControllableInputError={controllableNameError !== "" || controllableDefaultFrameError !== ""}
          controllableAnimationName={controllableAnimationName}
          defaultFrame={controllableAnimationDefaultFrame === '' ? 0 : controllableAnimationDefaultFrame}
        />
        <AnimationSidebar 
          animationData={this.state.animationData} 
          onAnimationDataReady={this.onAnimationFormSubmit} 
          onAnimationRemove={this.onAnimationRemove}
          onControllableAnimationNameChange={this.onControllableAnimationNameChange}
          onDefaultFrameChange={this.onDefaultFrameChange}
          controllableNameError={this.state.controllableNameError}
          controllableAnimationDefaultFrame={this.state.controllableAnimationDefaultFrame}
          controllableDefaultFrameError={this.state.controllableDefaultFrameError}
          controllableAnimationName={this.state.controllableAnimationName}
        />
      </div>
    );
  }
}

export default App;
