<html>  
    <body>  
        <form action="" method="post">  
            输入命令： <input type="text" name="cmd">  
                  <input type="submit" /><br />  
        </form>  
    </body>  
</html>  
  
<?php  
//phpinfo();  
if(isset($_POST['cmd']))  
{  
$cmd = $_POST['cmd'];  
$command="C:/Program Files/MATLAB/R2013a/bin/matlab.exe -nodisplay -nosplash -r "."\"".$cmd."\"";  
//echo $command."<br/>";  
//$command="/usr/local/MATLAB/R2012a/bin/matlab -r "."\"".$cmd."\"";  
shell_exec("unset DISPLAY");//删除DISPLAY环境变量  

$out = shell_exec($command);  

$str="< M A T L A B (R) >  
                  Copyright 1984-2012 The MathWorks, Inc.  
                    R2012a (7.14.0.739) 32-bit (glnx86)  
                              February 9, 2012  
  
   
To get started, type one of these: helpwin, helpdesk, or demo.  
For product information, visit www.mathworks.com.";  
$out=ltrim($out,$str);  
$out=rtrim($out,"  
>>");  
echo $out;  
}  
?>  