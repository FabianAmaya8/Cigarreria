import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "../../assets/Css/Dependencias/ImagePreview.module.scss";

export default function ImagePreview({
    src,
    alt = "Imagen",
    className = "",
    fallback = null,
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className={className}
                    loading="lazy"
                    onClick={() => setOpen(true)}
                />
            ) : (
                fallback ? ( fallback ):(
                    <div className={styles.fallback}>
                        <i className="bx bx-image"></i>
                    </div>
                )
            )}

            {open &&
                createPortal(
                    <div
                        className={styles.overlay}
                        onClick={() => setOpen(false)}
                    >
                        {src ? (
                            <img
                                src={src}
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