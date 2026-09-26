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
import { Send, FilePlus } from 'lucide-react';
import './Report.css';

const ReportFound = () => {
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
    locationFound: '',
    dateFound: '',
    imageUrl: '',
    storageLocation: '',
    contactName: user?.name || '',
    contactEmail: user?.email || '',
    contactPhone: user?.phone || '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.title || !formData.category || !formData.color || !formData.description || !formData.locationFound || !formData.dateFound) {
        throw new Error('Please fill all required fields');
      }

      if (!formData.storageLocation) {
        throw new Error('Please specify the storage location');
      }

      const itemData = {
        type: 'found',
        reportedBy: user.id,
        status: 'active',
        title: formData.title,
        category: formData.category,
        color: formData.color,
        brand: formData.brand,
        description: formData.description,
        locationId: formData.locationFound,
        date: formData.dateFound,
        image: formData.imageUrl,
        handedToSecurity: true,
        storageLocation: formData.storageLocation,
        contactInfo: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone
        }
      };

      // Save to storage
      const newItem = storage.create(COLLECTIONS.FOUND_ITEMS, itemData);

      // Process for matching
      processNewItem(newItem, 'found');

      showToast(`Found item reported successfully (ID: ${newItem.id})`, 'success');
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
      <div className="report-header found-theme">
        <FilePlus size={32} className="report-icon" />
        <div>
          <h1>Report Found Item</h1>
          <p>Help return a lost item to its rightful owner.</p>
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
              placeholder="e.g., Blue College ID Card"
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
              placeholder="e.g., Titan, Milton, Fastrack"
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
            placeholder="Describe the item. DO NOT include sensitive information like full card numbers or exact contents that the owner should verify."
            required
            rows={4}
          />
        </div>

        {/* Location & Date */}
        <div className="form-section">
          <h3 className="form-section-title">Where & When</h3>
          <div className="form-grid">
            <Input
              label="Location Found *"
              name="locationFound"
              value={formData.locationFound}
              onChange={handleInputChange}
              placeholder="e.g., near the library entrance, Block C canteen"
              required
            />

            <Input 
              type="date"
              label="Date Found *" 
              name="dateFound"
              value={formData.dateFound}
              onChange={handleInputChange}
              max={today}
              required
            />
          </div>
        </div>

        {/* Photo */}
        <div className="form-section">
          <h3 className="form-section-title">Photo</h3>
          <p className="form-helper">Upload a photo for better matching accuracy</p>
          <ImageUpload
            onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
            value={formData.imageUrl}
          />
        </div>

        {/* Security Handover */}
        <div className="form-section">
          <h3 className="form-section-title">Security Handover</h3>
          <p className="form-helper">Please hand this item to the campus security office - they'll log it and set a verification question before anyone can claim it.</p>

          <div className="form-row mt-md">
            <Input
              label="Storage Location Details *"
              name="storageLocation"
              value={formData.storageLocation}
              onChange={handleInputChange}
              placeholder="e.g., Security Office, Block A, Locker #5"
              required
              fullWidth
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="form-section">
          <h3 className="form-section-title">Contact Information</h3>
          <p className="form-helper">In case someone needs to contact you regarding this item.</p>
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
            variant="success"
            size="lg"
            fullWidth 
            loading={loading}
            icon={<Send size={20} />}
          >
            Submit Found Report
          </Button>
        </div>

      </form>
    </div>
  );
};

export default ReportFound;
