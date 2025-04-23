import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Seller/Sidebar";
import { FiSave, FiArrowLeft, FiUpload, FiX } from "react-icons/fi";
import dashboardData from "../../assets/data/dashboardData.json";
import "../../assets/css/dashboard/dash.css";

export default function StoreSettings() {
  const navigate = useNavigate();
  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    storeDescription: "",
    storeLogo: "",
    storeBanner: "",
    contactEmail: "",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: ""
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set data from JSON file
        setStoreSettings(dashboardData.storeSettings);
        setLoading(false);
      } catch (err) {
        setError("Failed to load store settings");
        setLoading(false);
      }
    };

    fetchStoreSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith("socialMedia.")) {
      const socialMediaField = name.split(".")[1];
      setStoreSettings(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialMediaField]: value
        }
      }));
    } else {
      setStoreSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setStoreSettings(prev => ({
        ...prev,
        storeLogo: URL.createObjectURL(file)
      }));
    }
  };

  const handleBannerChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setStoreSettings(prev => ({
        ...prev,
        storeBanner: URL.createObjectURL(file)
      }));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setStoreSettings(prev => ({
      ...prev,
      storeLogo: dashboardData.storeSettings.storeLogo // Reset to default
    }));
  };

  const removeBanner = () => {
    setBannerFile(null);
    setStoreSettings(prev => ({
      ...prev,
      storeBanner: dashboardData.storeSettings.storeBanner // Reset to default
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Simulate API call with FormData
      const formData = new FormData();
      formData.append('storeName', storeSettings.storeName);
      formData.append('storeDescription', storeSettings.storeDescription);
      formData.append('contactEmail', storeSettings.contactEmail);
      formData.append('socialMedia', JSON.stringify(storeSettings.socialMedia));
      if (logoFile) formData.append('storeLogo', logoFile);
      if (bannerFile) formData.append('storeBanner', bannerFile);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage("Store settings updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="card loading-container">
            <div className="loading-spinner"></div>
            <p>Loading store settings...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="card error-content">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="button button-primary"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <div className="page-header">
          <h1 className="dashboard-header">Store Settings</h1>
          <button 
            onClick={() => navigate('/seller/dashboard')}
            className="button button-secondary"
          >
            <FiArrowLeft className="icon" /> Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card settings-form">
          {successMessage && (
            <div className="alert alert-success">
              {successMessage}
            </div>
          )}

          <div className="form-section">
            <h3 className="section-title">Store Information</h3>
            
            <div className="form-group">
              <label htmlFor="storeName" className="form-label">Store Name</label>
              <input
                type="text"
                id="storeName"
                name="storeName"
                value={storeSettings.storeName}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="storeDescription" className="form-label">Store Description</label>
              <textarea
                id="storeDescription"
                name="storeDescription"
                value={storeSettings.storeDescription}
                onChange={handleInputChange}
                rows={5}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactEmail" className="form-label">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={storeSettings.contactEmail}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Store Media</h3>
            
            <div className="form-group">
              <label htmlFor="storeLogo" className="form-label">Store Logo</label>
              <div className="file-upload-wrapper">
                <label className="file-upload-label">
                  <FiUpload className="icon" />
                  <span>{logoFile ? logoFile.name : "Choose logo"}</span>
                  <input
                    type="file"
                    id="storeLogo"
                    name="storeLogo"
                    onChange={handleLogoChange}
                    accept="image/*"
                    className="file-upload-input"
                  />
                </label>
                {storeSettings.storeLogo && (
                  <div className="image-preview-container">
                    <div className="image-preview">
                      <img
                        src={storeSettings.storeLogo}
                        alt="Store Logo Preview"
                        className="logo-preview"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="button button-danger button-icon remove-image-btn"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="storeBanner" className="form-label">Store Banner</label>
              <div className="file-upload-wrapper">
                <label className="file-upload-label">
                  <FiUpload className="icon" />
                  <span>{bannerFile ? bannerFile.name : "Choose banner"}</span>
                  <input
                    type="file"
                    id="storeBanner"
                    name="storeBanner"
                    onChange={handleBannerChange}
                    accept="image/*"
                    className="file-upload-input"
                  />
                </label>
                {storeSettings.storeBanner && (
                  <div className="image-preview-container">
                    <div className="image-preview">
                      <img
                        src={storeSettings.storeBanner}
                        alt="Store Banner Preview"
                        className="banner-preview"
                      />
                      <button
                        type="button"
                        onClick={removeBanner}
                        className="button button-danger button-icon remove-image-btn"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Social Media</h3>
            
            <div className="form-group">
              <label htmlFor="facebook" className="form-label">Facebook</label>
              <div className="input-with-prefix">
                <span className="prefix">facebook.com/</span>
                <input
                  type="text"
                  id="facebook"
                  name="socialMedia.facebook"
                  value={storeSettings.socialMedia.facebook}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="yourpage"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="instagram" className="form-label">Instagram</label>
              <div className="input-with-prefix">
                <span className="prefix">instagram.com/</span>
                <input
                  type="text"
                  id="instagram"
                  name="socialMedia.instagram"
                  value={storeSettings.socialMedia.instagram}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="yourhandle"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="twitter" className="form-label">Twitter</label>
              <div className="input-with-prefix">
                <span className="prefix">twitter.com/</span>
                <input
                  type="text"
                  id="twitter"
                  name="socialMedia.twitter"
                  value={storeSettings.socialMedia.twitter}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="yourhandle"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button button-primary"
              disabled={saving}
            >
              <FiSave className="icon" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}