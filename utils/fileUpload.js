const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const CustomAPIError = require("../errors");

const fileUpload = async (file, folder) => {
  const fileMimeType = file.mimetype;
  const fileSize = file.size; // bytes
  const maxFileSize = 2 * 1024 * 1024; // 2 MB

  if (!fileMimeType.startsWith("image/")) {
    throw new CustomAPIError.BadRequestError("File format should be image");
  }

  if (fileSize > maxFileSize) {
    throw new CustomAPIError.BadRequestError(
      "File size should be less than 1 MB"
    );
  }

  const filePath = path.join(__dirname, "../tmp/" + file.name);
  await file.mv(filePath);

  const uploadedFile = await cloudinary.uploader.upload(filePath, {
    use_filename: true, folder
  });

  fs.unlinkSync(filePath);

  if (uploadedFile) {
    console.log(`File upload successful!`);
    return {
      success: true,
      message: "File Uploaded",
      fileURL: uploadedFile?.secure_url,
    };
  }

  throw new Error("File upload failed!");
};

module.exports = { fileUpload };
