function [] = assign1()
% part 1
hp = rgb2gray(im2double(imread('highfreq.jpg')));
lp = rgb2gray(im2double(imread('lowfreq.jpg')));
hp = imresize(hp,[500 500]);
lp = imresize(lp,[500 500]);
imwrite(hp,'HP.png');
imwrite(lp,'LP.png');
% part 2
hpfou = fft2(hp);
lpfou = fft2(lp);
imwrite(fftshift(abs(hpfou))/100, 'HP-freq.png');
imwrite(fftshift(abs(lpfou))/100, 'LP-freq.png');
% part 3
gaus = fspecial('gaussian',13,2.5);
sobel = [-1 0 1; -2 0 2; -1 0 1];
dog = conv2(gaus, sobel);
surf(gaus);
saveas(gcf, 'gaus-surf.png');
surf(dog);
saveas(gcf, 'dog-surf.png');
hpfilt = imfilter(hp, gaus);
lpfilt = imfilter(lp, gaus);
imwrite(hpfilt,'HP-filt.png');
imwrite(lpfilt,'LP-filt.png');
hpfiltfou = fft2(hpfilt);
lpfiltfou = fft2(lpfilt);
imwrite(fftshift(abs(hpfiltfou))/25, 'HP-filt-freq.png');
imwrite(fftshift(abs(lpfiltfou))/25, 'LP-filt-freq.png');
dogfou = fft2(dog, 500, 500);
hpdog = hpfou .* dogfou;
lpdog = lpfou .* dogfou;
imwrite(ifft2(hpdog), 'HP-dogfilt.png');
imwrite(ifft2(lpdog), 'LP-dogfilt.png');
imwrite(fftshift(abs(hpdog)), 'HP-dogfilt-freq.png');
imwrite(fftshift(abs(lpdog)), 'LP-dogfilt-freq.png');
% part 4
hpsub2 = hp(1:2:end, 1:2:end);
lpsub2 = lp(1:2:end, 1:2:end);
imwrite(hpsub2,'HP-sub2.png');
imwrite(lpsub2,'LP-sub2.png');
imwrite(fftshift(abs(fft2(hpsub2)))/100,'HP-sub2-freq.png');
imwrite(fftshift(abs(fft2(lpsub2)))/100,'LP-sub2-freq.png');
hpsub4 = hp(1:4:end, 1:4:end);
lpsub4 = lp(1:4:end, 1:4:end);
imwrite(hpsub4,'HP-sub4.png');
imwrite(lpsub4,'LP-sub4.png');
imwrite(fftshift(abs(fft2(hpsub4)))/100,'HP-sub4-freq.png');
imwrite(fftshift(abs(fft2(lpsub4)))/100,'LP-sub4-freq.png');
gaus = fspecial('gaussian',7,1.5);
hpfiltsub2 = imfilter(hp, gaus);
hpfiltsub2 = hpfiltsub2(1:2:end, 1:2:end);
imwrite(hpfiltsub2,'HP-sub2-aa.png');
imwrite(fftshift(abs(fft2(hpfiltsub2)))/100,'HP-sub2-aa-freq.png');
gaus = fspecial('gaussian',15,3);
hpfiltsub4 = imfilter(hp, gaus);
hpfiltsub4 = hpfiltsub4(1:4:end, 1:4:end);
imwrite(hpfiltsub4,'HP-sub4-aa.png');
imwrite(fftshift(abs(fft2(hpfiltsub4)))/100,'HP-sub4-aa-freq.png');
% part 5
[edgesopt, thresh] = edge(hp, 'canny');
[edgeslowlow, ~] = edge(hp, 'canny', thresh - [thresh(1)*0.25 0]);
[edgeshighlow, ~] = edge(hp, 'canny', thresh + [thresh(1)*0.25 0]);
[edgeslowhigh, ~] = edge(hp, 'canny', thresh - [0 thresh(2)*0.25]);
[edgeshighhigh, ~] = edge(hp, 'canny', thresh + [0 thresh(2)*0.25]);
imwrite(edgesopt, 'HP-canny-optimal.png');
imwrite(edgeslowlow, 'HP-canny-lowlow.png');
imwrite(edgeshighlow, 'HP-canny-highlow.png');
imwrite(edgeslowhigh, 'HP-canny-lowhigh.png');
imwrite(edgeshighhigh, 'HP-canny-highhigh.png');
[edgesopt, thresh] = edge(lp, 'canny');
[edgeslowlow, ~] = edge(lp, 'canny', thresh - [thresh(1)*0.25 0]);
[edgeshighlow, ~] = edge(lp, 'canny', thresh + [thresh(1)*0.25 0]);
[edgeslowhigh, ~] = edge(lp, 'canny', thresh - [0 thresh(2)*0.25]);
[edgeshighhigh, ~] = edge(lp, 'canny', thresh + [0 thresh(2)*0.25]);
imwrite(edgesopt, 'LP-canny-optimal.png');
imwrite(edgeslowlow, 'LP-canny-lowlow.png');
imwrite(edgeshighlow, 'LP-canny-highlow.png');
imwrite(edgeslowhigh, 'LP-canny-lowhigh.png');
imwrite(edgeshighhigh, 'LP-canny-highhigh.png');
end