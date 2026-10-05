import { getFileExtension, getStorageUrl } from "utils/url";

export const getVideoSource = (videoUrl: string) => {
  const videoSourceType = `video/${getFileExtension(videoUrl)}`;
  const videoSource = {
    type: "video" as const,
    sources: [
      {
        type: videoSourceType,
        src: getStorageUrl(videoUrl),
      },
    ],
  };

  return videoSource;
};
