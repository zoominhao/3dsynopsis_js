//interest.js
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
 * @fileoverview request path, uniform sample, solve trajectory, store json
 * @author Zoomin
 * @date 2014-11-17
 * @supported Tested in Chrome
 */
 
 /**
 * The list of driving steps loaded from google.maps.Directions
 * @type {Array.<Object>}
 */
var SY_steps = [];

/**
 * The list of path vertices and their metadata for the driving directions
 * @type {Array.<Object>}
 */
var SY_path = []; // entire driving path

/**
 * The list of drive path vertices and their metadata for constant drive
 * @type {Array.<Object>}
 */
var SY_conCarPath = [];
var SY_conCamPath = [];

/**
 * The list of drive path vertices and their metadata for google drive
 * @type {Array.<Object>}
 */
var SY_glCarPath = [];
var SY_glCamPath = [];


/**
 * The list of drive path vertices and their metadata for synopsis drive
 * @type {Array.<Object>}
 */
var SY_syCarPath = [];
var SY_syCamPath = [];


/**
 * The car marker that appears on the reference map to the right of the main
 * simulation screen
 * @type {google.maps.Marker}
 */
var SY_mapMarker = null; // car marker on the Map

/**
 * Instead of using the plugin's built-in ID system, which doesn't like when
 * IDs are reused, we will use a separate dictionary mapping ID to placemark
 * object
 * @type {Object}
 */
var SY_placemarks = {};
 
//total distance
var SY_TotalDistance; 
var SY_TotalTime;
 /**
 * The callback for when the 'Go!' button is pressed. This uses the Maps API's
 * Directions class to get the route and pull out the individual route steps
 * into a path, which is rendered as a polyline.
 */

function SY_Solve() {
     SY_Request();
}

function SY_Request() {
  $('#route-details').empty();
  $('#route-details').html(
      '<span class="loading">Loading directions...</span>');
  
  var start = $('#from').val();
  var end = $('#to').val();
  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.TravelMode.DRIVING
  };
  SY_directions.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      SY_directionsLoaded(response);
    }
	else
	{
	  $('#route-details').empty();
      $('#route-details').html(
        '<span class="error">No directions found.</span>');
	}
  });
}

/**
 * Initialization after directions are loaded
 */
function SY_directionsLoaded(directionResult) {
  // Directions data has loaded
  $('#route-details').empty();
  SY_display.setDirections(directionResult);  //search result display on map
  
  var route = directionResult.routes[0].legs[0];
  var start = route.start_location;
  var end = route.end_location;
  var startaddress = route.start_address;
  var endaddress = route.end_address;
  SY_TotalDistance = route.distance.value;
  SY_TotalTime = route.duration.value;
  // build the path and step arrays from the google.maps.Directions route
  SY_buildPathStepArrays(directionResult);
  
  //clear placemark
  SY_geHelpers.clearFeatures();
  
  SY_placemarks = {};
  // create the starting point placemark
  SY_placemarks['start'] = SY_geHelpers.createPointPlacemark(
      start,{description: startaddress, standardIcon: 'grn-diamond'});
  loadSteps();
  // create the ending point placemark
  SY_placemarks['end'] = SY_geHelpers.createPointPlacemark(
      end,{description: endaddress, standardIcon: 'grn-diamond'});
  
   //load sig logo
  loadSigLogo();
   //渲染路线，最原始的路线
  //loadPath();
  //渲染smooth的路线
  //loadSmoothPath($('#mode').val());
  //渲染点
  //loadPoints(3);

  // build the left directions list
  SY_buildDirectionsList(directionResult);
  
  // fly to the start of the route
  SY_flyToLatLng(start);
  
  // enable the simulator controls
  $('#simulator-form input').removeAttr('disabled');
  
}

/**
 * Generates the SY_path and SY_step arrays from the global SY_directions
 * instance
 * 
 * NOTE: only the first route is used
 */
