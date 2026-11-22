#!/usr/bin/env python3
"""Write /config/www/photos/manifest.json from image files in that folder.

The wall reads this file when Home Assistant media source has no photos.
The package also runs the same logic from shell_command.skylight_photo_manifest.
"""

import json
import os
import sys

folder = sys.argv[1] if len(sys.argv) > 1 else "/config/www/photos"
extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
os.makedirs(folder, exist_ok=True)
photos = sorted(
    name
    for name in os.listdir(folder)
    if os.path.splitext(name)[1].lower() in extensions and name != "manifest.json"
)
target = os.path.join(folder, "manifest.json")
with open(target, "w", encoding="utf-8") as handle:
    json.dump({"photos": photos}, handle)
print(f"Wrote {len(photos)} photos to {target}")
