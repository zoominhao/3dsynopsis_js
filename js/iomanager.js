//iomanager.js
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
 * @fileoverview load json file
 * @author Zoomin
 * @date 2014-12-09
 * @supported Tested in Chrome
 */
 
 /**
 * function to write path
 */
 
 function writeRawPath( rawPath ) {
   
	var rawPath_json = "..\\files\\json\\rawpath.json";
	var filelen = 0;
	
    $.getJSON(rawPath_json, function(data){  
        $.each(data, function(infoIndex, info){  
             filelen++;
        });
		var totalLen = rawPath.length;
		 //先判断是否已经存储
		if(filelen != totalLen)
		{
			$.ajaxSetup({
			async: false
			}); 
			var times = Math.ceil(totalLen / 30);
			var count = 0;
			for (var i = 0; i < times; i++)
			{
				rawSeg = [];
				for(var j = 0; j < 30; j++)
				{
					if(count == totalLen)
						continue;
					rawSeg.push(rawPath[count]);
					count++; 
				}
				var para =
				{
					filename: rawPath_json,
					jsonres: rawSeg
				}
                                                
				$.get("js/storejson.php", para, function(ret){
					if(ret == "FAIL"){
						return false;
					}
				},'json');
			}
		}
    });
	
	return true;
 }
 
 
 /**
 * function to read res
 */
 function readSmoothedRes(carPath, camPath) {
    var resaddr = "..\\files\\json\\outpath.json";

	var carHeading = 0;
	var lastCarLoc;
	
	var camHeading = 0;
	var lastCamLoc;
	var camDis;
	var camAlt;
	
    $.getJSON(resaddr, function(data){  
        $.each(data, function(infoIndex, info){  
            if(infoIndex >= 1)
			{
			    ncarloc = new google.maps.LatLng(info["x"], info["y"]);
				carHeading = SY_geHelpers.getHeading(lastCarLoc, ncarloc); 
				
				ncamloc = new google.maps.LatLng(info["sx"], info["sy"]);
				camHeading = SY_geHelpers.getHeading(lastCamLoc, ncamloc); 
              			
			}
			if(infoIndex == 1)
			{
			    camPath[0].loc = SY_geHelpers.DestLoc(lastCamLoc, camDis, camHeading);
			}
			lastCamLoc = new google.maps.LatLng(info["sx"], info["sy"]);
			lastCarLoc = new google.maps.LatLng(info["x"], info["y"]);
			
			carPath.push({ 
				loc: lastCarLoc,
				altitude: info["altitude"],
				step: info["step"],
				distance: info["distance"],
				duration: info["duration"],
				heading: carHeading     
			});

			camAlt = Math.max(10.0, (info["distance"] / info["duration"] ) * 10) + info["altitude"];
			camDis = -camAlt * 1.7;				
		    curloc = SY_geHelpers.DestLoc(lastCamLoc, camDis, camHeading); //往后退	
			camPath.push({
				loc: curloc,
				heading: camHeading,
				tilt: 70,
				altitude: camAlt,
				distance: info["distance"],
				duration: info["duration"],
			});
        });
		carPath[0].heading = carPath[1].heading; 
		camPath[0].heading = camPath[1].heading;
		
		loadSmoothPath($('#mode').val());
		//loadPoints(1, $('#mode').val());
	});	
	
 }
 
 
 