from skimage import data, io, filters, exposure, measure, color, feature
import matplotlib.pyplot as plt
import numpy as np


def addPadding(img):
    result = np.zeros([max(img.shape), max(img.shape)]) if max(img.shape) % 2 == 1 else np.zeros(
        [max(img.shape) + 1, max(img.shape) + 1])
    result[:img.shape[0], :img.shape[1]] = img
    return result


def bresenhamGenerator(x0, y0, x1, y1):
    dx = x1 - x0
    dy = y1 - y0

    xsign = 1 if dx > 0 else -1
    ysign = 1 if dy > 0 else -1

    dx = abs(dx)
    dy = abs(dy)

    if dx > dy:
        xx, xy, yx, yy = xsign, 0, 0, ysign
    else:
        dx, dy = dy, dx
        xx, xy, yx, yy = 0, ysign, xsign, 0

    D = 2*dy - dx
    y = 0

    for x in range(dx + 1):
        yield [x0 + x*xx + y*yx, y0 + x*xy + y*yy]
        if D >= 0:
            y += 1
            D -= 2*dx
        D += 2*dy


def getValuesNN(positions):
    emitterList = positions[0]
    detectorList = positions[1]
    values = []
    for x in range(len(emitterList)):
        value = 0
        for i in bresenhamGenerator(emitterList[x][0], emitterList[x][1], detectorList[x][0], detectorList[x][1]):
            # print(i)
            value += img[i[0], i[1]]
            if debug:
                markedImg[i[0], i[1]] = 1
        values.append(np.float64(value / img.shape[0]))
    return values


def getValues(emitter, detectors):
    values = []
    for det in detectors:
        value = 0
        for i in bresenhamGenerator(emitter[0], emitter[1], det[0], det[1]):
            value += img[i[0], i[1]]
            if debug:
                markedImg[i[0], i[1]] = 1
        values.append(np.float64(value / img.shape[0]))
    return values


def project(pos):
    p = [0, 0]
    if pos[0] >= 0 and pos[0] < img.shape[0]:
        p[0] = pos[0]
    elif pos[0] >= 0:
        p[0] = img.shape[0] - 1
    else:
        0
    if pos[1] >= 0 and pos[1] < img.shape[0]:
        p[1] = pos[1]
    elif pos[1] >= 0:
        p[1] = img.shape[0] - 1
    else:
        0
    return p


def getPositions(ang):
    ang = np.deg2rad(ang)
    positions = []
    r = img.shape[0] * np.sqrt(2) / 2
    center = int(img.shape[0] / 2)
    positions.append(
        project([int(r * np.cos(ang)) + center, int(r * np.sin(ang)) + center]))
    if detectors > 1:
        for i in range(detectors):
            position = [int(r * np.cos(ang + np.pi - detectorsAngle / 2 + i * detectorsAngle / (detectors - 1))) + center,
                        int(r * np.sin(ang + np.pi - detectorsAngle / 2 + i * detectorsAngle / (detectors - 1))) + center]
            positions.append(project(position))
    return positions


def getPositionsNN(ang):
    ang = np.deg2rad(ang)
    positions = []
    emittersList = []
    detectorsList = []
    r = img.shape[0] * np.sqrt(2) / 2
    center = int(img.shape[0] / 2)
    if detectors > 1:
        for i in range(detectors):
            position = [int(r * np.cos(ang - detectorsAngle / 2 + i * detectorsAngle / (detectors - 1))) + center,
                        int(r * np.sin(ang - detectorsAngle / 2 + i * detectorsAngle / (detectors - 1))) + center]
            emittersList.append(project(position))
            position = [int(r * np.cos(ang + np.pi - detectorsAngle / 2 - i * detectorsAngle / (detectors - 1))) + center,
                        int(r * np.sin(ang + np.pi - detectorsAngle / 2 - i * detectorsAngle / (detectors - 1))) + center]
            detectorsList.append(project(position))

    positions.append(emittersList)
    positions.append(detectorsList)
    return positions


def getSinogram():
    sinogram = []
    angles = np.linspace(0., maxAng, iterations, endpoint=False)
    for ang in angles:
        positions = getPositionsNN(ang)

        values = getValuesNN(positions)
        sinogram.append(values)
    return sinogram


# img = addPadding(data.imread("mozg_inverted_400.png", as_gray=True))
img = addPadding(data.imread("slp256.png", as_gray=True))
# img = addPadding(np.zeros([512, 512], dtype=np.uint8))
# img = addPadding(np.zeros([50, 50], dtype=np.uint8))


# Zmienne sterujące np. 128 90 180 dla Siemens Somatom Perspective 128
# n
detectors = 8
# l (deg)
detectorsAngle = 45
# Ilość pomiarów
iterations = 90
# Maksynalny kąt obrotu
maxAng = 180.
# Zaznaczanie odwiedzonych, printy itd.
debug = True

if debug:
    markedImg = img.copy()

sinogram = getSinogram()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 10))

if debug:
    ax1.set_title("Image - scanned pixel marked")
    ax1.imshow(markedImg, cmap=plt.cm.Greys_r)
else:
    ax1.set_title("Original image")
    ax1.imshow(img, cmap=plt.cm.Greys_r)

sinogram = np.array(sinogram).transpose()

# if debug:
    # print('Img:\n', img)
    # print('Sinogram:\n', sinogram)
    # print('Sinogram dimensions: ', len(sinogram), ', ', len(sinogram[0]))

ax2.set_title("Sinogram")
ax2.imshow(sinogram, cmap=plt.cm.Greys_r)

plt.show()
