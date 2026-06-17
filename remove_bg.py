import sys
from PIL import Image

def remove_background(img_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # We will do a BFS from the 4 corners.
    # We consider a pixel as "background" if it's very close to white or gray
    # and it hasn't hit the green boundary.
    
    # Let's find the green color by sampling the middle-left of the image
    # (The W is in the center, so mid-left should be green)
    # Actually, we don't need to know the green color. We just need to stop if the pixel is NOT gray or white.
    
    def is_bg(r, g, b, a):
        # Checkerboard is usually white (255,255,255) and gray (around 204,204,204 or 211,211,211 or 240,240,240)
        # So if R, G, B are all similar (low saturation) and relatively bright, it's bg.
        if a == 0: return True
        # Check saturation
        if max(r,g,b) - min(r,g,b) > 30:
            return False # It has color (e.g. green)
        # Check brightness
        if r < 180 or g < 180 or b < 180:
            return False # Too dark
        return True

    visited = set()
    queue = [(0,0), (width-1, 0), (0, height-1), (width-1, height-1)]
    for start in queue:
        visited.add(start)

    # BFS
    while queue:
        x, y = queue.pop(0)
        
        r, g, b, a = pixels[x, y]
        
        if is_bg(r, g, b, a):
            pixels[x, y] = (0, 0, 0, 0)
            
            # Add neighbors
            for dx, dy in [(0,1), (1,0), (0,-1), (-1,0)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))

    # Finally, save the image
    img.save(img_path)

if __name__ == "__main__":
    remove_background("public/logo.png")
