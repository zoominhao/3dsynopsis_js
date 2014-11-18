//driver.js
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
 * @fileoverview control camera and car
 * @author Zoomin
 * @date 2014-11-17
 * @supported Tested in Chrome
 */

/**
 * The global simulator instance that conducts the driving simulation
 * @type {SYSimulator}
 */
var SY_simulator; // instance of the SYSimulator class

/**
 * Simulator controls
 * @param {string} command The control command to run
 * @param {Function?} opt_cb Optional callback to run when the command
 *     completes its task
 */
function SY_controlSimulator(command, opt_cb) {
  switch (command) {
    case 'reset':
      if (SY_simulator)
        SY_simulator.destroy();
      
      // create a SYSimulator object for the current SY_path array
      // on the DS_ge Earth instance
      SY_simulator = new SYSimulator(SY_ge, SY_path, {
        // as the simulator runs, reposition the map on the right and the
        // car marker on the map, and update the status box on the bottom
        on_tick: function() {
          SY_map.panTo(SY_simulator.currentLoc);
          SY_mapMarker.setPosition(SY_simulator.currentLoc);
        },
        // when the simulator moves to a new step (specified as an integer
        // index in DS_path items), highlight that step in the directions
        // list
        on_changeStep: function(stepNum) {
          SY_highlightStep(stepNum);
        }
      });
      
      if (!SY_mapMarker) {
        // create vehicle location indicator on map
		
		 var image = {
           url: 'images/porsche_marker.png',
           // This marker is 20 pixels wide by 32 pixels tall.
           size: new google.maps.Size(42, 42),
           // The origin for this image is 0,0.
           origin: new google.maps.Point(0,0),
           // The anchor for this image is the base of the flagpole at 21,21.
           anchor: new google.maps.Point(21, 21)
        };
		
		SY_map.panTo(SY_simulator.currentLoc);
		
        SY_mapMarker = new google.maps.Marker({
        position: SY_simulator.currentLoc,
        map: SY_map,
        icon: image
        });
      }
      SY_map.setZoom(13);

      SY_simulator.initUI(opt_cb);
      break;
    
    case 'start':
      if (!SY_simulator)
        SY_controlSimulator('reset', function() {
          SY_simulator.start();
          if (opt_cb) opt_cb();
        });
      else {
        SY_simulator.start();
        if (opt_cb) opt_cb();
      }
      break;
    
    case 'pause':
      if (SY_simulator)
        SY_simulator.stop();
      
      if (opt_cb) opt_cb();
      break;
    
    case 'resume':
      if (SY_simulator)
        SY_simulator.start();
      
      if (opt_cb) opt_cb();
      break;
  }
}