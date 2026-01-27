import { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

export default function PanoramaViewer({ imageUrl, onClose }) {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!containerRef.current || !imageUrl) return;

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            try {
                viewerRef.current = new Viewer({
                    container: containerRef.current,
                    panorama: imageUrl,
                    navbar: ["zoom", "fullscreen"],
                    defaultZoomLvl: 0,
                    touchmoveTwoFingers: true,
                    mousewheelCtrlKey: false,
                });

                viewerRef.current.addEventListener("ready", () => {
                    setLoading(false);
                });

            } catch (err) {
                console.error("Failed to initialize viewer:", err);
                setError("Failed to initialize panorama viewer");
                setLoading(false);
            }
        };

        img.onerror = () => {
            console.error("Failed to load image:", imageUrl);
            setError("Failed to load image");
            setLoading(false);
        };

        img.src = imageUrl;

        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [imageUrl]);

    return (
        <div className="panorama-overlay" onClick={onClose}>
            <div className="panorama-container" onClick={(e) => e.stopPropagation()}>
                <button className="panorama-close" onClick={onClose}>
                    <i className="bi bi-x-lg"></i>
                </button>
                {error ? (
                    <div className="panorama-error">
                        <p>{error}</p>
                        <img src={imageUrl} alt="Fallback view" className="panorama-fallback-img" />
                    </div>
                ) : (
                    <>
                        {loading && (
                            <div className="panorama-loading">
                                <span>Loading panorama...</span>
                            </div>
                        )}
                        <div ref={containerRef} className="panorama-viewer" />
                    </>
                )}
            </div>
        </div>
    );
}