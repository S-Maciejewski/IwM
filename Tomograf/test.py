from skimage import data, io, filters, exposure, measure, color, feature
import matplotlib.pyplot as plt
import numpy as np


def calculateValues(emitter, detectors):
    value = 0
    if len(detectors) == 1:
        for i in bresenhamGenerator(emitter[0], emitter[1], detectors[0][0], detectors[0][1]):
            print('Pixel ', i, ' with value ', img[i[0], i[1]])
            value += img[i[0], i[1]]
            # img[i[0], i[1]] = 1
        print('Sum ', value, ', avg ', value/img.shape[0])
    else:
        pass


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
        yield x0 + x*xx + y*yx, y0 + x*xy + y*yy
        if D >= 0:
            y += 1
            D -= 2*dx
        D += 2*dy


def addPadding(img):
    result = np.zeros([max(img.shape), max(img.shape)])
    result[:img.shape[0], :img.shape[1]] = img
    return result


img = np.zeros([10, 10], dtype=np.uint8)

img = addPadding(img)
# img[:, :] = 1
# print(' '.join(map(str, img)))
# print(img.shape)
# img[0, 0] = 1
img[:, 5] = 0.25  # img[:][5] = 1
img[5, :] = 0.5
img[7, :] = 1

calculateValues([0,0], [[9, 9]])

fig, (ax1) = plt.subplots(1, 1, figsize=(10, 10))

ax1.set_xlim(0, img.shape[0] - 1)
ax1.set_ylim(0, img.shape[1] - 1)
ax1.imshow(img, cmap=plt.cm.Greys_r)

plt.show()
