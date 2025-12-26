import type { Area } from "react-easy-crop";

const QUALITY = 0.9;

function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  mimeType: string,
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const width = Math.round(pixelCrop.width);
  const height = Math.round(pixelCrop.height);
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported");
  }

  ctx.drawImage(
    image,
    Math.round(pixelCrop.x),
    Math.round(pixelCrop.y),
    width,
    height,
    0,
    0,
    width,
    height,
  );

  const quality = mimeType === "image/png" ? undefined : QUALITY;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Failed to crop image"));
          return;
        }
        resolve(result);
      },
      mimeType,
      quality,
    );
  });

  return blob;
}
