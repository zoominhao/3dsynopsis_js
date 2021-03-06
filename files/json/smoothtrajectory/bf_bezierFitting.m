function output = bf_bezierFitting(mydata, pBegin, pEnd, mode)
%% arguments checking
if pEnd - pBegin > 1000
    disp('More than 1000 points can not be fitted by Bezier Function');
end

%% bezier interpolation

% x = zeros(length(y), 1);
% 
% for i = 1 : length(y)
%     x(i) = i;
% end
% 
% points = [x y];


points = mydata;

if(mode)
    numberOfCtrlPoints = pEnd - pBegin + 1;
    [bpoints binter] = bezier(points, numberOfCtrlPoints, [], 1);
    % binter : no use currently
    %output = bpoints(1:numberOfCtrlPoints, 2);
    output = bpoints;
else
   % numberOfCtrlPoints =( pEnd - pBegin + 1 ) / 2 + 1;
    numberOfCtrlPoints = pEnd - pBegin + 1;
    [bpoints binter] = bezier(points, numberOfCtrlPoints, [], 1);
    output = bpoints;
end

end