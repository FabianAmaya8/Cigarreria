import styles from "../../../../assets/Css/CierraDia/Bolsillos.module.scss";
import { BOLSILLO_ICON_OPTIONS, BolsilloIcon, normalizeBolsilloIcon } from "./bolsilloIcons";

export default function BolsilloIconPicker({ value, onChange }) {
    const selected = normalizeBolsilloIcon(value);

    return (
        <div className={styles.iconPickerGrid}>
            {BOLSILLO_ICON_OPTIONS.map(({ key, label }) => {
                const active = selected === key;

                return (
                    <button
                        type="button"
                        key={key}
                        className={`${styles.iconPickerButton} ${active ? styles.isSelected : ""}`}
                        onClick={() => onChange(key)}
                        aria-label={label}
                        title={label}
                    >
                        <BolsilloIcon iconKey={key} size={22} className={styles.iconPickerGlyph} />
                        <span>{label}</span>
                    </button>
                );
            })}
        </div>
    );
}
