import cloudinary from "../config/cloudinaryConfig.js";

const getSignedPdfUrl = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: "auto", 
    type: "authenticated",
    sign_url: true,       
  });
};

export default getSignedPdfUrl;