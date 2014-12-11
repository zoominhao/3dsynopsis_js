function bf_smoothWithNeighbor( intputFile, neighInterval )
% input
input = fopen(intputFile, 'r');
[yin, cnt] = fscanf(input, '%f');

% output
output = fopen('data_NeighSmooth', 'w');

div = floor(neighInterval/2);
yout = zeros(cnt, 1);

for i = 1 : cnt
    
    if i - div < 1
        left = 1;
    else
        left = i - div;
    end
    
    if i + div > cnt
        right = cnt;
    else
        right = i + div;
    end
    
    yout(i) = sum(yin(left:right))/(right-left+1);
    
    if(i==cnt)
        fprintf(output, '%f', yout(i));
    else
        fprintf(output, '%f\n', yout(i));
    end
end

figure;
hold on;
plot(yin, 'b');
plot(yout, 'r');
grid on;
hold off;

end

