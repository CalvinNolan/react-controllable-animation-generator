import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AnimationForm from './AnimationForm';
import SidebarItem from './SidebarItem';

const emptyFunction = () => {};

class AnimationSidebar extends Component {
  constructor(props) {
    super(props);
    this.openNewTab = this.openNewTab.bind(this);
    this.closeExpandedItem = this.closeExpandedItem.bind(this);
    this.onAnimationSubmit = this.onAnimationSubmit.bind(this);
    this.onAnimationRemove = this.onAnimationRemove.bind(this);

    this.state = {
      selectedItem: '',
      selectedNew: true
    };
  }

  openTab(animation) {
    return () => {
      this.setState({
        selectedItem: animation
      });
    }
  }

  openNewTab() {
    this.setState({
      selectedNew: true
    });
  }

  closeExpandedItem() {
    this.setState({
      selectedNew: false,
      selectedItem: ''
    });
  }

  renderItems() {
    const { selectedItem, selectedNew } = this.state;
    if (selectedNew) {
      return (
        <SidebarItem title={"+ Add New"} onClick={emptyFunction} className="newItem selected" />
      );
    } else if (selectedItem !== '') {
      return (
        <SidebarItem title={selectedItem} onClick={emptyFunction} className="selected" />
      );
    }

    const { animationData } = this.props;
    const animations = Object.keys(animationData);
    return (
      <div className="outerSidebarItems">
        <div className="innerSidebarItems">
          <SidebarItem title={"+ Add New"} onClick={this.openNewTab} className="newItem" />
          {
            animations.map(animation => {
              return (
                <SidebarItem key={animation} title={animation} onClick={this.openTab(animation)} />
              );
            })
          }
        </div>
      </div>
    );
  }

  onAnimationSubmit(newAnimation, existingAnimation) {
    this.props.onAnimationDataReady(newAnimation, existingAnimation);
    this.closeExpandedItem();
  }

  onAnimationRemove(animationName) {
    this.props.onAnimationRemove(animationName);
    this.closeExpandedItem();
  }

  renderExpandedItem() {
    const { selectedItem, selectedNew } = this.state;
    const { animationData } = this.props;
    if (selectedNew) {
      return (
        <div className="expanedItem">
          <AnimationForm 
            onAnimationDataReady={this.onAnimationSubmit}
            newAnimation={true} 
            animationData={animationData}
            cancelForm={this.closeExpandedItem} 
          />
        </div>
      );
    }

    return (
      <div  className="expanedItem">
        <AnimationForm 
          onAnimationDataReady={this.onAnimationSubmit} 
          removeAnimation={this.onAnimationRemove}
          newAnimation={false}
          animationData={animationData}
          existingData={animationData[selectedItem]}
          cancelForm={this.closeExpandedItem}
        />
      </div>
    );
  }

  render() {
    const { selectedItem, selectedNew } = this.state;
    const { 
      controllableAnimationName, 
      controllableAnimationDefaultFrame, 
      controllableNameError, 
      controllableDefaultFrameError, 
      onControllableAnimationNameChange, 
      onDefaultFrameChange 
    } = this.props;
    const hasAnimationNameError = controllableNameError !== '';
    const hasDefaultFrameError = controllableDefaultFrameError !== '';
    return (
      <div className="animationSidebar">
        <div className="animationOverallForm">
          <div className="controllableAnimationNameInput">
            <h3>Controllable Animation Title</h3>
            <div>
              <input
                type="text" 
                className={hasAnimationNameError ? 'formInputError' : ''} 
                onChange={onControllableAnimationNameChange} 
                placeholder={"Controllable Animation Title"} 
                value={controllableAnimationName} 
              />
              { hasAnimationNameError && <p className='inputErrorDescription'>{controllableNameError}</p> }
            </div>
          </div>
          <div className="controllableAnimationDefaultFrameInput">
            <h3>Default Frame</h3>
            <div>
              <input
                type="number"
                className={hasDefaultFrameError ? 'formInputError' : ''} 
                onChange={onDefaultFrameChange} 
                placeholder="Default Frame Number" 
                value={controllableAnimationDefaultFrame} 
              />
              { hasDefaultFrameError && <p className='inputErrorDescription'>{controllableDefaultFrameError}</p> }
            </div>
          </div>
        </div>
        {this.renderItems()}
        { (selectedItem !== '' || selectedNew) && this.renderExpandedItem() }
      </div>
    );
  }
}

AnimationSidebar.propTypes = {
  animationData: PropTypes.object.isRequired,
  onAnimationDataReady: PropTypes.func.isRequired,
  onAnimationRemove: PropTypes.func.isRequired,
  onControllableAnimationNameChange: PropTypes.func.isRequired,
  onDefaultFrameChange: PropTypes.func.isRequired,
  controllableNameError: PropTypes.string.isRequired,
  controllableAnimationDefaultFrame: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  controllableDefaultFrameError: PropTypes.string.isRequired,
  controllableAnimationName: PropTypes.string.isRequired
}

export default AnimationSidebar;
