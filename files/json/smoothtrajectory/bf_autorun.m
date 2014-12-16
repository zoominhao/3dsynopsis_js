function yout = bf_autorun(yin, section)
%% instruction
if nargin < 2
    disp('Input : ');
    disp('yin : input y array, must be a column vector (filename)');
    disp('section : segmentation part of original data (filename)');
    disp('Example : yout = bf_autorun(''y_input_file'', ''segmentation_file'')');
    return;
end

%% segmented interpolation
% input file
fyin = fopen(yin, 'r');
[ydata, ycnt] = fscanf(fyin, '%f');

ydata = reshape(ydata, 2, ycnt/2)';

fsec = fopen(section, 'r');
[sdata, scnt] = fscanf(fsec, '%f');

% output file
output = fopen('data_bezierInterp', 'w');
% fprintf(fod, '%f\n', speed(i));

if mod(scnt, 3) ~= 0
    disp('Segmentation Error');
    return;    
end

if sdata(scnt - 1) ~= ycnt/2
   disp('Not Inclusive Segmentation Interval');
   return;
end


% yout = zeros(ycnt, 1);
% 
% for i = 1 : scnt/2
%     pBegin = sdata( 2*i-1 );
%     pEnd   = sdata( 2*i );
%     
%     yout(pBegin:pEnd) = bf_bezierFitting(ydata(pBegin:pEnd,:), pBegin, pEnd);
% end

yout = zeros(ycnt/2, 2);

for i = 1 : scnt/3
    pBegin = sdata( 3*i-2 );
    pEnd   = sdata( 3*i-1 );
    mode   = sdata( 3*i );

    yout(pBegin:pEnd, :) = bf_bezierFitting(ydata(pBegin:pEnd,:), pBegin, pEnd, mode);
  
   
end

%write data
for i = 1 : ycnt/2-1
    fprintf(output, '%f\t%f\n', yout(i,1),yout(i,2));
end
fprintf(output, '%f\t%f', yout(ycnt/2,1),yout(ycnt/2,2));

%close all;
plot(yout(1:ycnt/2, 1),yout(1:ycnt/2, 2),ydata(1:ycnt/2, 1),ydata(1:ycnt/2, 2));
%plot(yout, 'r');
grid on;


%disp('Finish');
%plotSpeedAndWeight(yin,'data_bezierInterp');
end