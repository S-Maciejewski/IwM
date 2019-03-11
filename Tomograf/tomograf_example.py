from skimage import data, io, filters, exposure, measure, color, feature
import matplotlib.pyplot as plt
import numpy as np

# Nie jestem pewnien, czy można tego używać
from skimage.transform import radon, iradon

img = data.imread("slp256.png", as_gray=True)
iterations = 360

fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(10, 10))

ax1.set_title("Object")
ax1.imshow(img, cmap=plt.cm.Greys_r)

angle = np.linspace(0., 180., iterations, endpoint=False)
sinogram = radon(img, theta=angle, circle=False)
ax2.set_title("Sinogram")
ax2.imshow(sinogram, cmap=plt.cm.Greys_r)

inverse = iradon(sinogram, angle, circle=False)
ax3.set_title("Inverse")
ax3.imshow(inverse, cmap=plt.cm.Greys_r)

plt.show()
