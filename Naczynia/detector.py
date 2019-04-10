from skimage import data, io, filters, exposure, measure, color, feature
from skimage.color import rgb2hsv, hsv2rgb, rgb2gray
import skimage.morphology as mp
import matplotlib.pyplot as plt
import skimage as ski
import numpy as np
import cv2


def contrast(img, minVal=0.28, maxVal=98):
    MIN = np.percentile(img, minVal)
    MAX = np.percentile(img, maxVal)
    norm = (img - MIN) / (MAX - MIN)
    norm[norm[:, :] > 1] = 1
    norm[norm[:, :] < 0] = 0
    return norm


def dilatate(img):
    for i in range(int((img.shape[1] - 600) * ((12.0-3.0) / 2408.0) + 3)):
        img = mp.erosion(img)
    return img


def grayOut(img):
    hsv = rgb2hsv(img)
    hsv[:, :, 1] = 0
    return rgb2gray(hsv2rgb(hsv))


def getRawImage(path):
    return data.imread(path)


def threshRGB(img, red, green, blue):
    ret3, img_blue_th = cv2.threshold(
        img[:, :, 2], blue, 255, cv2.THRESH_BINARY_INV)
    cv2.imwrite("./debug/blue.jpg", img_blue_th)
    ret2, img_green_th = cv2.threshold(
        img[:, :, 1], green, 255, cv2.THRESH_BINARY_INV)
    cv2.imwrite("./debug/green.jpg", img_green_th)
    ret1, img_red_th = cv2.threshold(
        img[:, :, 0], red, 255, cv2.THRESH_BINARY_INV)
    cv2.imwrite("./debug/red.jpg", img_red_th)
    return cv2.bitwise_or(cv2.bitwise_or(img_blue_th, img_green_th, mask=None), img_red_th, mask=None)


def threshCanal(img, canal=1, threshValue=50):
    ret, threshImg = cv2.threshold(
        img[:, :, canal], threshValue, 255, cv2.THRESH_BINARY_INV)
    return threshImg


def detectEdges(img, sigma=3):
    return ski.feature.canny(img, sigma)


hrfImgs = ['hrf/0' + str(x) + '_h.jpg' if x < 10 else 'hrf/' +
           str(x) + '_h.jpg' for x in range(1, 16)]

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 10))

img = getRawImage(hrfImgs[0])

img[:, :, 0] = 0

# img = threshCanal(img)
# img = threshRGB(img, 100, 50, 45)
# img = grayOut(img)
img = contrast(img)

# ax1.imshow(contrast(img))
ax1.imshow(img)
ax2.imshow(dilatate(grayOut(img)))

plt.show()
