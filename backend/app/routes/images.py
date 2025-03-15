from flask import Blueprint, request, jsonify, send_file, current_app, send_from_directory
from PIL import Image
import os
import cv2
import logging
import shutil

bp = Blueprint('images', __name__, url_prefix='/images')
UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_upload_path(filename):
    """Get absolute path for uploaded files"""
    return os.path.join(UPLOAD_FOLDER, filename)

@bp.route('/', methods=['GET'])
def get_images():
    """Get list of all uploaded images"""
    try:
        images = current_app.config['MONGO_DB'].images.find()
        return jsonify([{
            "_id": str(img["_id"]),
            "filename": img["filename"],
            "path": f"/images/uploads/{img['filename']}"
        } for img in images]), 200
    except Exception as e:
        logging.error(f"Database error: {str(e)}")
        return jsonify({"error": "Failed to retrieve images"}), 500

@bp.route('/uploads/<filename>')
def serve_image(filename):
    """Serve uploaded images"""
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

@bp.route('/upload', methods=['POST'])
def upload_images():
    """Handle image uploads"""
    if 'images' not in request.files:
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist('images')
    uploaded_files = []

    for file in files:
        if file.filename == '':
            continue

        try:
            # Validate image
            image = Image.open(file)
            image.verify()
            image = Image.open(file)  # Reopen after verification
            
            # Save file
            file_path = get_upload_path(file.filename)
            image.save(file_path)
            
            # Store in database
            current_app.config['MONGO_DB'].images.insert_one({
                "filename": file.filename,
                "original_filename": file.filename,
                "path": file_path
            })
            
            uploaded_files.append(file.filename)
        except Exception as e:
            logging.error(f"Upload error: {str(e)}")
            return jsonify({"error": f"Invalid image file: {file.filename}"}), 400

    return jsonify({
        "message": f"Successfully uploaded {len(uploaded_files)} images",
        "files": uploaded_files
    }), 201

@bp.route('/segmentation/<filename>', methods=['GET'])
def segmentation_mask(filename):
    """Generate segmentation mask"""
    try:
        file_path = get_upload_path(filename)
        if not os.path.exists(file_path):
            return jsonify({"error": "Image not found"}), 404

        # Process image
        image = cv2.imread(file_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray, int(request.args.get('threshold', 128)), 255, cv2.THRESH_BINARY)
        
        # Save mask
        mask_filename = f"mask_{filename}"
        mask_path = get_upload_path(mask_filename)
        cv2.imwrite(mask_path, mask)
        
        # Update database
        current_app.config['MONGO_DB'].images.update_one(
            {"filename": filename},
            {"$set": {"mask_path": f"/images/uploads/{mask_filename}"}}
        )
        
        return send_file(mask_path, mimetype='image/png')
    except Exception as e:
        logging.error(f"Segmentation error: {str(e)}")
        return jsonify({"error": "Image processing failed"}), 500

@bp.route('/manipulate/<filename>', methods=['POST'])
def manipulate_image(filename):
    """Handle image manipulations"""
    try:
        data = request.json
        original_path = get_upload_path(filename)
        
        if not os.path.exists(original_path):
            return jsonify({"error": "Image not found"}), 404

        with Image.open(original_path) as img:
            # Resize operation
            if 'resize' in data:
                try:
                    width = int(data['resize'][0])
                    height = int(data['resize'][1])
                    if width <= 0 or height <= 0:
                        raise ValueError
                    img = img.resize((width, height))
                except (ValueError, IndexError):
                    return jsonify({"error": "Invalid resize parameters"}), 400

            # Crop operation
            if 'crop' in data:
                try:
                    box = tuple(map(int, data['crop']))
                    if len(box) != 4:
                        raise ValueError
                    img = img.crop(box)
                except (ValueError, TypeError):
                    return jsonify({"error": "Invalid crop parameters"}), 400

            # Format conversion
            new_filename = filename
            if 'format' in data:
                format = data['format'].upper()
                if format not in ['JPEG', 'PNG', 'WEBP', 'BMP']:
                    return jsonify({"error": "Unsupported format"}), 400
                new_filename = f"{os.path.splitext(filename)[0]}.{format.lower()}"
            
            # Save manipulated image
            new_path = get_upload_path(new_filename)
            img.save(new_path, format=format if 'format' in data else img.format)
            
            # Update database if filename changed
            if new_filename != filename:
                current_app.config['MONGO_DB'].images.update_one(
                    {"filename": filename},
                    {"$set": {"filename": new_filename}}
                )
                # Remove old file
                os.remove(original_path)

            return send_file(new_path, mimetype=f'image/{img.format.lower()}')
    except Exception as e:
        logging.error(f"Manipulation error: {str(e)}")
        return jsonify({"error": "Image manipulation failed"}), 500

@bp.route('/<filename>', methods=['DELETE'])
def delete_image(filename):
    """Delete image and related files"""
    try:
        # Delete files
        files_to_delete = [
            get_upload_path(filename),
            get_upload_path(f"mask_{filename}")
        ]
        
        for file_path in files_to_delete:
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Delete database entry
        result = current_app.config['MONGO_DB'].images.delete_one({"filename": filename})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Image not found"}), 404
            
        return jsonify({"message": "Image deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Delete error: {str(e)}")
        return jsonify({"error": "Deletion failed"}), 500