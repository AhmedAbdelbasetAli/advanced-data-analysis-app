import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@chakra-ui/toast';
import './ImageGallery.css';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [histogram, setHistogram] = useState(null);
  const [mask, setMask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manipulationParams, setManipulationParams] = useState({ threshold: 128 });
  const toast = useToast();

  const fetchImages = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/images/');
      setImages(response.data);
    } catch (error) {
      toast({
        title: 'Error loading images',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const deleteImage = async (filename) => {
    try {
      await axios.delete(`http://localhost:5000/images/${filename}`);
      toast({
        title: 'Image deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      fetchImages();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchHistogram = async (filename) => {
    try {
      const response = await axios.get(`http://localhost:5000/images/histogram/${filename}`);
      setHistogram(response.data.histogram);
      setSelectedImage(filename);
    } catch (error) {
      toast({
        title: 'Histogram error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchSegmentationMask = async (filename) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/images/segmentation/${filename}`,
        { 
          params: { threshold: manipulationParams.threshold },
          responseType: 'blob' 
        }
      );
      const imageUrl = URL.createObjectURL(response.data);
      setMask(imageUrl);
      setSelectedImage(filename);
      toast({
        title: 'Mask generated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Segmentation failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderHistogramChart = () => {
    if (!histogram) return null;
    
    const rgbData = Array.from({ length: 256 }, (_, i) => ({
      value: i,
      red: histogram[i],
      green: histogram[i + 256],
      blue: histogram[i + 512]
    }));

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rgbData}>
            <XAxis dataKey="value" stroke="#ffffff" />
            <YAxis stroke="#ffffff" />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '0.75rem',
              }}
            />
            <Line type="monotone" dataKey="red" stroke="#ff0000" dot={false} />
            <Line type="monotone" dataKey="green" stroke="#00ff00" dot={false} />
            <Line type="monotone" dataKey="blue" stroke="#0000ff" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    );
  };

  return (
    <div className="image-gallery-container">
      <div className="image-grid">
        <AnimatePresence>
          {images.map((image) => (
            <motion.div
              key={image._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="image-card"
            >
              <div className="image-card-inner">
                <img
                  src={`http://localhost:5000/images/uploads/${image.filename}`}
                  alt={image.filename}
                  className="image-preview"
                  onClick={() => setSelectedImage(image.filename)}
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(image.filename);
                  }}
                  className="delete-button"
                  aria-label="Delete image"
                >
                  ✕
                </button>
              </div>
              
              <div className="image-card-content">
                <p className="image-filename">{image.filename}</p>
                
                <div className="action-buttons">
                  <button 
                    onClick={() => fetchHistogram(image.filename)}
                    className="action-button histogram-button"
                  >
                    Histogram
                  </button>
                  <button
                    onClick={() => fetchSegmentationMask(image.filename)}
                    disabled={isLoading}
                    className="action-button segment-button"
                  >
                    {isLoading ? 'Processing...' : 'Segment'}
                  </button>
                </div>

                <ImageManipulationForm 
                  filename={image.filename}
                  onParamsChange={setManipulationParams}
                  onSuccess={fetchImages}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {selectedImage && (
        <motion.div 
          className="image-details"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="details-title">{selectedImage}</h2>
          {renderHistogramChart()}
          {mask && (
            <motion.img 
              src={mask} 
              alt="Segmentation Mask"
              className="mask-preview"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            />
          )}
        </motion.div>
      )}
    </div>
  );
};

const ImageManipulationForm = ({ filename, onParamsChange, onSuccess }) => {
  const [params, setParams] = useState({
    resize: ['', ''],
    crop: ['', '', '', ''],
    format: 'png',
    threshold: 128
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const validateInputs = () => {
    const newErrors = {};
    
    if (params.resize[0] && (isNaN(params.resize[0]) || params.resize[0] <= 0)) {
      newErrors.resizeWidth = "Invalid width value";
    }
    if (params.resize[1] && (isNaN(params.resize[1]) || params.resize[1] <= 0)) {
      newErrors.resizeHeight = "Invalid height value";
    }
    
    if (params.crop.some(v => isNaN(v) || v === '')) {
      newErrors.crop = "All crop values must be numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsProcessing(true);
    try {
      const payload = {
        ...(params.resize[0] && params.resize[1] && { resize: params.resize.map(Number) }),
        ...(params.crop.every(v => v !== '') && { crop: params.crop.map(Number) }),
        ...(params.format && { format: params.format })
      };

      await axios.post(
        `http://localhost:5000/images/manipulate/${filename}`,
        payload
      );
      
      onSuccess();
      setErrors({});
      toast({
        title: 'Manipulation successful',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Manipulation failed',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="image-manipulation-form">
      <div className="form-group">
        <label className="form-label">Resize</label>
        <div className="resize-inputs">
          <input
            type="number"
            min="1"
            placeholder="Width"
            className={`form-input ${errors.resizeWidth ? 'error' : ''}`}
            value={params.resize[0]}
            onChange={(e) => setParams(p => ({...p, resize: [e.target.value, p.resize[1]]}))}
          />
          <input
            type="number"
            min="1"
            placeholder="Height"
            className={`form-input ${errors.resizeHeight ? 'error' : ''}`}
            value={params.resize[1]}
            onChange={(e) => setParams(p => ({...p, resize: [p.resize[0], e.target.value]}))}
          />
        </div>
        {errors.resizeWidth && <span className="error-message">{errors.resizeWidth}</span>}
        {errors.resizeHeight && <span className="error-message">{errors.resizeHeight}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Crop (L-T-R-B)</label>
        <div className="crop-inputs">
          {['left', 'top', 'right', 'bottom'].map((label, index) => (
            <input
              key={label}
              type="number"
              placeholder={label}
              className={`form-input ${errors.crop ? 'error' : ''}`}
              value={params.crop[index]}
              onChange={(e) => {
                const newCrop = [...params.crop];
                newCrop[index] = e.target.value;
                setParams(p => ({...p, crop: newCrop}));
              }}
            />
          ))}
        </div>
        {errors.crop && <span className="error-message">{errors.crop}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Format</label>
        <select
          className="form-input"
          value={params.format}
          onChange={(e) => setParams(p => ({...p, format: e.target.value}))}
        >
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="webp">WEBP</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="submit-button"
      >
        {isProcessing ? 'Applying Changes...' : 'Apply Changes'}
      </button>
    </form>
  );
};

export default ImageGallery;