import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/ToastProvider';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ImageUpload from '../components/Common/ImageUpload';
import { CATEGORIES } from '../utils/constants';
import storage, { COLLECTIONS } from '../services/storage';
import { processNewItem } from '../services/matchingEngine';
import { AlertTriangle, Send } from 'lucide-react';
import './Report.css';

const ReportLost = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    color: '',
    brand: '',
    description: '',
    locationLost: '',
    dateLost: '',
    imageUrl: '',
    contactName: user?.name || '',
    contactEmail: user?.email || '',
    contactPhone: user?.phone || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.title || !formData.category || !formData.color || !formData.description || !formData.locationLost || !formData.dateLost) {
        throw new Error('Please fill all required fields');
      }

      const itemData = {
        type: 'lost',
        reportedBy: user.id,
        status: 'active',
        title: formData.title,
        category: formData.category,
        color: formData.color,
        brand: formData.brand,
        description: formData.description,
        locationId: formData.locationLost,
        date: formData.dateLost,
        image: formData.imageUrl,
        contactInfo: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone
        }
      };

      // Save to storage
      const newItem = storage.create(COLLECTIONS.LOST_ITEMS, itemData);

      // Process for matching
      processNewItem(newItem, 'lost');

      showToast(`Lost item reported successfully (ID: ${newItem.id})`, 'success');
      navigate('/my-reports');
      
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get max date for date picker (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="report-page">
      <div className="report-header lost-theme">
        <AlertTriangle size={32} className="report-icon" />
        <div>
          <h1>Report Lost Item</h1>
          <p>Provide details about the item you lost to help us find it.</p>
        </div>
      </div>

      <form className="report-form" onSubmit={handleSubmit}>
        
        {/* Item Details */}
        <div className="form-section">
          <h3 className="form-section-title">Item Details</h3>
          
          <div className="form-row">
            <Input 
              label="Item Title *" 
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Black Dell Laptop"
              required
              fullWidth
            />
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleInputChange} required className="form-select">
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <Input
              label="Primary Color *"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              placeholder="e.g., black, cyan, maroon"
              required
            />
          </div>

          <div className="form-row mt-md">
            <Input 
              label="Brand / Model (Optional)" 
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g., Apple, Casio, Nike"
              fullWidth
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-section">
          <h3 className="form-section-title">Description *</h3>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Describe your item in detail - any distinguishing features, marks, contents..."
            required
            rows={4}
          />
        </div>

        {/* Location & Date */}
        <div className="form-section">
          <h3 className="form-section-title">Where & When</h3>
          <div className="form-grid">
            <Input
              label="Location Lost *"
              name="locationLost"
              value={formData.locationLost}
              onChange={handleInputChange}
              placeholder="e.g., near the library entrance, Block C canteen"
              required
            />

            <Input 
              type="date"
              label="Date Lost *" 
              name="dateLost"
              value={formData.dateLost}
              onChange={handleInputChange}
              max={today}
              required
            />
          </div>
        </div>

        {/* Photo */}
        <div className="form-section">
          <h3 className="form-section-title">Photo (Optional)</h3>
          <p className="form-helper">Upload a photo for better matching accuracy</p>
          <ImageUpload
            onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
            value={formData.imageUrl}
          />
        </div>

        {/* Contact Info */}
        <div className="form-section">
          <h3 className="form-section-title">Contact Information</h3>
          <p className="form-helper">How should the finder reach you?</p>
          <div className="form-grid">
            <Input 
              label="Name" 
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              required
            />
            <Input 
              type="email"
              label="Email" 
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              required
            />
            <Input 
              type="tel"
              label="Phone Number" 
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="report-submit">
          <Button 
            type="submit" 
            variant="danger"
            size="lg"
            fullWidth 
            loading={loading}
            icon={<Send size={20} />}
          >
            Submit Lost Report
          </Button>
        </div>

      </form>
    </div>
  );
};

export default ReportLost;
