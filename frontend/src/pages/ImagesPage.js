import React, { useState } from 'react';
import ImageGallery from '../components/Images/ImageGallery';
import ImageUploader from '../components/Images/ImageUploader';
import '../styles/components/ImagesPage.css';

const ImagePage = () => {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="images-page-container">
      <h1 className="page-title">Image Management</h1>
      <ImageUploader fetchImages={() => setRefresh(!refresh)} />
      <ImageGallery key={refresh} />
    </div>
  );
};

export default ImagePage;