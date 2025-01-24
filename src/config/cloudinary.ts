import { v2 as cloudinary } from "cloudinary";
import config from "config";

cloudinary.config({
  cloud_name: config.get("cloudinary.cloud_name"),
  api_key: config.get("cloudinary.api_key"),
  api_secret: config.get("cloudinary.api_secret"),
});

export default cloudinary;