function SY_buildPathStepArrays(directionResult) {
  // begin processing the directions' steps and path
  SY_steps = [];
  SY_path = [];

  var route = directionResult.routes[0].legs[0];
  var numSteps = route.steps.length;
  
  for (var i = 0; i < numSteps; i++) {
    var step = route.steps[i];
	
    SY_steps.push({
      loc: step.start_point,
      desc: step.instructions,
      distanceHtml: step.distance.text,
      pathIndex: SY_path.length
    });
    
    var stepDistance = step.distance.value;
    for (var j = 0; j <= step.lat_lngs.length-1; j++) {
      var loc = step.lat_lngs[j];
      var distance = (j == step.lat_lngs.length - 1) ?
                     0 : SY_geHelpers.distance(loc, step.lat_lngs[j+1]);
      
      SY_path.push({
        loc: loc,
        step: i,
        distance: distance,
        // this segment's time duration is proportional to its length in
        // relation to the length of the step
        duration: step.duration.value * distance / stepDistance
      });
    }
  }
     SY_generateCon();
	 SY_generateGL();
     SY_generateSY();
}

/**
 * Generates the HTML elements for the left directions list
 * 
 * NOTE: only the first route is used
 */
function SY_buildDirectionsList(directionResult) {

  var start = directionResult.routes[0].legs[0].start_location;
  var end = directionResult.routes[0].legs[0].end_location;
  var startaddress = directionResult.routes[0].legs[0].start_address;
  var endaddress = directionResult.routes[0].legs[0].end_address;
  $('#route-details').append($(
      '<div id="dir-start">' + startaddress + '</div>'));
  
  $('#route-details').append('<ol>');
  for (var i = 0; i < SY_steps.length; i++) {
    $('#route-details ol').append($(
        '<li class="dir-step" id="dir-step-' + i + '">' +
        SY_steps[i].desc +
        '<div class="note">' + SY_steps[i].distanceHtml + '</div>' + 
        '</li>'));
  }
  
  $('#route-details').append($(
      '<div id="dir-end">' + endaddress + '</div>'));
  
  // handle events on the directions list
  $('#dir-start').click(function() {
    SY_flyToLatLng(new google.maps.LatLng(
                   start.lat(), start.lng()));
  });
  
  $('#dir-end').click(function() {
    SY_flyToLatLng(new google.maps.LatLng(
                   end.lat(), end.lng()));
  });
  
  $('#route-details li').click(function() {
    var id = $(this).attr('id');
    if (id == 'dir-start' || id == 'dir-end')
      return;
    
    var stepNum = parseInt(id.match(/dir-step-(\d+)/)[1]);
      SY_flyToStep(stepNum);
  });
}

/**
 * Fly the camera to the given step index in the route, and highlight it in
 * the directions list. Also show the placemark description balloon.
 * @param {number} stepNum The 0-based step index to fly to
 */
function SY_flyToStep(stepNum) {
  var step = SY_steps[stepNum];
  
  var la = SY_ge.createLookAt('');
  la.set(step.loc.lat(), step.loc.lng(),
      0, // altitude
      SY_ge.ALTITUDE_RELATIVE_TO_GROUND,
      SY_geHelpers.getHeading(step.loc, SY_path[step.pathIndex + 1].loc),
      60, // tilt
      50 // range (inverse of zoom)
      );
  SY_ge.getView().setAbstractView(la);

  // show the description balloon.
  var balloon = SY_ge.createFeatureBalloon('');
  balloon.setFeature(SY_placemarks['step-' + stepNum]);
  SY_ge.setBalloon(balloon); 

  SY_highlightStep(stepNum);
}

/**
 * Highlights the given step in the left directions list
 * @param {number} stepNum The 0-based step index to highlight in the
 *     directions list
 */
function SY_highlightStep(stepNum) {
  $('#route-details li').removeClass('sel');
  $('#route-details #dir-step-' + stepNum).addClass('sel');
}

/**
 * Move the camera to the given location, staring straight down, and unhighlight
 * all items in the left directions list
 * @param {google.maps.LatLng} loc The location to fly the camera to
 */
