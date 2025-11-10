import { useEffect, useRef, useState } from "react";
import { fetchProperties } from "../services/propertyService.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/Home.css";

export default function HomePage() {
    const [properties, setProperties] = useState([]);
    const videoRefs = useRef(new Map()); // map key -> video element
    const observerRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const data = await fetchProperties();
                if (!mounted) return;
                setProperties(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch properties:", err);
                if (mounted) setProperties([]);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        const prefersReduced = typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) {
            // pause all videos if user prefers reduced motion
            videoRefs.current.forEach((v) => v?.pause?.());
            return;
        }

        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const el = entry.target;
                if (!el) return;

                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    try { el.muted = true; } catch(e) {
                        console.error(e.message);
                    }
                    el.play?.().catch(() => {
                        try { el.muted = true; el.play?.(); } catch (e) { console.warn(e); }
                    });
                } else {
                    el.pause?.();
                }
            });
        }, { threshold: [0.5] });

        videoRefs.current.forEach((v) => {
            if (v instanceof Element) obs.observe(v);
        });

        observerRef.current = obs;
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, [properties]);

    console.log(properties);

    return (
        <>
            <nav className="navbar navbar-expand align-items-center px-3 py-0 py-lg-1">
                <a className="navbar-brand fw-bold text-white" href="#">Olympus</a>
                <ul className="navbar-nav d-flex justify-content-between align-items-center ms-auto">
                    <li className="nav-item mx-4 d-none d-md-inline">
                        <a className="nav-link text-white active" href="#">Home</a>
                    </li>
                </ul>
            </nav>

            <div className="bg-video">
                {properties.length > 0 && (
                    <video
                        src={properties[0]?.images?.[0]?.url}
                        className="video"
                        muted
                        playsInline
                        preload="auto"
                        aria-hidden="true"
                        loop
                    />
                )}
            </div>

            <div className="listings container bg-white p-0 m-0" style={{ overflow: "auto" }}>
                {Array.isArray(properties) && properties.length > 0 ? (
                    <ul className="accordion list-unstyled">
                        {properties.map((p, i) => (
                            <li key={p.id ?? i} className="accordion-item">
                                {p.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No properties found</p>
                )}
            </div>
        </>
    );
}
