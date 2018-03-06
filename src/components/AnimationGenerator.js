import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AnimationGenerator extends Component {
  constructor(props) {
    super(props);
    this.downloadSpritesheet = this.downloadSpritesheet.bind(this);
    this.downloadDescription = this.downloadDescription.bind(this);
    this.openTrueSizeTab = this.openTrueSizeTab.bind(this);

    this.state = {
      spritesheetReady: false,
      selectedView: "spritesheet",
      spritesheetBackgroundColor: "white"
    };
  }

  componentWillReceiveProps(nextProps) { 
    this.setState({
      spritesheetReady: false
    });
    this.renderSpritesheet(nextProps.animationData);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedView !== "spritesheet" && this.state.selectedView === "spritesheet") {
      this.renderSpritesheet(this.props.animationData);
    }
  }

  componentDidMount() {
    this.renderSpritesheet(this.props.animationData);
  }

  changeView(newView) {
    this.setState({
      selectedView: newView
    });
  }

  changeSpritesheetBackground(newColor) {
    this.setState({
      spritesheetBackgroundColor: newColor
    });
  }

  getMaxFrameWidth(animationData) {
    const animationKeys = Object.keys(animationData);
    return animationKeys.reduce((maxWidth, key) => {
      const frameWidth = animationData[key].frameWidth;
      if (frameWidth > maxWidth) {
        return frameWidth;
      }
      return maxWidth;
    }, 0);
  }

  getMaxFrameHeight(animationData) {
    const animationKeys = Object.keys(animationData);
    return animationKeys.reduce((maxHeight, key) => {
      const frameHeight = animationData[key].frameHeight;
      if (frameHeight > maxHeight) {
        return frameHeight;
      }
      return maxHeight;
    }, 0);
  }

  getNoOfFrames(animationData) {
    const animationKeys = Object.keys(animationData);
    return animationKeys.reduce((framesCount, key) => {
      return framesCount + animationData[key].frames;
    }, 0);
  }

  getSpritesheetFrameDimensions(animationData) {
    const totalFrames = this.getNoOfFrames(animationData);
    let x = Math.floor(Math.sqrt(totalFrames));
    if (Math.sqrt(totalFrames) % 1 > 0.5) {
      x = Math.ceil(Math.sqrt(totalFrames));
    }
    const y = Math.ceil(Math.sqrt(totalFrames));
    return {
      xFrames: x,
      yFrames: y,
      finalFrameWidth: this.getMaxFrameWidth(animationData),
      finalFrameHeight: this.getMaxFrameHeight(animationData),
      totalFrames: x * y
    }
  }

  renderSpritesheet(animationData) {
    if (this.state.selectedView !== "spritesheet") {
      return;
    }

    const { xFrames, yFrames, finalFrameWidth, finalFrameHeight } = this.getSpritesheetFrameDimensions(animationData);
    const finalSpritesheet = document.createElement('canvas');
    finalSpritesheet.setAttribute('id', 'previewSpritesheet');
    const currentWidth = window.innerWidth * (0.7 * 0.9);
    const currentHeight = (window.innerHeight * 0.75) - 26;
    if (currentHeight > currentWidth) {
      const canvasHeight = currentWidth * ((yFrames * finalFrameHeight) / (xFrames * finalFrameWidth));
      console.log(canvasHeight);
      finalSpritesheet.setAttribute('style', `width: 100%; margin-top: ${(currentHeight - canvasHeight) / 2}px`);
    } else {
      finalSpritesheet.setAttribute('style', 'height: calc(75vh - 26px);');
    }
    finalSpritesheet.width = xFrames * finalFrameWidth;
    finalSpritesheet.height = yFrames * finalFrameHeight;
    const spritesheetContext = finalSpritesheet.getContext('2d');

    let currentDrawFrame = 0;
    const animationNames = Object.keys(animationData);
    animationNames.forEach(animationName => {
      const { frameHeight, frameWidth, frames, spritesheet } = animationData[animationName];
      for (let i = 0; i < frames; i++) {
        // Destination co-ordinates
        const finalXOffset = (finalFrameWidth - frameWidth) / 2;
        const finalYOffset = finalFrameHeight - frameHeight;
        const finalFrameXPosition = ((currentDrawFrame % xFrames) * finalFrameWidth) + finalXOffset;
        const finalFrameYPosition = (Math.floor(currentDrawFrame / xFrames) * finalFrameHeight) + finalYOffset;

        spritesheetContext.drawImage(
          spritesheet, 
          i * frameWidth, 
          0, 
          frameWidth, 
          frameHeight, 
          finalFrameXPosition,
          finalFrameYPosition, 
          frameWidth, 
          frameHeight
        );

        currentDrawFrame++;
      }
    });

    // Replace the old canvas spritesheet with the new.
    let previewSpritesheet = document.getElementById('previewSpritesheet');
    previewSpritesheet.parentNode.replaceChild(finalSpritesheet, previewSpritesheet);
    this.setState({
      spritesheetReady: true
    });
  }

  getDescriptionLanguage() {
    const { animationData, controllableAnimationName, defaultFrame } = this.props;
    const { finalFrameWidth, finalFrameHeight } = this.getSpritesheetFrameDimensions(animationData);
    const animationKeys = Object.keys(animationData);
    const animationDescription = animationKeys.reduce(
      (description, key, index) => {
        const frames = animationData[key].frames;
        let previousFrames = 0;
        for (let i = 0; i < index; i++) {
          previousFrames += animationData[animationKeys[i]].frames;
        }

        description[key] = {
          frames,
          first_frame_position: previousFrames + 1,
        }

        if (animationData[key].climax > 0) {
          description[key].climax = animationData[key].climax;
        }

        return description;
      }, 
    {});

    return {
      name: controllableAnimationName,
      frame_width: finalFrameWidth,
      frame_height: finalFrameHeight,
      default_frame_position: defaultFrame,
      animation_description: animationDescription
    };
  }

  renderDescriptionLanguage() {
    return JSON.stringify(this.getDescriptionLanguage(), undefined, 2);
  }

  downloadSpritesheet(e) { 
    const spritesheet = document.getElementById('previewSpritesheet');
    const spritesheetDownload = document.getElementById('downloadButton');

    if (!this.props.validateControllableInputs()) {
      e.preventDefault();
    } else {
      spritesheetDownload.href = spritesheet.toDataURL();
      spritesheetDownload.download = `${this.props.controllableAnimationName}_spritesheet.png`; 
    }
  }

  downloadDescription(e) {
    const descriptionData = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.getDescriptionLanguage()));
    const descriptionDownload = document.getElementById('downloadButton');
    if (!this.props.validateControllableInputs()) {
      e.preventDefault();
    } else {
      descriptionDownload.href = descriptionData;
      descriptionDownload.download = `${this.props.controllableAnimationName}_description.json`; 
    }
  }

  renderViewToggle() {
    const { selectedView } = this.state;
    return (
      <div className="animationContentsToggle">
        <p 
          className={`${selectedView === "spritesheet" ? "selectedView" : ""} leftToggle`} 
          onClick={this.changeView.bind(this, "spritesheet")}
        >
         Spritesheet
        </p>
        <p className="centerBreak">
          |
        </p>
        <p 
          className={`${selectedView === "description" ? "selectedView" : ""} rightToggle`}
          onClick={this.changeView.bind(this, "description")}
        >
          Description
        </p>
      </div>
    );
  }

  renderDownloadButton(hasData) {
    const { selectedView, spritesheetReady } = this.state;
    const { hasControllableInputError } = this.props;
    if (selectedView === "spritesheet") {
      if (!hasData || !spritesheetReady || hasControllableInputError) {
        return <a className="disabled" id="downloadButton">Download Spritesheet</a>; 
      }
      return <a id="downloadButton" onClick={this.downloadSpritesheet}>Download Spritesheet</a>;
    } else {
      if (!hasData || hasControllableInputError) {
        return <a className="disabled" id="downloadButton">Download Description Language</a>;
      }
      return <a id="downloadButton" onClick={this.downloadDescription}>Download Description Language</a>;
    }
  }

  openTrueSizeTab() {
    const spritesheet = document.getElementById('previewSpritesheet');
    const trueImage = `<img src='${spritesheet.toDataURL()}' />`;
    const newTab = window.open('', "_blank");
    newTab.document.write(trueImage);
    newTab.document.close();
  }

  renderSpritesheetToolbar(hasData) {
    const { spritesheetBackgroundColor, spritesheetReady } = this.state;
    const borderColor = spritesheetBackgroundColor === "white" ? "black" : "white";
    return (
      <div className="spritesheetToolbar" style={{ backgroundColor: spritesheetBackgroundColor}}>
        <div className="backgroundColorToggle">
          <div 
            className="white" 
            onClick={this.changeSpritesheetBackground.bind(this, "white")} 
            style={{borderColor}}
          />
          <div 
            className="black" 
            onClick={this.changeSpritesheetBackground.bind(this, "black")} 
            style={{borderColor}}
          />
        </div>
        { hasData && spritesheetReady && 
          <div className="trueSizeLink">
            <a onClick={this.openTrueSizeTab} style={{color: borderColor}}>View true spritesheet size</a>
          </div>
        }
      </div>
    );
  }

  render() {
    const { animationData } = this.props;
    const { selectedView, spritesheetBackgroundColor } = this.state;
    const hasData = Object.keys(animationData).length > 0;
    return (
      <div className="animationGenerator">
        {this.renderViewToggle()}
        <div className="animationContents">
          { selectedView === "spritesheet" &&
            <span>
              <div className="spritesheetContents" style={{ backgroundColor: spritesheetBackgroundColor}}>
                <canvas id="previewSpritesheet" />
              </div>
              { this.renderSpritesheetToolbar(hasData) }
            </span>
          }
          { selectedView === "description" &&
            <div className="descriptionContents">
              <pre>
                {hasData && this.renderDescriptionLanguage()}
              </pre>
            </div>
          }
        </div>
        <div className="downloadButtonWrapper">
          {this.renderDownloadButton(hasData)}
        </div>
      </div>
    );
  }
}

AnimationGenerator.propTypes = {
  animationData: PropTypes.object.isRequired,
  validateControllableInputs: PropTypes.func.isRequired,
  hasControllableInputError: PropTypes.bool.isRequired,
  controllableAnimationName: PropTypes.string.isRequired,
  defaultFrame: PropTypes.number.isRequired
}

export default AnimationGenerator;
