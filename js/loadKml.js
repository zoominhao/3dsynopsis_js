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
                '</kml>'
  var logo = SY_ge.parseKml(logoKml);
  SY_ge.getFeatures().appendChild(logo);
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
        SY_path[i].loc.lat().toString() + ',1 \n' ;
  
  lineStringKml += '</coordinates></LineString>';
  
  // create the route placemark from the LineString KML blob
  var routeLineString = SY_ge.parseKml(lineStringKml);
  routeLineString.setTessellate(true);
  
  var routePlacemark = SY_ge.createPlacemark('');
  routePlacemark.setGeometry(routeLineString);
  SY_placemarks['route'] = routePlacemark;
  
  routePlacemark.setStyleSelector(
      SY_geHelpers.createLineStyle({width: 10, color: '88ff0000'}));
  
  SY_ge.getFeatures().appendChild(routePlacemark);
 }