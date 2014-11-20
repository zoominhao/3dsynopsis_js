// simulator.js
// requires geplugin-helpers.js

/*
Copyright 2014 VCC@SIAT.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * @fileoverview This is the main file for the SYSimulator class, which
 * simulates a drive over a given path in a Google Earth plugin instance
 * @author Zoomin
 * @date 2014-11-18
 * @supported Tested in Chrome
 */
 
 /**
 * Constructs a simulator object
 * @param {Object} ge The Google Earth instance
 * @param {Array.<Object>} path The path to simulate, as an array of vertex
 *     objects of the form:
 *   {google.maps.LatLng} loc The vertex location of vertex,
 *   {number} step The index of the associated directions step
 *   {number} duration The time duration before the next vertex, in seconds
 *   {number} distance The distance to the next vertex, in meters
 * @param {Object?} opt_opts An object with the following optional fields:
 *   {Function?} on_tick A callback function, called after one tick of the
 *       simulation completes
 *   {Function?} on_changeStep A callback function for when the current step
 *       changes (as per the step property of path items)
 *   {number} speed A multiplier on the simulation speed
 * @constructor
 */
 
 //macro
 // remote address, the local doesn't work
 SYSimulator.MODEL_URL = 'https://github.com/zoominhao/3dsynopsis_js/blob/master/files/smart.kmz?raw=true';  
 SYSimulator.TICK_SIM_MS = 66;
 //public vars
 SYSimulator.prototype.currentLoc = null;

 //class SYSimulator
 function SYSimulator(ge, campath, carpath, opt_opts) {
  this.ge = ge;
  this.campath = campath;
  this.carpath = carpath;
  this.options = opt_opts || {};
  if (!this.options.speed)
    this.options.speed = 1.0;         //倍率,可在外部调用DS_simulator.options.speed /= 2.0; 调整速度
  
  this.currentLoc = this.carpath[0].loc;
  // private vars
  this.geHelpers_ = new GEHelpers(ge);
  this.doTick_ = false;
  this.pathIndex_ = 0;          //共用
  this.currentStep_ = -1;
  this.segmentTime_ = 0;
  this.lastCarPath_ = this.carpath[0];
  this.lastCamPath_ = this.campath[0];
  this.curCarPath_ = this.lastCarPath_;
  this.curCamPath_ = this.lastCamPath_;
}

/**
 * Initializes the simulator UI
 * construct
 * @public
 * @param {Function?} opt_cb Optional callback
 */
SYSimulator.prototype.initUI = function(opt_cb) {
    var me = this;
    window.google.earth.fetchKml(
      this.ge,
      SYSimulator.MODEL_URL,
      function(obj) {
        me.finishInitUI_(obj, opt_cb);
      });
}
 
/**
 * Completes the UI initialization (i.e. once the car model is loaded); called
 * after fetchKml() is called on the car model URL
 * @private
 * @param {Object} kml The car model KML object
 * @param {Function?} opt_cb Optional callback
 */
SYSimulator.prototype.finishInitUI_ = function(kml, opt_cb) {
  if (!kml || !kml.getFeatures().getChildNodes().getLength()) {
    throw new Error('Error loading Model KML. Expected Document > Placemark > Model.');
  }
  
  this.modelPlacemark = kml.getFeatures().getFirstChild();
  if (!('getGeometry' in this.modelPlacemark) ||
      this.modelPlacemark.getGeometry().getType() != 'KmlModel') {
    throw new Error('Error loading Model KML. Expected Document > Placemark > Model.');
  }
  
  this.model = this.modelPlacemark.getGeometry();
  this.model.setAltitudeMode(this.ge.ALTITUDE_RELATIVE_TO_GROUND);
  
  this.ge.getFeatures().appendChild(this.modelPlacemark);
  
  //initialize car pos
  this.drive_();
  
  var me = this;
  this.tickListener = function() {
                        if (me.doTick_)
                          me.tick_();
                      };
  
  window.google.earth.addEventListener(this.ge, 'frameend', this.tickListener);

  if (opt_cb) opt_cb();
}

/**
 * deconstruct
 * Destroy the UI and detach from the Earth instance
 * @public
 */
SYSimulator.prototype.destroy = function() {
  this.stop();
  this.ge.getFeatures().removeChild(this.modelPlacemark);
  window.google.earth.removeEventListener(this.ge, 'frameend',
                                          this.tickListener);
}

/**
 * Start/resume the simulation clock
 * @public
 */
SYSimulator.prototype.start = function() {
  if (this.doTick_)
    return;
  
  this.oldFlyToSpeed = this.ge.getOptions().getFlyToSpeed();
   // 您可以控制插件移动到新的指定位置的速度。GEOptions.setFlyToSpeed() 
  // 接受介于0.0与5.0之间（包括0.0和5.0）的浮点数，以及 SPEED_TELEPORT。
  // 速度随值的增加而增加；SPEED_TELEPORT 表示立刻移动到指定位置。
  this.ge.getOptions().setFlyToSpeed(this.ge.SPEED_TELEPORT);
  
  this.doTick_ = true;
  this.tick_();
}

/**
 * Stop/pause the simulation clock
 * @public
 */
SYSimulator.prototype.stop = function() {
  if (!this.doTick_)
    return;
  
  this.ge.getOptions().setFlyToSpeed(this.oldFlyToSpeed);
  
  this.doTick_ = false;
}

/**
 * drive the car the change the camera
 * @private
 * @param {google.maps.LatLng} loc Location to move the car to
 * @param {number} heading The direction the car should be facing
 */
SYSimulator.prototype.drive_ = function() {
   this.cardrive_();
   this.camdrive_();
}

