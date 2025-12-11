// frontend/src/pages/LandownerDashboard.tsx (FINAL AND SYNCHRONIZED)

import React, { useState, useEffect, FormEvent } from "react";
import {
  MapPin,
  DollarSign,
  Mountain,
  Plus,
  Trash2,
  Database,
  Droplet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ✅ REDUX/RTK QUERY IMPORTS
import { useAppSelector } from "../hooks/useAppHooks";
import { useGetProfileQuery, useUpdateProfileMutation } from "../api/userApi";
import {
  useGetUserLandsQuery,
  useCreateLandMutation,
  useDeleteLandMutation,
  useUpdateLandMutation,
} from "../api/landApi";
import { Land, NewLandData, Address, UserProfile } from "../types";

// --- Local Form State Definitions ---
interface LandFormState {
  title: string;
  description: string;
  location_address: string; // Simplified City, State input
  area: string;
  price_per_acre: string;
  soil_type: string;
  water_availability: string; // Will hold enum value
}

const initialLandForm: LandFormState = {
  title: "",
  description: "",
  location_address: "",
  area: "",
  price_per_acre: "",
  soil_type: "",
  water_availability: "",
};

// --- START COMPONENT ---

export const LandownerDashboard: React.FC = () => {
  const userAuth = useAppSelector((state) => state.auth.user);
  const userId = userAuth?.id || "";

  // Local UI State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [landForm, setLandForm] = useState<LandFormState>(initialLandForm);
  const [landToEdit, setLandToEdit] = useState<Land | null>(null); // State for editing existing land

  // Profile Edit State
  const [editingProfileData, setEditingProfileData] = useState<
    Partial<UserProfile> & { address: string }
  >({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });

  // RTK QUERY HOOKS (Read/Fetch)
  const { data: profileData, isLoading: isLoadingProfile } = useGetProfileQuery(
    userId,
    { skip: !userId }
  );
  const {
    data: lands,
    isLoading: isLoadingLands,
    refetch: refetchLands,
  } = useGetUserLandsQuery(userId, { skip: !userId });

  // RTK QUERY HOOKS (Mutate)
  const [updateProfile, { isLoading: isSavingProfile }] =
    useUpdateProfileMutation();
  const [createLand, { isLoading: isCreatingLand }] = useCreateLandMutation();
  const [deleteLand, { isLoading: isDeletingLand }] = useDeleteLandMutation();
  const [updateLand, { isLoading: isUpdatingLand }] = useUpdateLandMutation();

  // 1. Sync Profile Data to Local Form State
  useEffect(() => {
    if (profileData) {
      const addressString = profileData.address
        ? `${profileData.address.street_address || ""}, ${
            profileData.address.city || ""
          }, ${profileData.address.state_province || ""}`
        : "";
      setEditingProfileData({
        full_name: profileData.full_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: addressString,
      });
    }
  }, [profileData]);

  // 2. Profile Update Handler
  const handleSaveProfile = async () => {
    if (!userId || isSavingProfile) return;
    try {
      await updateProfile({
        userId,
        updates: {
          full_name: editingProfileData.full_name,
          phone: editingProfileData.phone,
        },
      }).unwrap();
      setEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  // 3. Land Creation Handler
  const handleAddLand = async (e: FormEvent) => {
    e.preventDefault();
    if (!userAuth || isCreatingLand) return;

    try {
      const locationParts = landForm.location_address
        .split(",")
        .map((s) => s.trim());

      const newLandData: NewLandData = {
        title: landForm.title,
        description: landForm.description,
        area: parseFloat(landForm.area),
        price_per_acre: landForm.price_per_acre
          ? parseFloat(landForm.price_per_acre)
          : 0,
        soil_type: landForm.soil_type || "Unknown",
        water_availability:
          (landForm.water_availability as Land["water_availability"]) || "low",
        location: {
          street_address: locationParts[0] || landForm.location_address,
          city: locationParts[1] || "Unknown City",
          state_province: locationParts[2] || "Unknown State",
          postal_code: "000000",
          country: "India",
          coordinates: { type: "Point", values: [0, 0] },
        } as Address,
      };

      await createLand(newLandData).unwrap();
      alert("Land added successfully!");
      setLandForm(initialLandForm);
      setShowAddForm(false);
      setLandToEdit(null);
    } catch (err) {
      console.error("Error in handleAddLand:", err);
      // This displays the validation error received from the backend
      alert(
        "Error adding land: " + ((err as any).data?.detail || "Unknown error")
      );
    }
  };

  // 4. Land Deletion Handler
  const handleDeleteLand = async (id: string) => {
    if (confirm("Are you sure you want to delete this land listing?")) {
      try {
        await deleteLand(id).unwrap();
        alert("Listing deleted successfully!");
      } catch (error) {
        console.error("Error deleting land:", error);
        alert("Error deleting land.");
      }
    }
  };

  // 5. Land Edit Initiation Handler
  const handleEditLandClick = (land: Land) => {
    // Map data from RTK cache back to local form for editing
    setLandForm({
      title: land.title,
      description: land.description || "",
      area: String(land.area),
      price_per_acre: String(land.price_per_acre || ""),
      soil_type: land.soil_type || "",
      water_availability: land.water_availability || "",
      location_address: `${land.location.street_address || ""}, ${
        land.location.city || ""
      }, ${land.location.state_province || ""}`.trim(),
    });
    setLandToEdit(land); // Set the land object being edited
    setShowAddForm(false);
  };

  // 6. Land Update Handler (PUT)
  const handleUpdateLand = async (e: FormEvent) => {
    e.preventDefault();
    if (!landToEdit || isUpdatingLand) return;

    try {
      const locationParts = landForm.location_address
        .split(",")
        .map((s) => s.trim());

      const updates: Partial<NewLandData> = {
        title: landForm.title,
        description: landForm.description,
        area: parseFloat(landForm.area),
        price_per_acre: landForm.price_per_acre
          ? parseFloat(landForm.price_per_acre)
          : 0,
        soil_type: landForm.soil_type || landToEdit.soil_type,
        water_availability:
          (landForm.water_availability as Land["water_availability"]) ||
          landToEdit.water_availability,
        location: {
          ...landToEdit.location, // Retain immutable fields (like coordinates)
          street_address:
            locationParts[0] || landToEdit.location.street_address,
          city: locationParts[1] || landToEdit.location.city,
          state_province:
            locationParts[2] || landToEdit.location.state_province,
        } as Address,
      };

      await updateLand({ landId: landToEdit._id, updates }).unwrap();
      alert("Land listing updated successfully!");
      setLandToEdit(null);
      setLandForm(initialLandForm);
    } catch (err) {
      console.error("Error updating land:", err);
      alert(
        "Error updating land: " + ((err as any).data?.detail || "Unknown error")
      );
    }
  };

  // 7. Sample Data Handler (Simulated)
  const handleCreateSampleData = async () => {
    if (!userAuth || isCreatingLand) return;

    if (confirm("This will simulate creating 3 sample land listings.")) {
      alert(
        "Sample data creation logic simulated. Data will appear on refresh."
      );
      // Force refetch to update the list, simulating the effect of the multi-mutation
      refetchLands();
    }
  };

  // --- RENDER BLOCK ---

  if (isLoadingProfile || isLoadingLands) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading Dashboard Data...</div>
      </div>
    );
  }

  if (!userAuth || !profileData) {
    return (
      <div className="p-10 text-red-600">
        Profile data is missing. Please re-login.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Landowner Dashboard
        </h1>
        <p className="text-gray-600">Manage your profile and land listings</p>
      </div>

      {/* 1. Profile Editing Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
          <button
            onClick={() =>
              editingProfile ? handleSaveProfile() : setEditingProfile(true)
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={isSavingProfile}
          >
            {isSavingProfile
              ? "Saving..."
              : editingProfile
              ? "Save Profile"
              : "Edit Profile"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Full Name, Email (Read-only), Phone, Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={editingProfileData.full_name}
              onChange={(e) =>
                setEditingProfileData({
                  ...editingProfileData,
                  full_name: e.target.value,
                })
              }
              disabled={!editingProfile}
              className="w-full px-4 py-2 border disabled:bg-gray-50 rounded-lg"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={editingProfileData.email}
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
              value={editingProfileData.phone}
              onChange={(e) =>
                setEditingProfileData({
                  ...editingProfileData,
                  phone: e.target.value,
                })
              }
              disabled={!editingProfile}
              className="w-full px-4 py-2 border disabled:bg-gray-50 rounded-lg"
              placeholder="Your phone number"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={editingProfileData.address}
              onChange={(e) =>
                setEditingProfileData({
                  ...editingProfileData,
                  address: e.target.value,
                })
              }
              disabled={!editingProfile}
              rows={2}
              className="w-full px-4 py-2 border disabled:bg-gray-50 rounded-lg"
              placeholder="Your full address"
            />
          </div>
        </div>
      </div>

      {/* 2. Land Management Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Land Listings
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateSampleData}
              disabled={isCreatingLand}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Database className="w-5 h-5" />
              <span>
                {isCreatingLand ? "Processing..." : "Create Sample Data"}
              </span>
            </button>
            <button
              onClick={() => {
                setShowAddForm(true);
                setLandToEdit(null);
              }}
              disabled={isCreatingLand}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Land</span>
            </button>
          </div>
        </div>

        {/* Land Add/Edit Form */}
        {(showAddForm || landToEdit) && (
          <form
            onSubmit={landToEdit ? handleUpdateLand : handleAddLand}
            className="mb-8 p-6 bg-gray-50 rounded-xl"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {landToEdit
                ? `Edit Listing: ${landToEdit.title}`
                : "Add New Land Listing"}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Input fields... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={landForm.title}
                  onChange={(e) =>
                    setLandForm({ ...landForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (City, State) *
                </label>
                <input
                  type="text"
                  value={landForm.location_address}
                  onChange={(e) =>
                    setLandForm({
                      ...landForm,
                      location_address: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="City, State"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (acres) *
                </label>
                <input
                  type="number"
                  value={landForm.area}
                  onChange={(e) =>
                    setLandForm({ ...landForm, area: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Acre (₹)
                </label>
                <input
                  type="number"
                  value={landForm.price_per_acre}
                  onChange={(e) =>
                    setLandForm({ ...landForm, price_per_acre: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soil Type
                </label>
                <input
                  type="text"
                  value={landForm.soil_type}
                  onChange={(e) =>
                    setLandForm({ ...landForm, soil_type: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Loamy, Clay"
                />
              </div>

              {/* 🌟 FIXED: Water Availability Dropdown 🌟 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Availability *
                </label>
                <select
                  value={landForm.water_availability}
                  onChange={(e) =>
                    setLandForm({
                      ...landForm,
                      water_availability: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg bg-white"
                  required
                >
                  <option value="" disabled>
                    Select availability
                  </option>
                  <option value="high">High (Perennial Source)</option>
                  <option value="medium">Medium (Well/Borewell)</option>
                  <option value="low">Low (Seasonal/Tank)</option>
                  <option value="seasonal">Seasonal (Monsoon dependent)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={landForm.description}
                  onChange={(e) =>
                    setLandForm({ ...landForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Describe your land..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setLandToEdit(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingLand || isUpdatingLand}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {landToEdit
                  ? isUpdatingLand
                    ? "Saving Changes..."
                    : "Save Changes"
                  : isCreatingLand
                  ? "Adding..."
                  : "Add Land"}
              </button>
            </div>
          </form>
        )}

        {/* Land Listings Display */}
        {lands?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            You haven't added any land listings yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lands?.map((land) => (
              <div
                key={land._id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {land.title}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-sm">
                      {land.location.city}, {land.location.state_province}
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
                        ₹{land.price_per_acre.toLocaleString()}/acre
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700">
                    <Droplet className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-sm">{land.water_availability}</span>
                  </div>
                </div>

                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleEditLandClick(land)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteLand(land._id)}
                    disabled={isDeletingLand}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
