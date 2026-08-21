import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { urlDB } from "../../urlDB";
import styles from "../../assets/Css/Dependencias/ImagePreview.module.scss";

export default function ImagePreview({
    src,
    alt = "Imagen",
    className = "",
    fallback = null,
    zoom = true, // 👈 nueva prop
}) {
    const [open, setOpen] = useState(false);
    const [finalSrc, setFinalSrc] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function resolveSrc() {
            if (!src) {
                setFinalSrc(null);
                return;
            }

            const isFullUrl = /^(http|https|blob:|data:)/i.test(src);

            if (isFullUrl) {
                setFinalSrc(src);
            } else {
                const fullUrl = await urlDB(`uploads/${src}`);
                if (isMounted) setFinalSrc(fullUrl);
            }
        }

        resolveSrc();

        return () => {
            isMounted = false;
        };
    }, [src]);

    const handleClick = () => {
        if (zoom) setOpen(true); // 👈 solo abre si está habilitado
    };

    return (
        <>
            {finalSrc ? (
                <img
                    src={finalSrc}
                    alt={alt}
                    className={className}
                    loading="lazy"
                    onClick={handleClick}
                    style={{ cursor: zoom ? "zoom-in" : "default" }} // 👈 UX
                />
            ) : (
                fallback ? (
                    fallback
                ) : (
                    <div className={styles.fallback}>
                        <i className="bx bx-image"></i>
                    </div>
                )
            )}

            {/* 👇 solo renderiza modal si zoom está activo */}
            {zoom && open &&
                createPortal(
                    <div
                        className={styles.overlay}
                        onClick={() => setOpen(false)}
                    >
                        {finalSrc ? (
                            <img
                                src={finalSrc}
                                alt={alt}
                                loading="lazy"
                            />
                        ) : (
                            fallback
                        )}
                    </div>,
                    document.body
                )}
        </>
    );
}