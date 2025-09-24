import styles from "../../../assets/Css/index.module.scss";

function Footer() {
    return (
        <footer className={styles.Footer}>
            <div className={styles["Footer-container"]}>
                <p>Footer</p>
                <p>Cigarrería JJ © 2021 - 2025</p>
                <p>Desarrollado por: Fabian Amaya</p>
            </div>
        </footer>
    );
}

export default Footer;