function SY_flyToLatLng(loc) {
  var la = SY_ge.createLookAt('');
  la.set(loc.lat(), loc.lng(),
      10, // altitude
      SY_ge.ALTITUDE_RELATIVE_TO_GROUND,
      90, // heading
      0, // tilt
      200 // range (inverse of zoom)
      );
  SY_ge.getView().setAbstractView(la);
  
  $('#route-details li').removeClass('sel');
}

/**
 * generate car path and camera trajectory for constant speed mode
 */
function SY_generateCon() {
   // begin processing the directions' steps and path
   SY_conCarPath = [];
   SY_conCamPath = [];
   var pathLen = SY_path.length;
   var conHeading;
   var totalTime = $('#totaltime').val() * 3;
   var conSpeed = SY_TotalDistance / totalTime;
   var conDuration;
   var conAlt;
   var conDis;
   
   for (var i = 0; i < pathLen; i++) {
      if(SY_path[i].distance == 0 && i != pathLen - 1)
	   continue;
	  if(i < pathLen - 1)
	  {
	    conHeading = SY_geHelpers.getHeading(SY_path[i].loc, SY_path[i + 1].loc); 
		conDuration = SY_path[i].distance / conSpeed;  
		conAlt = 10;
		conDis = -20;
	  }
	 
      SY_conCarPath.push({ 
	    loc: SY_path[i].loc,
		altitude: 1,
		step: SY_path[i].step,
		distance: SY_path[i].distance,
        duration: conDuration,
		heading: conHeading
      });  
	  var curloc = SY_geHelpers.DestLoc(SY_path[i].loc, conDis, conHeading); //往后退
      SY_conCamPath.push({
        loc: curloc,   
		heading: conHeading,
		tilt: 70,
		altitude: conAlt + 1,
		distance: SY_path[i].distance,
        duration: conDuration,
      });
   }
}

/**
 * generate car path and camera trajectory for google speed mode
 */
function SY_generateGL() {
    // begin processing the directions' steps and path
   SY_glCarPath = [];
   SY_glCamPath = [];
   var pathLen = SY_path.length;
   var glHeading;
   var totalTime = $('#totaltime').val() * 3;
   var gl_rate = SY_TotalTime / totalTime;
   gl_rate = 1;
   var glDuration;
   var glAlt;

   for (var i = 0; i < pathLen; i++) {
      if(SY_path[i].distance == 0 && i != pathLen - 1)
	   continue;
	  if(i < pathLen - 1)
	  {
	    glHeading = SY_geHelpers.getHeading(SY_path[i].loc, SY_path[i + 1].loc); 
		glDuration = SY_path[i].duration * gl_rate;  
		glAlt = Math.max(20.0, (SY_path[i].distance / SY_path[i].duration ) * 10 * gl_rate);
	  }
	 
      SY_glCarPath.push({ 
	    loc: SY_path[i].loc,
		altitude: 1,
		step: SY_path[i].step,
		distance: SY_path[i].distance,
        duration: glDuration,
		heading: glHeading
      });  

      SY_glCamPath.push({
        loc: SY_path[i].loc,   
		heading: glHeading,
		tilt: 60,
		altitude: glAlt,
		distance: SY_path[i].distance,
        duration: glDuration,
      });
   }
}

/**
 * generate car path and camera trajectory for synopsis speed mode
 */
function SY_generateSY() {
   SY_syCarPath = [];
   SY_syCamPath = [];
   var pathLen = SY_path.length;
   var totalTime = $('#totaltime').val() * 3;
   var gl_rate = SY_TotalTime / totalTime;
   gl_rate = 1;
   //存取当前raw path
   // Json_Res = [];
   // for (var i = 0; i < SY_path.length; i++) {
      // Json_Res.push({
	    // x: SY_path[i].loc.lat(),
		// y: SY_path[i].loc.lng(),
	    // distance: SY_path[i].distance,
		// duration: SY_path[i].duration * gl_rate,
		// step: SY_path[i].step
	  // });
   // }
   // writeRawPath( Json_Res );
   
   //读取外部处理结果，此处会循环等待
   readSmoothedRes( SY_syCarPath, SY_syCamPath);
   
   
   
}