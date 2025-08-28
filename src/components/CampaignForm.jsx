"use client";

import { useState, useEffect } from "react";
import { useContract } from "../hooks/useContract";
import { useWallet } from "../hooks/useWallet";
import { validateImageFile, convertDeadlineToTimestamp } from "../lib/utils";
import {
  generatePlaceholderImage,
  createPreviewUrl,
  cleanupPreviewUrl,
  uploadToIPFS,
} from "../lib/imageUtils";
import Loading from "./Loading";

export default function CampaignForm({ onSuccess }) {
  const { createCampaign, isLoading, error } = useContract();
  const { isConnected, isCorrectNetwork } = useWallet();
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    deadline: "",
    imageUrl: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (imagePreview) {
        cleanupPreviewUrl(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFormErrors((prev) => ({
        ...prev,
        image: validation.error,
      }));
      return;
    }

    // Cleanup previous preview URL if it exists
    if (imagePreview) {
      cleanupPreviewUrl(imagePreview);
    }

    setImageFile(file);
    setImagePreview(createPreviewUrl(file));
    setFormErrors((prev) => ({
      ...prev,
      image: "",
    }));

    // Upload to IPFS via Pinata
    setIsUploading(true);
    try {
      const uploadResult = await uploadToIPFS(
        file,
        `campaign-${Date.now()}-${file.name}`
      );

      if (uploadResult.success) {
        console.log("Image uploaded to IPFS:", uploadResult.url);
        setFormData((prev) => ({
          ...prev,
          imageUrl: uploadResult.url,
        }));
      } else {
        console.error("IPFS upload failed:", uploadResult.error);
        setFormErrors((prev) => ({
          ...prev,
          image: `Upload failed: ${uploadResult.error}`,
        }));
        // Use placeholder as fallback
        setFormData((prev) => ({
          ...prev,
          imageUrl: generatePlaceholderImage(file.name),
        }));
      }
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      setFormErrors((prev) => ({
        ...prev,
        image: "Failed to upload image. Using placeholder.",
      }));
      // Use placeholder as fallback
      setFormData((prev) => ({
        ...prev,
        imageUrl: generatePlaceholderImage(file.name),
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.length < 3) {
      errors.title = "Title must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    if (!formData.target) {
      errors.target = "Target amount is required";
    } else if (parseFloat(formData.target) <= 0) {
      errors.target = "Target amount must be greater than 0";
    }

    if (!formData.deadline) {
      errors.deadline = "Deadline is required";
    } else {
      try {
        convertDeadlineToTimestamp(formData.deadline);
      } catch (error) {
        errors.deadline = error.message;
      }
    }

    if (!formData.imageUrl && !imageFile) {
      errors.image = "Campaign image is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createCampaign(formData);

      // Reset form
      setFormData({
        title: "",
        description: "",
        target: "",
        deadline: "",
        imageUrl: "",
      });
      setImageFile(null);
      setImagePreview("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to create campaign:", err);
    }
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return <Loading />;
  }

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">
          Please connect your wallet to create a campaign.
        </p>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          Please switch to the correct network to create a campaign.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Campaign Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter your campaign title"
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formErrors.title ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {formErrors.title && (
          <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your campaign in detail..."
          rows={4}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formErrors.description ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {formErrors.description && (
          <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label
          htmlFor="image"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Campaign Image *
        </label>
        <div className="space-y-4">
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || isUploading}
          />

          {isUploading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Uploading to IPFS...</span>
            </div>
          )}

          {imagePreview && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Campaign preview"
                className="w-full h-full object-cover"
              />
              {formData.imageUrl &&
                formData.imageUrl !== generatePlaceholderImage() && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Uploaded to IPFS
                  </div>
                )}
            </div>
          )}
        </div>
        {formErrors.image && (
          <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>
        )}
      </div>

      {/* Target Amount */}
      <div>
        <label
          htmlFor="target"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Target Amount (ETH) *
        </label>
        <input
          type="number"
          id="target"
          name="target"
          value={formData.target}
          onChange={handleInputChange}
          placeholder="0.0"
          step="0.001"
          min="0"
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formErrors.target ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {formErrors.target && (
          <p className="text-red-500 text-sm mt-1">{formErrors.target}</p>
        )}
      </div>

      {/* Deadline */}
      <div>
        <label
          htmlFor="deadline"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Campaign Deadline *
        </label>
        <input
          type="datetime-local"
          id="deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleInputChange}
          min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formErrors.deadline ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {formErrors.deadline && (
          <p className="text-red-500 text-sm mt-1">{formErrors.deadline}</p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || isUploading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loading />
            <span className="ml-2">Creating Campaign...</span>
          </div>
        ) : isUploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span>Uploading Image...</span>
          </div>
        ) : (
          "Create Campaign"
        )}
      </button>

      {/* Fee Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Note:</strong> A 1% platform fee will be deducted when you
          withdraw funds from your campaign.
        </p>
      </div>
    </form>
  );
}
