import os
import json

# Paths
base_dir = os.path.dirname(os.path.abspath(__file__))
assets_dir = os.path.join(base_dir, "assets")
table_dir = os.path.join(assets_dir, "at-the-table")
menu_dir = os.path.join(assets_dir, "custom-menus")
manifest_path = os.path.join(assets_dir, "manifest.json")

def get_images(source_dir, prefix):
    images = []
    
    # Scan for processed image files
    if os.path.exists(source_dir):
        for f in os.listdir(source_dir):
            if f.startswith(prefix + "-") and f.lower().endswith(('.jpg', '.jpeg', '.png')):
                images.append(f)
                
    # Sort files numerically based on the index to preserve grid order
    # (e.g. table-10.jpg should come after table-9.jpg, rather than alphabetically before table-2.jpg)
    def extract_index(filename):
        try:
            parts = filename.split('-')
            if len(parts) > 1:
                num_part = parts[-1].split('.')[0]
                return int(num_part)
        except (ValueError, IndexError):
            pass
        return filename

    images.sort(key=extract_index)
    
    # Return paths relative to project root
    folder_name = os.path.basename(source_dir)
    return [f"assets/{folder_name}/{img}" for img in images]

def main():
    print("Generating asset manifest using standard library...")
    
    table_images = get_images(table_dir, "table")
    menu_images = get_images(menu_dir, "menu")
    
    manifest = {
        "table": table_images,
        "menus": menu_images
    }
    
    # Write manifest.json
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
        
    print(f"Manifest written to: {manifest_path}")
    print(f"Summary: Table Images = {len(table_images)}, Menu Images = {len(menu_images)}")

if __name__ == "__main__":
    main()
