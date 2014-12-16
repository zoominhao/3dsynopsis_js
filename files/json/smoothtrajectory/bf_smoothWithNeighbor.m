function bf_smoothWithNeighbor( intputFile, neighInterval )
% input
input = fopen(intputFile, 'r');
[yin, cnt] = fscanf(input, '%f');
 yin = reshape(yin, 2, cnt/2)';
% output
output = fopen('data_NeighSmooth', 'w');


div = floor(neighInterval/2);
yout = zeros(cnt/2, 2);

for i = 1 : cnt/2
    if(i < div + 1 || i > cnt/2 - div)
        yout(i, :) = yin(i, :);
    else
        yout(i, :) = sum(yin((i - div):(i + div), :))/(div + div +1);
    end
    if( i == cnt/2 )
        fprintf(output, '%f %f', yout(i, 1), yout(i, 2));
    else
        fprintf(output, '%f %f\n', yout(i, 1), yout(i, 2));
    end
end

figure;
hold on;
plot(yin(1:cnt/2, 1), yin(1:cnt/2, 2), 'r');
plot(yout(1:cnt/2, 1), yout(1:cnt/2, 2), 'g');
grid on;
hold off;

end

