import React from "react";
import { useGlobalContext } from "saas_root/Contexts";

export const useGetThumbnailApiUrl = (): string => {
    const { routes } = useGlobalContext();
    
    const thumbnailApiUrl = (
        routes.find((route) => route.name === 'saas_arqgen_layouts' && route?.apiUrls?.thumbnail) ||
        routes.find((route) => route?.apiUrls?.thumbnail)
    )?.apiUrls?.thumbnail;

    return thumbnailApiUrl;
}