//loadKml.js
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
 * @fileoverview load kml file and str
 * @author Zoomin
 * @date 2014-11-17
 * @supported Tested in Chrome
 */
 /**
 * function to load sig logo
 */
function loadSigLogo() {
    // SIG logo
  var logoKml = '<?xml version="1.0" encoding="UTF-8"?>\n'+
                '<kml xmlns="http://www.opengis.net/kml/2.2">\n'+
                '<ScreenOverlay>\n'+
                '<name>VCC@SIAT</name>\n'+
                '<Icon>\n'+
                '<href>http://www.siggraph.org/sites/default/files/logo.png</href>\n'+
				'<gx:w>10</gx:w>'+
				'<gx:h>4</gx:h>'+
                '</Icon>\n'+
                '<overlayXY x="0" y="1" xunits="fraction" yunits="fraction"/>\n'+
                '<screenXY x="0" y="1" xunits="fraction" yunits="fraction"/>\n'+
                '<rotationXY x="0" y="0" xunits="fraction" yunits="fraction"/>\n'+
                '<size x="0" y="0" xunits="fraction" yunits="fraction"/>\n'+
                '</ScreenOverlay>\n'+
                '</kml>';
  var logo = SY_ge.parseKml(logoKml);
  SY_ge.getFeatures().appendChild(logo);
 }

 
 function loadSteps() {
    // create the point placemarks for each step in the driving directions
  for (var i = 0; i < SY_steps.length; i++) {
    var step = SY_steps[i];
    
    var placemark = SY_geHelpers.createPointPlacemark(
        step.loc, {description: step.desc, standardIcon: 'red-circle'});
    
    SY_placemarks['step-' + i] = placemark; 
    
    google.earth.addEventListener(placemark, 'click', function(event) {
      // match up the placemark to its id in the dictionary to find out
      // which step number it is
      var id = '';
      for (k in SY_placemarks)
        if (SY_placemarks[k].equals(event.getTarget()))
          id = k;
      
      var stepNum = parseInt(id.match(/step-(\d+)/)[1]);
      
      SY_flyToStep(stepNum);
    });
  }
 }
 
 function loadPoints(interval, mode) {
 //<!-- kml:altitudeModeEnum: clampToGround, relativeToGround, or absolute -->
        //<!-- or, substitute gx:altitudeMode: clampToSeaFloor, relativeToSeaFloor -->
  if(mode == 1)
	spath = SY_conCarPath;
  else if(mode == 2)
    spath = SY_glCarPath;
  else if(mode == 3)
    spath = SY_syCarPath;
  for (var i = 0; i < spath.length; i+= interval) {
    var placemark = SY_geHelpers.createPointPlacemark(
        spath[i].loc, {description: i.toString() + "\n" + spath[i].heading, standardIcon: 'ball'});
    } 
 }
 
 function loadPath() {
   // build the route LineString; instead of creating a LineString using
  // pushLatLngAlt, which has some performance issues, we will construct a
  // KML blob and use parseKml() 
  var lineStringKml = '<LineString><altitudeMode>relativeToGround</altitudeMode><coordinates>\n';
  //https://developers.google.com/kml/documentation/kmlreference#linestring
  for (var i = 0; i < SY_path.length; i++)
    lineStringKml +=
        SY_path[i].loc.lng().toString() + ',' +
        SY_path[i].loc.lat().toString() + ', 1 \n' ;
  
  lineStringKml += '</coordinates></LineString>';
  
  // create the route placemark from the LineString KML blob
  var routeLineString = SY_ge.parseKml(lineStringKml);
  routeLineString.setTessellate(true);   //Specifies whether to allow the geometry to follow the terrain elevation
  
  var routePlacemark = SY_ge.createPlacemark('');
  routePlacemark.setGeometry(routeLineString);
  SY_placemarks['route'] = routePlacemark;
  
  routePlacemark.setStyleSelector(
      SY_geHelpers.createLineStyle({width: 10, color: '8800ff00'}));
  
  SY_ge.getFeatures().appendChild(routePlacemark);
  
 }
 
 function loadSmoothPath(mode) {
   // build the route LineString; instead of creating a LineString using
  // pushLatLngAlt, which has some performance issues, we will construct a
  // KML blob and use parseKml() 
  var slineStringKml = '<LineString><altitudeMode>relativeToGround</altitudeMode><coordinates>\n';
  //https://developers.google.com/kml/documentation/kmlreference#linestring
  if(mode == 1)
	spath = SY_conCarPath;
  else if(mode == 2)
    spath = SY_glCarPath;
  else if(mode == 3)
    spath = SY_syCarPath;
  for (var i = 0; i < spath.length; i++)
    slineStringKml +=
        spath[i].loc.lng().toString() + ',' +
        spath[i].loc.lat().toString() + ',' +
		spath[i].altitude.toString() + '\n' ;
  
  slineStringKml += '</coordinates></LineString>';
  
  // create the route placemark from the LineString KML blob
  var srouteLineString = SY_ge.parseKml(slineStringKml);
  srouteLineString.setTessellate(true);
  
  var sroutePlacemark = SY_ge.createPlacemark('');
  sroutePlacemark.setGeometry(srouteLineString);
  SY_placemarks['sroute'] = sroutePlacemark;
  
  sroutePlacemark.setStyleSelector(
      SY_geHelpers.createLineStyle({width: 10, color: '88ff0000'}));
  
  SY_ge.getFeatures().appendChild(sroutePlacemark);
 }
 