function [] = my_fast_detector()
%UNTITLED Summary of this function goes here
%   Detailed explanation goes here
corners1 = detectFASTFeatures(im1);
corners1 = corners1.Location;
cornersx1 = corners1(:,2);
cornersy1 = corners1(:,1);
points1 = zeros(size(im1));
for i=1:length(cornersx1)
   points1(cornersx1(i), cornersy1(i)) = 1;
end
points1 = imdilate(points1, ones(5));
im1fast = im1;
im1fast(points1 > 0) = 1;
sobel = [-1 0 1; -2 0 2; -1 0 1];
gaus = fspecial('gaussian', 5, 1);
dog = conv2(gaus, sobel);
ix1 = imfilter(im1, dog);
iy1 = imfilter(im1, dog');
ix21 = imfilter(ix1 .* ix1, gaus);
iy21 = imfilter(iy1 .* iy1, gaus);
ixiy1 = imfilter(ix1 .* iy1, gaus);
harriscorner1 = (ix21 .* iy21) - (ixiy1 .* ixiy1) - (0.05 * (ix21 + iy21) .^2);
mask1 = harriscorner1 > 0.001;
points1(~mask1) = 0;
im1fastr = im1;
im1fastr(points1 > 0) = 1;


corners2 = detectFASTFeatures(im2);
corners2 = corners2.Location;
cornersx2 = corners2(:,2);
cornersy2 = corners2(:,1);
points2 = zeros(size(im2));
for i=1:length(cornersx2)
   points2(cornersx2(i), cornersy2(i)) = 1;
end
points2 = imdilate(points2, ones(5));
im2fast = im2;
im2fast(points2 > 0) = 1;
ix2 = imfilter(im2, dog);
iy2 = imfilter(im2, dog');
ix22 = imfilter(ix2 .* ix2, gaus);
iy22 = imfilter(iy2 .* iy2, gaus);
ixiy2 = imfilter(ix2 .* iy2, gaus);
harriscorner2 = (ix22 .* iy22) - (ixiy2 .* ixiy2) - (0.05 * (ix22 + iy22) .^2);
mask2 = harriscorner2 > 0.001;
points2(~mask2) = 0;
im2fastr = im2;
im2fastr(points2 > 0) = 1;

imwrite(im1fast, 'S1-fast.png');
imwrite(im2fast, 'S2-fast.png');
imwrite(im1fastr, 'S1-fastR.png');
imwrite(im2fastr, 'S2-fastR.png');
end
