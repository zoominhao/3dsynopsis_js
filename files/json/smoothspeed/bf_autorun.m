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

ydata = ydata.^1.3;


fsec = fopen(section, 'r');
[sdata, scnt] = fscanf(fsec, '%f');

% output file
output = fopen('data_bezierInterp', 'w');
% fprintf(fod, '%f\n', speed(i));

if mod(scnt, 2) ~= 0
    disp('Segmentation Error');
    return;    
end

if sdata(scnt) ~= ycnt
   disp('Not Inclusive Segmentation Interval');
   return;
end


yout = zeros(ycnt, 1);

for i = 1 : scnt/2
    pBegin = sdata( 2*i-1 );
    pEnd   = sdata( 2*i );
    
    yout(pBegin:pEnd) = bf_bezierFitting(ydata(pBegin:pEnd), pBegin, pEnd);
end

% write data
for i = 1 : ycnt-1
    fprintf(output, '%f\n', yout(i));
end
fprintf(output, '%f', yout(ycnt));

close all;
plot(yout, 'r');
grid on;

disp('Finish');
plotSpeedAndWeight(yin,'data_bezierInterp');
end