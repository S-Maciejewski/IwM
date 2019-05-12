from skimage import data, io, filters, exposure, measure, color, feature
from skimage.color import rgb2hsv, hsv2rgb, rgb2gray
from functools import reduce
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


def grayOut(img):
    hsv = rgb2hsv(img)
    hsv[:, :, 1] = 0
    return rgb2gray(hsv2rgb(hsv))


def getRawImage(path):
    return data.imread(path)


def detectEdges(img, sigma=1):
    return ski.feature.canny(img, sigma)


def parseType(img):
    if(np.dtype(img[0][0]) == bool):
        return img.astype(int)
    if(str(np.dtype(img[0][0])) == 'uint8'):
        return img.astype(bool).astype(int)


def getAccuracy(detected, reference):
    detected = detected.astype(int)
    reference = reference.astype(bool).astype(int)
    TPTN = 0
    for y in range(detected.shape[0]):
        for x in range(detected.shape[1]):
            if(detected[y][x] == reference[y][x]):
                TPTN += 1
    return(TPTN / (len(detected[0]) * len(detected[1])))


def getSensitivity(detected, reference):
    TP = 0
    FN = 0
    for y in range(detected.shape[0]):
        for x in range(detected.shape[1]):
            if(detected[y][x] == 1 and reference[y][x] == 1):
                TP += 1
            elif(reference[y][x] == 1):
                FN += 1
    return(TP / (TP + FN))


def getSpecificity(detected, reference):
    TN = 0
    FP = 0
    for y in range(detected.shape[0]):
        for x in range(detected.shape[1]):
            if(detected[y][x] == 0 and reference[y][x] == 0):
                TN += 1
            elif(detected[y][x] == 1):
                FP += 1
    return(TN / (TN + FP))


def printMeans(sensitivity, specificity):
    print('Mean of sens. and spec. = ', (sensitivity + specificity) / 2)
    print('Geometric mean of sens. and spec. = ',
          (sensitivity * specificity) ** (0.5))


def printMeasures(detected, reference):
    accuracy = getAccuracy(detected, reference)
    sensitivity = getSensitivity(detected, reference)
    specificity = getSpecificity(detected, reference)

    print('\nAccuracy = ', accuracy)
    print('Sensitivity = ', sensitivity)
    print('Specificity = ', specificity)
    printMeans(sensitivity, specificity)
    print('\n')


def getErrorMatrix(detected, reference):
    matrix = np.zeros([detected.shape[0], detected.shape[1]], dtype=int)
    for y in range(matrix.shape[0]):
        for x in range(matrix.shape[1]):
            matrix[y][x] = 0 if detected[y][x] == reference[y][x] else 1
    return matrix


hrfImgs = ['hrf/0' + str(x) + '_h.jpg' if x < 10 else 'hrf/' +
           str(x) + '_h.jpg' for x in range(1, 16)]

imgs = ['ref/' + str(x) + '.ppm' for x in range(1, 6)]
ref = ['ref/' + str(x) + '_ref.ppm' for x in range(1, 6)]

fig, ((ax1, ax3), (ax2, ax4)) = plt.subplots(2, 2, figsize=(10, 10))


img = getRawImage(imgs[4])


# Wyzerowanie kanału R i kontrast
img[:, :, 0] = 0
img = contrast(img, 0.4, 95)


edgesImg = detectEdges(grayOut(img))
dilationImg2 = parseType(ski.morphology.dilation(
    edgesImg, ski.morphology.disk(2)))
dilationImg3 = parseType(ski.morphology.dilation(
    edgesImg, ski.morphology.disk(3)))
refImage = parseType(getRawImage(ref[4]))
errorMatrix = getErrorMatrix(dilationImg2, refImage)


ax1.imshow(img)
ax2.imshow(dilationImg2, cmap=plt.cm.Greys_r)
ax3.imshow(refImage, cmap=plt.cm.Greys_r)
ax4.imshow(errorMatrix, cmap=plt.cm.Greys_r)
printMeasures(dilationImg2, refImage)
printMeasures(dilationImg3, refImage)


plt.show()
