import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
// Need a stub since the actual file isn't created yet or might be created by another agent
// import { compressImage } from '../../utils/helpers';
const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
};

import './ImageUpload.css';

const ImageUpload = ({ value, onChange, error, maxSizeMB = 2 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState('');
  const fileInputRef = useRef(null);

  const displayError = error || internalError;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file) => {
    setInternalError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setInternalError('Please upload an image file');
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setInternalError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    try {
      const base64String = await compressImage(file);
      onChange(base64String);
    } catch (err) {
      setInternalError('Error processing image');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-wrapper">
      <div 
        className={`image-upload-zone ${isDragging ? 'dragging' : ''} ${value ? 'has-value' : ''} ${displayError ? 'has-error' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !value && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden-file-input"
          style={{ display: 'none' }}
        />
        
        {value ? (
          <div className="image-upload-preview">
            <img src={value} alt="Preview" />
            <div className="image-upload-overlay">
              <button 
                type="button"
                className="image-remove-btn"
                onClick={handleRemove}
                aria-label="Remove image"
              >
                <X size={20} /> Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="image-upload-placeholder">
            <Upload size={32} className="image-upload-icon" />
            <p>Drag & drop or click to upload</p>
            <span className="image-upload-hint">Max size: {maxSizeMB}MB</span>
          </div>
        )}
      </div>
      {displayError && <div className="input-error">{displayError}</div>}
    </div>
  );
};

export default ImageUpload;
