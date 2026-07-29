import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * ColorContexts — gestor de tema (oscuro / claro / sistema).
 *
 * Mejoras Fase 2:
 *  - Default = "system" (sigue al SO)
 *  - Detecta `prefers-color-scheme` y reacciona si cambia el ajuste del SO
 *  - Persiste preferencia explícita en `localStorage`
 *  - Aplica `data-theme` en <body> y `color-scheme` CSS para mejor render nativo
 */

const STORAGE_KEY = "daily.theme"; // "claro" | "oscuro" | "system"

const ThemeContext = createContext(null);

function getSystemTheme() {
    if (typeof window === "undefined") return "oscuro";
    return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "claro"
        : "oscuro";
}

function readStoredPreference() {
    if (typeof window === "undefined") return "system";
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "claro" || v === "oscuro" || v === "system" ? v : "system";
}

export function ColorContexts({ children }) {
    // Preferencia explícita del usuario
    const [preference, setPreference] = useState(readStoredPreference);
    // Tema efectivo aplicado (tras resolver "system")
    const [systemTheme, setSystemTheme] = useState(getSystemTheme);

    const theme = preference === "system" ? systemTheme : preference;

    // Reaccionar a cambios del SO si la preferencia es "system"
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(prefers-color-scheme: light)");
        const onChange = () =>
            setSystemTheme(mq.matches ? "claro" : "oscuro");
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);

    // Aplicar al DOM
    useEffect(() => {
        document.body.dataset.theme = theme;
        document.documentElement.style.colorScheme =
            theme === "claro" ? "light" : "dark";
    }, [theme]);

    // Persistir preferencia
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, preference);
        } catch {
            /* ignore quota / private mode */
        }
    }, [preference]);

    const value = useMemo(
        () => ({
            theme,             // resuelto: "claro" | "oscuro"
            preference,        // explícita: "claro" | "oscuro" | "system"
            setPreference,
            toggleTheme: () =>
                setPreference((prev) =>
                    prev === "oscuro"
                        ? "claro"
                        : prev === "claro"
                          ? "system"
                          : "oscuro",
                ),
        }),
        [theme, preference],
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme debe usarse dentro de <ColorContexts>");
    }
    return ctx;
}
