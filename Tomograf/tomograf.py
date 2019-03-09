from skimage import data, io, filters, exposure, measure, color, feature
import matplotlib.pyplot as plt
import numpy as np


def calculateValues(emitter, detectors):
    value = 0
    if len(detectors) == 1:
        for i in bresenhamGenerator(emitter[0], emitter[1], detectors[0][0], detectors[0][1]):
            print('Pixel ', i, ' with value ', img[i[0], i[1]])
            value += img[i[0], i[1]]
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


img = addPadding(data.imread("mozg_inverted_400.png", as_gray=True))
fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(10, 10))

ax1.set_title("Original image")
ax1.imshow(img, cmap=plt.cm.Greys_r)

iterations = 360
angle = np.linspace(0., 180., iterations, endpoint=False)
# sinogram
# ax2.set_title("Sinogram")
# ax2.imshow(sinogram, cmap=plt.cm.Greys_r)

# invertedSinogram
# ax3.set_title("Inverted")
# ax3.imshow(invertedSinogram, cmap=plt.cm.Greys_r)

plt.show()
