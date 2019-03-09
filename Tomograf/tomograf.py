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


def getValues(emitter, detectors):
    # print('Emitter: ', emitter, '\nDetectors: ', detectors)
    # if len(detectors) > 1:
    values = []
    for det in detectors:
        value = 0
        passed = 0
        for i in bresenhamGenerator(emitter[0], emitter[1], det[0], det[1]):
            value += img[i[0], i[1]]
            values.append(np.float64(value / img.shape[0]))
            # if(i[0] < img.shape[0] and i[0] >= 0 and i[1] < img.shape[0] and i[1] >= 0):
            passed += 1
            img[i[0], i[1]] = 1
            # print('painting pixel', i)
        # print('Passed ', passed, ' pixels')
    return values
    # else:
    #     value = 0
    #     for i in bresenhamGenerator(emitter[0], emitter[1], detectors[0][0], detectors[0][1]):
    #         i[0] = i[0] - 1 if i[0] == img.shape[0] else i[0]
    #         i[1] = i[1] - 1 if i[1] == img.shape[0] else i[1]
    #         # print('Pixel ', i, ' with value ', img[i[0], i[1]])
    #         value += img[i[0], i[1]]
    #     # print('Sum ', value, ', avg ', value/img.shape[0])
    #     return value / img.shape[0]


def validate(pos):
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


def getPositions(ang):  # TODO
    # print('angle: ', ang)
    ang = np.deg2rad(ang)
    positions = []
    r = img.shape[0] * 2
    # center = int(img.shape[0] / 2)
    # Emiter
    # positions.append([int(r * np.cos(ang)), int(r * np.sin(ang))])
    positions.append(validate([int(r * np.cos(ang)), int(r * np.sin(ang))]))
    # positions.append([int(r * np.cos(ang)) + center,
    #   int(r * np.sin(ang)) + center])
    # print('Emitter: ', positions[0])
    if detectors > 1:
        for i in range(detectors):
            position = [int(r/2 * np.cos(ang + np.pi - detectorsAngle / 2 + i * detectorsAngle / (detectors - 1))),
                        int(r/2 * np.sin(ang + np.pi - detectorsAngle / 2 + i * detectorsAngle / (detectors - 1)))]
            # position = [int(r * np.cos(ang + np.pi - detectorsAngle / 2 + i * detectorsAngle / (detectors - 1))) + center,
            # int(r * np.sin(ang + np.pi - detectorsAngle / 2 + i * detectorsAngle / (detectors - 1))) + center]
            positions.append(validate(position))
            # positions.append(position)
    # else:
    #     position = [int(r * np.cos(ang) + np.pi - detectorsAngle / 2 + center),
    #                 int(r * np.sin(ang) + np.pi - detectorsAngle / 2 + center)]
    #     print(position)
    #     positions.append(position)-

    # for pos in positions:
    #     img[pos[0], pos[1]] = 1
    # img[positions[0][0], positions[0][1]] = 0.25

    return positions


def getSinogram():
    sinogram = []
    angles = np.linspace(0., 180., iterations, endpoint=False)
    for ang in angles:
        positions = getPositions(ang)
        # print('Positions: ', positions[1:])
        # values = np.array(getValues(positions[0], positions[1:]))
        values = getValues(positions[0], positions[1:])
        sinogram.append(values)
    return sinogram


# img = addPadding(data.imread("mozg_inverted_400.png", as_gray=True))
img = addPadding(np.zeros([100, 100], dtype=np.uint8))


# Zmienne sterujące
# n
detectors = 5
# l (deg)
detectorsAngle = 30
# ilość pomiarów
iterations = 5

sinogram = getSinogram()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 10))
# fig, ax1 = plt.subplots(1, 1, figsize=(10, 10))
ax1.set_title("Original image")
ax1.imshow(img, cmap=plt.cm.Greys_r)
print('img: ', type(img), type(img[0]), type(img[0][0]))

# print(sinogram)
print(len(sinogram), ', ', len(sinogram[0]))
# print(type(sinogram), type(sinogram[0]))
sinogram = np.array(sinogram)
print(type(sinogram), type(sinogram[0]), type(sinogram[0][0]))

print(sinogram)
# print(img)

ax2.set_title("Sinogram")
ax2.imshow(img, cmap=plt.cm.Greys_r)

# invertedSinogram
# ax3.set_title("Inverted")
# ax3.imshow(invertedSinogram, cmap=plt.cm.Greys_r)

# plt.show()
