import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '@chakra-ui/toast';
import './ImageUploader.css';

const ImageUploader = ({ fetchImages }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files.length) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      await axios.post('http://localhost:5000/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      fetchImages();
      toast({
        title: 'Upload Successful',
        description: `${files.length} images uploaded`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setFiles([]);
    }
  };

  return (
    <div className="image-uploader-container">
      <label className="file-input-label">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="file-input"
          accept="image/*"
        />
        <div className="file-input-display">
          <span className="file-input-text">
            {files.length ? (
              <>
                <strong>{files.length}</strong> {files.length > 1 ? 'files' : 'file'} selected
              </>
            ) : (
              'Drag & drop files or click to browse'
            )}
          </span>
        </div>
      </label>
      <button
        onClick={handleUpload}
        disabled={isUploading || !files.length}
        className="upload-button"
      >
        {isUploading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            Uploading...
          </div>
        ) : (
          'Upload Images'
        )}
      </button>
    </div>
  );
};

export default ImageUploader;