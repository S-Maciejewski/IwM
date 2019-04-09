from skimage import data, io, filters, exposure, measure, color, feature
import matplotlib.pyplot as plt
import numpy as np


def getRawImage(path):
    return data.imread(path)


hrfImgs = ['hrf/0' + str(x) + '_h.jpg' if x < 10 else 'hrf/' +
           str(x) + '_h.jpg' for x in range(1, 16)]

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 10))

ax1.imshow(getRawImage(hrfImgs[0]))
ax2.imshow(getRawImage(hrfImgs[1]))

plt.show()
