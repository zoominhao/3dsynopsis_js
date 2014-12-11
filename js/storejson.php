<?php
header('Content-Type: text/html; charset=utf-8');
set_time_limit(0);
function storeJson($filename, $toStoreJson)
{
   $jsonfile = fopen($filename,"a");
   if($jsonfile)
   {
      foreach ($toStoreJson as $one) {
		fwrite($jsonfile,json_encode($one));
		fwrite($jsonfile,",\n");
	  }
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