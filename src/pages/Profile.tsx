import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit, Camera, X, Check } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getCurrentUser, updateCurrentUser } from '../utils/localStorageService';
import { saveFile, FILE_STORAGE_KEYS, getAllFiles } from '../utils/fileStorage';

const Profile: React.FC = () => {
  // Initialize with empty data that will be filled from local storage
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    joinDate: '',
    profileImage: null as string | null,
    referralCode: '',
    kycStatus: ''
  });

  const [dataLoaded, setDataLoaded] = useState(false);

  // Load user data from local storage
  useEffect(() => {
    const loadUserData = () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser({
          id: currentUser.id || '',
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          address: currentUser.address || '',
          joinDate: currentUser.registrationDate || new Date().toISOString().split('T')[0],
          profileImage: null,
          referralCode: currentUser.referralCode || '',
          kycStatus: currentUser.kycStatus || 'pending'
        });

        // Load profile image if exists
        const profileImages = getAllFiles(FILE_STORAGE_KEYS.PROFILE_IMAGES);
        if (profileImages.length > 0) {
          setUser(prev => ({
            ...prev,
            profileImage: profileImages[profileImages.length - 1].base64
          }));
        }

        setDataLoaded(true);
      }
    };

    loadUserData();
  }, []);

  // Add state for checkboxes
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...user });
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [uploadedProfileImage, setUploadedProfileImage] = useState<File | null>(null);
  
  // Update form data when user data is loaded
  useEffect(() => {
    if (dataLoaded) {
      setEditFormData({ ...user });
    }
  }, [dataLoaded, user]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedProfileImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({ ...user });
    setProfileImagePreview(null);
    setUploadedProfileImage(null);
  };

  const handleSaveChanges = async () => {
    try {
      // First check if we need to upload a profile image
      let profileImageUrl = user.profileImage;
      
      if (uploadedProfileImage) {
        const savedImage = await saveFile(uploadedProfileImage, FILE_STORAGE_KEYS.PROFILE_IMAGES);
        profileImageUrl = savedImage.base64;
      } else if (profileImagePreview) {
        profileImageUrl = profileImagePreview;
      }
      
      // Update user in local state
      const updatedUser = {
        ...editFormData,
        profileImage: profileImageUrl
      };
      
      setUser(updatedUser);
      
      // Update user in local storage (make sure to combine with existing user data)
      const currentUserData = getCurrentUser();
      if (currentUserData) {
        const updatedUserData = {
          ...currentUserData,
          name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone,
          address: editFormData.address,
          // Don't update fields like id, registrationDate, referralCode, etc.
        };
        
        // Save to local storage
        updateCurrentUser(updatedUserData);
      }
      
      setIsEditing(false);
      setProfileImagePreview(null);
      setUploadedProfileImage(null);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile changes:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  if (!dataLoaded) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-neutral-600">Loading profile information...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Your Profile</h1>
        <p className="text-neutral-600">View and update your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center p-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfileImageChange}
            />
            <div 
              className={`relative w-32 h-32 bg-neutral-200 rounded-full flex items-center justify-center mb-4 ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={isEditing ? handleProfileImageClick : undefined}
            >
              {profileImagePreview || user.profileImage ? (
                <img 
                  src={profileImagePreview || user.profileImage || ''} 
                  alt={user.name} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <User className="h-16 w-16 text-neutral-400" />
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white">
                  <Camera className="h-8 w-8" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">{user.name}</h2>
            <p className="text-neutral-500 mb-4">Member since {new Date(user.joinDate).toLocaleDateString()}</p>
            
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<Edit className="h-4 w-4" />}
                fullWidth
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <div className="w-full space-y-2">
                <Button 
                  variant="primary" 
                  size="sm" 
                  leftIcon={<Check className="h-4 w-4" />}
                  fullWidth
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<X className="h-4 w-4" />}
                  fullWidth
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-neutral-500">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm text-neutral-500">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm text-neutral-500">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm text-neutral-500">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={editFormData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start">
                  <div className="p-2 bg-primary-50 rounded-full text-primary-600 mr-3">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Full Name</p>
                    <p className="font-medium text-neutral-900">{user.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="p-2 bg-primary-50 rounded-full text-primary-600 mr-3">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Email Address</p>
                    <p className="font-medium text-neutral-900">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="p-2 bg-primary-50 rounded-full text-primary-600 mr-3">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Phone Number</p>
                    <p className="font-medium text-neutral-900">{user.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="p-2 bg-primary-50 rounded-full text-primary-600 mr-3">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Address</p>
                    <p className="font-medium text-neutral-900">{user.address}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Account Details */}
        <Card className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Account Settings</h3>
            <Button 
              variant="outline" 
              size="sm"
            >
              Change Password
            </Button>
          </div>
          
          <div className="border-t border-neutral-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">Email Notifications</p>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="emailNotifications" className="ml-2 text-sm font-medium text-neutral-700">
                    Receive email notifications
                  </label>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Two-Factor Authentication</p>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="twoFactorAuth" className="ml-2 text-sm font-medium text-neutral-700">
                    Enable two-factor authentication
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile; 