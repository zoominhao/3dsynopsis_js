// index.js
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
 * @fileoverview This is the main(win main) JavaScript file for 3D Synopsis
 * @author Zoomin
 * @date 2014-11-17
 * @supported Tested in Chrome
 */
 
 
var SY_ge;               //instance of google earth
var SY_geHelpers;        //math tool for google earth&map
var SY_map;              //instance of google map
var SY_display;          //direction render on map
var SY_directions;       //direction service


 
 function onresize() {
    var clientHeight = document.documentElement.clientHeight;

    $('#earth, #map').each(function() {
      $(this).css({
        height: (clientHeight - $(this).position().top - 100).toString() + 'px' });      
    });
  }
  
function initSuccess(pluginInstance){
    //initialize google earth
    SY_ge = pluginInstance;
    SY_ge.getWindow().setVisibility(true);
    SY_ge.getLayerRoot().enableLayerById(SY_ge.LAYER_BORDERS, true);   //用于显示国家和地区边界，以及城市、省/自治区/直辖市、国家/地区、海洋等的地方标签
    SY_ge.getLayerRoot().enableLayerById(SY_ge.LAYER_BUILDINGS, true);   //3D建筑
	//DS_ge.getLayerRoot().enableLayerById(DS_ge.LAYER_BUILDINGS_LOW_RESOLUTION, true);   //灰色建筑（非仿真）
	SY_ge.getLayerRoot().enableLayerById(SY_ge.LAYER_ROADS, true);  // 用于显示道路和道路名称
	SY_ge.getLayerRoot().enableLayerById(SY_ge.LAYER_TERRAIN, true);  // 3D地形
	SY_ge.getLayerRoot().enableLayerById(SY_ge.LAYER_TREES, true);  // 3D树木模型 
    SY_geHelpers = new GEHelpers(SY_ge);
      
    SY_ge.getNavigationControl().setVisibility(pluginInstance.VISIBILITY_AUTO);
      
    var myOptions = {
      center: new google.maps.LatLng(37.4419, -122.1419),
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,

      // Add controls
      mapTypeControl: true,
      scaleControl: true,
      //overviewMapControl: true,           
      //overviewMapControlOptions: {
      //opened: true
      //}
    };
	//initialize google map
    SY_map = new google.maps.Map($('#map').get(0),myOptions);
	//initialize direction service
	SY_directions = new google.maps.DirectionsService();
	//bind display with map
	SY_display = new google.maps.DirectionsRenderer();
    SY_display.setMap(SY_map);
      
    $('#directions-form input').removeAttr('disabled');
}

function initFail(){
	alert('Init Earth Fail!');
}


