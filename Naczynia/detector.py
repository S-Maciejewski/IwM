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


def gamma(img, gamma):
    return exposure.adjust_gamma(img, gamma)


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


def invertImage(img):
    img = np.array(img, dtype=np.uint8)
    return cv2.bitwise_not(img)


# Do poprawki i przemyślenia czy ma sens
def reduceBrightAreas(img, divider=2, rThresh=0.8, gThresh=0.8, bThresh=0.8):
    outputImg = img.copy()
    for i in range(len(outputImg)):
        for j in range(len(outputImg[i])):
            if outputImg[i][j][0] >= rThresh and outputImg[i][j][1] >= gThresh and outputImg[i][j][2] >= bThresh:
                outputImg[i][j] = [x / divider for x in outputImg[i][j]]
    return outputImg


hrfImgs = ['hrf/0' + str(x) + '_h.jpg' if x < 10 else 'hrf/' +
           str(x) + '_h.jpg' for x in range(1, 16)]

imgs = ['ref/' + str(x) + '.ppm' for x in range(1, 6)]
ref = ['ref/' + str(x) + '_ref.ppm' for x in range(1, 6)]

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 10))

# img = getRawImage(hrfImgs[5])
img = getRawImage(imgs[4])


# img = threshCanal(img)
# img = threshRGB(img, 100, 50, 45)
# img = grayOut(img)

# Wyzerowanie kanału R i kontrast
img[:, :, 0] = 0
img = contrast(img, 0.4, 95)
# img = threshRGB(img, 0, 150, 145)

edgesImg = detectEdges(grayOut(img), 2)

# ax1.imshow(contrast(img))
ax1.imshow(img)
ax2.imshow(edgesImg, cmap=plt.cm.Greys_r)
# ax2.imshow(reduceBrightAreas(img, 2, 0, 0.7, 0.7))

plt.show()
