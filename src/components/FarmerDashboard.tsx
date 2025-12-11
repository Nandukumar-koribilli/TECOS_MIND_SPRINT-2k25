// frontend/src/pages/FarmerDashboard.tsx (FIXED AND SYNCHRONIZED)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  MapPin,
  DollarSign,
  Droplet,
  Mountain,
  Phone,
  Mail,
} from "lucide-react";

// ✅ Redux/RTK Query Imports
import { useAppSelector } from "../hooks/useAppHooks";
import { useGetProfileQuery, useUpdateProfileMutation } from "../api/userApi";
import { useGetLandsQuery } from "../api/landApi";
import { Land, UserProfile } from "../types";

// --- Local State Definitions ---
interface FarmerFormData {
  full_name: string;
  email: string;
  phone: string;
  address_line: string;
  experience_years: string;
}

interface SelectedLandState extends Land {
  profiles?: UserProfile;
}

export const FarmerDashboard: React.FC = () => {
  // 1. Get User ID and Auth State from Redux
  const userAuth = useAppSelector((state) => state.auth.user);
  const userId = userAuth?.id || ""; // 2. RTK Query Hooks for Data Fetching and Mutations

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useGetProfileQuery(userId, { skip: !userId });

  const {
    data: allLands, // Fetches all available lands (GET /api/lands)
    isLoading: isLoadingLands,
    refetch: refetchLands,
  } = useGetLandsQuery(undefined);

  const [updateProfile, { isLoading: isSavingProfile }] =
    useUpdateProfileMutation();

  const [selectedLand, setSelectedLand] = useState<SelectedLandState | null>(
    null
  );
  const [showContactModal, setShowContactModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);

  const [formData, setFormData] = useState<FarmerFormData>({
    full_name: "",
    email: "",
    phone: "",
    address_line: "",
    experience_years: "",
  }); // 3. Sync Form State with Profile Data

  useEffect(() => {
    if (profileData) {
      const addressString = profileData.address
        ? `${profileData.address.street_address || ""}, ${
            profileData.address.city || ""
          }, ${profileData.address.state_province || ""}`
        : "";

      setFormData({
        full_name: profileData.full_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address_line: addressString,
        experience_years: "",
      });
    }
  }, [profileData]); // 4. Filter Lands (Memoized)

  const availableLands = useMemo(() => {
    return allLands
      ? allLands.filter((land) => land.status === "available")
      : [];
  }, [allLands]); // 5. Handlers // CORE HANDLER: Securely fetch landowner profile

  const handleContactLandowner = useCallback(async (land: Land) => {
    setShowContactModal(true);
    setSelectedLand({ ...land, profiles: undefined });
    setLoadingContact(true);

    try {
      const token = localStorage.getItem("token"); // This fetch is now permitted by the backend's relaxed GET /api/profile/:id route
      const response = await fetch(
        `http://localhost:8000/api/profile/${land.owner_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch contact. Status: ${response.status}`);
      }

      const ownerProfile: UserProfile = await response.json();
      setSelectedLand({ ...land, profiles: ownerProfile });
    } catch (error) {
      console.error("Error fetching landowner details:", error);
      alert(
        `Failed to fetch landowner contact details. Error: ${
          error instanceof Error ? error.message : "Unknown"
        }`
      );
      setShowContactModal(false);
    } finally {
      setLoadingContact(false);
    }
  }, []);

  const handleSaveProfile = async () => {
    if (!userId || isSavingProfile) return;
    try {
      await updateProfile({
        userId,
        updates: {
          full_name: formData.full_name,
          phone: formData.phone,
        },
      }).unwrap();

      await refetchProfile();
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Check console for details.");
    }
  }; // Auxiliary Contact Handlers

  const handleCallLandowner = () => {
    if (selectedLand?.profiles?.phone) {
      window.open(`tel:${selectedLand.profiles.phone}`);
    }
  };
  const handleEmailLandowner = () => {
    if (selectedLand?.profiles?.email) {
      window.open(
        `mailto:${selectedLand.profiles.email}?subject=Interest in Land: ${selectedLand.title}`
      );
    }
  };
  const handleCopyContactInfo = () => {
    const landowner = selectedLand?.profiles;
    const contactText = `Owner Name: ${landowner?.full_name || "N/A"}\nPhone: ${
      landowner?.phone || "N/A"
    }\nEmail: ${landowner?.email || "N/A"}`;
    navigator.clipboard
      .writeText(contactText.trim())
      .then(() => alert("Contact info copied!"));
  }; // --- RENDER BLOCK ---

  if (isLoadingProfile || isLoadingLands) {
    return (
      <div className="flex items-center justify-center min-h-screen">
              
        <div className="text-lg text-gray-600">Loading Dashboard Data...</div> 
          
      </div>
    );
  }

  if (!userAuth) {
    return (
      <div className="p-10 text-red-600">
                Please log in to view this dashboard.     
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
          
      <div className="mb-8">
              
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Farmer Dashboard       
        </h1>
              
        <p className="text-gray-600">
                    Manage your profile and explore available lands       
        </p>
            
      </div>
            {/* Profile Editing Section */}    
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              
        <div className="flex justify-between items-center mb-6">
                  
          <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>   
              
          <button
            onClick={() => (editing ? handleSaveProfile() : setEditing(true))}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={isSavingProfile}
          >
                      
            {isSavingProfile
              ? "Saving..."
              : editing
              ? "Save Profile"
              : "Edit Profile"}
                    
          </button>
                
        </div>
                {/* Profile Form UI */}      
        <div className="grid md:grid-cols-2 gap-6">
                  
          <div>
                      
            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name           
            </label>
                      
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              disabled={!editing}
              className="w-full px-4 py-2 border disabled:bg-gray-50 rounded-lg"
            />
                    
          </div>
                  
          <div>
                      
            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address           
            </label>
                      
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 border disabled:bg-gray-100 rounded-lg"
            />
                    
          </div>
                  
          <div>
                      
            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number           
            </label>
                      
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={!editing}
              className="w-full px-4 py-2 border disabled:bg-gray-50 rounded-lg"
            />
                    
          </div>
                  
          <div>
                      
            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Experience (years)           
            </label>
                      
            <input
              type="number"
              value={formData.experience_years}
              onChange={(e) =>
                setFormData({ ...formData, experience_years: e.target.value })
              }
              disabled={!editing}
              className="w-full px-4 py-2 border disabled:bg-gray-50 rounded-lg"
            />
                    
          </div>
                  
          <div className="md:col-span-2">
                      
            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address (Simplified)           
            </label>
                      
            <textarea
              value={formData.address_line}
              onChange={(e) =>
                setFormData({ ...formData, address_line: e.target.value })
              }
              disabled={!editing}
              rows={2}
              className="w-full px-4 py-2 border disabled:bg-gray-50 rounded-lg"
            />
                    
          </div>
                
        </div>
            
      </div>
            {/* Available Lands Section */}    
      <div className="bg-white rounded-xl shadow-md p-6">
              
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Available Lands       
        </h2>
              
        <button
          onClick={refetchLands}
          className="px-4 py-2 mb-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
                    Refresh Lands       
        </button>
              
        {availableLands.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
                        No available lands found.         
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      
            {availableLands.map((land) => (
              <div
                key={land._id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
              >
                                {/* Land Listing Display */}              
                <div className="flex justify-between items-start mb-3">
                                  
                  <h3 className="text-xl font-bold text-gray-900">
                                        {land.title}                
                  </h3>
                                  
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                        Available                 
                  </span>
                                
                </div>
                              
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {land.description}              
                </p>
                              
                <div className="space-y-2 mb-4">
                                    {/* Display structured address fields */}   
                              
                  <div className="flex items-center text-gray-700">
                                      
                    <MapPin className="w-4 h-4 mr-2 text-green-600" />          
                            
                    <span className="text-sm">
                                          
                      {/* 🌟 FIX: Added optional chaining to 'land.location' 🌟 */}
                                            {land.location?.city || "N/A"},{" "}
                      {land.location?.state_province || "N/A"}                 
                      
                    </span>
                                    
                  </div>
                                  
                  <div className="flex items-center text-gray-700">
                                      
                    <Mountain className="w-4 h-4 mr-2 text-green-600" />        
                              
                    <span className="text-sm">{land.area} acres</span>         
                          
                  </div>
                                  
                  {land.price_per_acre && (
                    <div className="flex items-center text-gray-700">
                                          
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />    
                                      
                      <span className="text-sm">
                                                ₹
                        {land.price_per_acre.toLocaleString()}/acre            
                                
                      </span>
                                        
                    </div>
                  )}
                                  
                  <div className="flex items-center text-gray-700">
                                      
                    <Droplet className="w-4 h-4 mr-2 text-green-600" />        
                              
                    <span className="text-sm">{land.water_availability}</span> 
                                  
                  </div>
                                
                </div>
                              
                <button
                  onClick={() => handleContactLandowner(land)}
                  className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                                    <Phone className="w-4 h-4" />{" "}
                  <span>Contact Owner</span>              
                </button>
                            
              </div>
            ))}
                    
          </div>
        )}
            
      </div>
            {/* Contact Modal */}    
      {showContactModal && selectedLand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                      
            <div className="flex justify-between items-center mb-4">
                          
              <h3 className="text-xl font-bold text-gray-900">
                                Contact Landowner             
              </h3>
                          
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                                ✕             
              </button>
                        
            </div>
                      
            {loadingContact || !selectedLand.profiles ? (
              <div className="text-center py-8">
                              
                <div className="text-gray-600">Loading contact details...</div> 
                          
              </div>
            ) : (
              <>
                              
                <div className="mb-6 space-y-4">
                                  
                  <div className="bg-gray-50 rounded-lg p-4">
                                      
                    <h4 className="font-semibold text-gray-800 mb-3">
                                            Landowner Details                  
                      
                    </h4>
                                      
                    <p className="text-gray-700">
                                          
                      <span className="font-medium">Name:</span>                
                            {selectedLand.profiles?.full_name || "Not provided"}
                                        
                    </p>
                                      
                    <p className="text-gray-700">
                                          
                      <span className="font-medium">Phone:</span>              
                              {selectedLand.profiles?.phone || "Not provided"} 
                                      
                    </p>
                                      
                    <p className="text-gray-700">
                                          
                      <span className="font-medium">Email:</span>              
                              {selectedLand.profiles?.email || "Not provided"} 
                                      
                    </p>
                                    
                  </div>
                                
                </div>
                              
                <div className="flex flex-wrap gap-3">
                                  
                  {selectedLand.profiles?.phone && (
                    <button
                      onClick={handleCallLandowner}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                                            <Phone className="w-4 h-4" />{" "}
                      <span>Call</span>                  
                    </button>
                  )}
                                  
                  {selectedLand.profiles?.email && (
                    <button
                      onClick={handleEmailLandowner}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                                            <Mail className="w-4 h-4" />{" "}
                      <span>Email</span>                  
                    </button>
                  )}
                                  
                  <button
                    onClick={handleCopyContactInfo}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                                        <span>Copy Details</span>               
                    
                  </button>
                                
                </div>
                            
              </>
            )}
                    
          </div>
                
        </div>
      )}
        
    </div>
  );
};
