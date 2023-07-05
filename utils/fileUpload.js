const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const CustomAPIError = require("../errors");

const fileUpload = async (file, folder, acceptType) => {
  const fileMimeType = file.mimetype;
  const fileSize = file.size; // bytes
  let maxFileSize, acceptMIME;

  if (acceptType == "image") {
    acceptMIME = "image/";
    maxFileSize = 1 * 1024 * 1024; // 1 MB
  } else if (acceptType == "document") {
    acceptMIME = "application/pdf";
    maxFileSize = 2 * 1024 * 1024; // 2 MB
  }

  if (!fileMimeType.startsWith(acceptMIME)) {
    throw new CustomAPIError.BadRequestError("Invalid file format!");
  }

  if (fileSize > maxFileSize) {
    throw new CustomAPIError.BadRequestError("Maximum file size exceeded!");
  }

  const filePath = path.resolve(__dirname, "../tmp/" + file.name);
  await file.mv(filePath);

  const uploadedFile = await cloudinary.uploader.upload(filePath, {
    use_filename: true,
    folder,
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
