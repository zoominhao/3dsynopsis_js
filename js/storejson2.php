<?php
header('Content-Type: text/html; charset=utf-8');
set_time_limit(0);
function storeJson($filename, $toStoreJson)
{
   $jsonfile = fopen($filename,"w");
   if($jsonfile)
   {
      $totalcount = count($toStoreJson);
	  $curcount = 0;
      fwrite($jsonfile,"[\r\n");
      foreach ($toStoreJson as $one) {
	    $curcount++;
		fwrite($jsonfile,json_encode($one));
		if($curcount < $totalcount)
			fwrite($jsonfile,",\n");
	  }
	  fwrite($jsonfile,"\r\n]");
   }
   else
   {
        return "FAIL";
   }
   fclose($jsonfile);
   return   "SUCCESS";
}
// $test = array("a"=>array("one"=>4, "two"=>3, "three"=>5),
             // "b"=>array("one"=>4, "two"=>6, "three"=>8));
// $res = storeJson("..\\files\\json\\test.json", $test);
// echo json_encode($res);

   $res = storeJson($_GET["filename"], $_GET["jsonres"]);
   echo json_encode($res);
?>