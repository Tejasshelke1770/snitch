import ImageKit from "@imagekit/nodejs";
import { config } from "../config/config.js";

const ImageKitClient = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
});

const UploadImage = async ({ buffer, fileName, folder = "snitch" }) => {
  const response = await ImageKitClient.files.upload({
    file: await ImageKit.toFile(buffer),
    fileName,
    folder,
  });
  return { url: response.url };
};

export default UploadImage;
