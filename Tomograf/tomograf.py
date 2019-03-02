from skimage import data, io, filters, exposure, measure, color, feature
import matplotlib.pyplot as plt
import numpy as np

# Nie jestem pewnien, czy można tego używać
from skimage.transform import radon

img = data.imread("mozg_inverted_400.png", as_gray=True)
iterations = 360

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 10))

ax1.set_title("Object")
ax1.imshow(img)

angle = np.linspace(0., 180., iterations, endpoint=False)
sinogram = radon(img, theta=angle, circle=True)
ax2.set_title("Sinogram")
ax2.imshow(sinogram)

plt.show()
