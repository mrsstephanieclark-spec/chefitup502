import os
import json
from PIL import Image, ImageOps, ImageEnhance

# Paths
base_dir = os.path.dirname(os.path.abspath(__file__))
assets_dir = os.path.join(base_dir, "assets")
table_dir = os.path.join(assets_dir, "at-the-table")
menu_dir = os.path.join(assets_dir, "custom-menus")
manifest_path = os.path.join(assets_dir, "manifest.json")

def process_directory(source_dir, output_prefix):
    # Find all original raw images (excluding existing processed outputs and hidden files)
    raw_files = []
    for f in os.listdir(source_dir):
        if f.startswith('.') or f.startswith(output_prefix + '-'):
            continue
        if f.lower().endswith(('.jpg', '.jpeg', '.png')):
            raw_files.append(f)
            
    # Sort files to ensure stable ordering
    raw_files.sort()
    
    processed_urls = []
    
    print(f"Found {len(raw_files)} raw files in {source_dir}. Processing...")
    
    for idx, filename in enumerate(raw_files):
        source_path = os.path.join(source_dir, filename)
        target_name = f"{output_prefix}-{idx+1}.jpg"
        target_path = os.path.join(source_dir, target_name)
        
        try:
            img = Image.open(source_path)
            if img.mode != 'RGB':
                img = img.convert('RGB')
                
            # Visual Enhancements
            img = ImageOps.autocontrast(img, cutoff=0.5)
            img = ImageEnhance.Color(img).enhance(1.1)
            img = ImageEnhance.Contrast(img).enhance(1.05)
            img = ImageEnhance.Sharpness(img).enhance(1.25)
            
            # Crop to 4:3 card grid aspect ratio
            width, height = img.size
            target_aspect = 4.0 / 3.0
            current_aspect = float(width) / float(height)
            
            if current_aspect > target_aspect:
                new_width = int(height * target_aspect)
                left = (width - new_width) // 2
                top = 0
                right = left + new_width
                bottom = height
            else:
                new_height = int(width / target_aspect)
                left = 0
                top = (height - new_height) // 2
                right = width
                bottom = top + new_height
                
            img = img.crop((left, top, right, bottom))
            
            # Scale down to 800x600 for high quality but lightweight web performance
            img = img.resize((800, 600), Image.Resampling.LANCZOS)
            
            # Save compressed file
            img.save(target_path, "JPEG", quality=85, optimize=True)
            
            # Use relative paths for the client browser
            rel_path = f"assets/{os.path.basename(source_dir)}/{target_name}"
            processed_urls.append(rel_path)
            
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            
    print(f"Successfully processed {len(processed_urls)} files.")
    return processed_urls

def main():
    print("Starting assets compilation and build step...")
    
    # Process At the Table images
    table_urls = process_directory(table_dir, "table")
    
    # Process Custom Menus images
    menu_urls = process_directory(menu_dir, "menu")
    
    # Build manifest object
    manifest = {
        "table": table_urls,
        "menus": menu_urls
    }
    
    # Save manifest.json
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
        
    print(f"Manifest written successfully to: {manifest_path}")
    print(f"Summary: 'At the Table' count = {len(table_urls)}, 'Custom Menus' count = {len(menu_urls)}")

if __name__ == "__main__":
    main()