/**
 * Position the car model and make it look like it's driving towards a given
 * location
 * @private
 * @param {google.maps.LatLng} loc Location to move the car to
 * @param {number} heading The direction the car should be facing
 */
SYSimulator.prototype.cardrive_ = function() {
  this.model.getLocation().setLatLngAlt(this.curCarPath_.loc.lat(), this.curCarPath_.loc.lng(), 0);
  this.model.getOrientation().setHeading(this.curCarPath_.heading);
}

/**
 * Position the camera at the given location, slowly turning to eventually face
 * locFacing and zoom to an appropriate level for the current speed
 * @private
 * @param {google.maps.LatLng} loc Location to move the car to
 * @param {number} heading The direction the car should be facing
 */
SYSimulator.prototype.camdrive_ = function() {
    var curHeading;
	var curTilt;
	var curAlt;
	var sycamera = this.ge.getView().copyAsCamera(this.ge.ALTITUDE_ABSOLUTE);    //this.ge.ALTITUDE_RELATIVE_TO_GROUND);
    if(this.pathIndex_ != 0)
	{
	   //Camera 可包含介于0度与360度之间的倾斜值。0度表示指定点的正下方；90度表示与水平线齐平；180度则表示正对天空。 
		curHeading = sycamera.getHeading();
		curTilt = sycamera.getTilt();
		curAlt = sycamera.getAltitude();
	}
	else
	{
	    curHeading = this.lastCamPath_.heading;
		curTilt = this.lastCamPath_.tilt;
		curAlt = this.lastCamPath_.altitude;
	}
	
     // 更新 Google 地球中的视图。
	sycamera.setLatitude(this.curCamPath_.loc.lat());
	sycamera.setLongitude(this.curCamPath_.loc.lng());
    sycamera.setTilt(curTilt + this.getTiltMove_(curTilt, this.curCamPath_.tilt));
    sycamera.setHeading(curHeading + this.getHeadingMove_(curHeading, this.curCamPath_.heading));
	sycamera.setAltitude(curAlt + (this.curCamPath_.altitude - curAlt) * 0.2);

    this.ge.getView().setAbstractView(sycamera);
}


/**
 * Returns whether to turn left (-1) or right (1) to transition from a given
 * heading/bearing to another
 * @private
 * @param {number} heading1 Current heading/bearing, in degrees
 * @param {number} heading2 Desired heading/bearing, in degrees
 */
SYSimulator.prototype.getHeadingMove_ = function(heading1, heading2) {
   //SYSimulator.TICK_SIM_MS 相关
  if (Math.abs((heading1) - (heading2)) < 1)
    return heading2 - heading1;
  
  return (this.geHelpers_.fixAngle(heading2 - heading1) < 0) ? -1 : 1;
}

SYSimulator.prototype.getTiltMove_ = function(tilt1, tilt2){
	if (Math.abs((tilt1) - (tilt2)) < 1)
    return tilt2 - tilt1;
  
    return (this.geHelpers_.fixAngle(tilt2 - tilt1) < 0) ? -1 : 1;
}

SYSimulator.prototype.syInterpolate_ = function(f)
{
	 // update the current location
	 // car
    this.currentLoc = this.geHelpers_.interpolateLoc( this.carpath[this.pathIndex_].loc, this.carpath[this.pathIndex_ + 1].loc, f);
    
	this.curCarPath_ = this.carpath[this.pathIndex_];
	this.curCarPath_.loc = this.currentLoc;

	//camera
	this.curCamPath_ = this.campath[this.pathIndex_];
    this.curCamPath_.loc = this.geHelpers_.interpolateLoc( this.campath[this.pathIndex_].loc, this.campath[this.pathIndex_ + 1].loc, f);
	this.curCamPath_.heading = this.geHelpers_.interpolateHeading( this.campath[this.pathIndex_].heading, this.campath[this.pathIndex_ + 1].heading, f );
	this.curCamPath_.tilt = this.geHelpers_.interpolateTilt( this.campath[this.pathIndex_].tilt, this.campath[this.pathIndex_ + 1].tilt, f );
	this.curCamPath_.altitude = this.geHelpers_.interpolateAlt( this.campath[this.pathIndex_].altitude, this.campath[this.pathIndex_ + 1].altitude, f );
}


/**
 * Simulate one unit of time, as specified by TICK_SIM_MS
 * @private
 */
SYSimulator.prototype.tick_ = function() {
   //overflow
  if (this.pathIndex_ >= this.carpath.length - 1) {  //最后一个点无距离 distance = 0, duration = 0
    this.doTick_ = false;
    return;
  }
  
  // update current route step and run callback
  if (this.carpath[this.pathIndex_].step != this.currentStep_) {
    this.currentStep_ = this.carpath[this.pathIndex_].step;
    if (this.options.on_changeStep)
      this.options.on_changeStep(this.currentStep_);
  }
  //car & camera
  // move up TICK_SIM_MS milliseconds
  this.segmentTime_ += SYSimulator.TICK_SIM_MS * this.options.speed / 1000.0;
  var segmentDuration = this.campath[this.pathIndex_].duration;
  
  while (this.pathIndex_ < this.campath.length - 1 && this.segmentTime_ >= segmentDuration)
    {
		this.segmentTime_ -= segmentDuration;
			
		// update new position in path array
		this.pathIndex_++;
		if (this.pathIndex_ >= this.campath.length - 1) {
			this.doTick_ = false;
			return;
		}
		segmentDuration = this.campath[this.pathIndex_].duration;
	}
	
    this.syInterpolate_(this.segmentTime_ / this.campath[this.pathIndex_].duration);   //campath 和 carpath的duration相等
    this.drive_();
   // fire the callback if one is provided
   if (this.options.on_tick)
     this.options.on_tick();
}
 