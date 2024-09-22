from tkinter import Image
from PIL import ImageGrab
import pyautogui

# 截取整个屏幕
screenshot = ImageGrab.grab()

# 获取鼠标当前位置
mouse_position = pyautogui.position()

# 加载鼠标指针图像
mouse_icon = Image.open("mouse_icon.png")

# 计算鼠标指针在截屏中的位置
mouse_x = mouse_position[0]
mouse_y = mouse_position[1]

# 在截屏图像上叠加鼠标指针图像
screenshot.paste(mouse_icon, (mouse_x, mouse_y), mouse_icon)

# 保存带有鼠标指针的截屏图像
screenshot.save("screenshot_with_mouse.png")
