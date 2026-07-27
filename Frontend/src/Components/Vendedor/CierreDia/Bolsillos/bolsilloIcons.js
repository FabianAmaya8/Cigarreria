import React from "react";
import {
    FaWallet,
    FaHouse,
    FaLandmark,
    FaPiggyBank,
    FaBriefcase,
    FaCartShopping,
    FaUtensils,
    FaCarSide,
    FaPlaneDeparture,
    FaGraduationCap,
    FaScrewdriverWrench,
    FaHospital,
    FaBuilding,
    FaTruck,
    FaReceipt,
    FaMoneyBillWave,
    FaCreditCard,
    FaChartLine,
    FaGift,
    FaStore,
    FaCashRegister,
    FaSackDollar,
    FaShield,
    FaToolbox,
    FaSuitcase,
    FaSeedling,
    FaHeart,
    FaCoins,
    FaCircleDollarToSlot,
    FaHandshake,
} from "react-icons/fa6";
import { PiBankFill, PiBagSimpleFill, PiStorefrontFill, PiTruckFill } from "react-icons/pi";
import { MdOutlineSavings, MdOutlineMedicalServices, MdOutlineTravelExplore } from "react-icons/md";

export const BOLSILLO_ICON_OPTIONS = [
    { key: "wallet", label: "Caja principal", Icon: FaWallet },
    { key: "home", label: "Gastos del hogar", Icon: FaHouse },
    { key: "bank", label: "Cuenta bancaria", Icon: PiBankFill },
    { key: "piggy-bank", label: "Ahorros", Icon: FaPiggyBank },
    { key: "briefcase", label: "Administración", Icon: FaBriefcase },
    { key: "shopping", label: "Compras", Icon: FaCartShopping },
    { key: "restaurant", label: "Alimentación", Icon: FaUtensils },
    { key: "car", label: "Transporte", Icon: FaCarSide },
    { key: "travel", label: "Viajes", Icon: MdOutlineTravelExplore },
    { key: "education", label: "Capacitación", Icon: FaGraduationCap },
    { key: "tools", label: "Insumos", Icon: FaScrewdriverWrench },
    { key: "health", label: "Salud", Icon: MdOutlineMedicalServices },
    { key: "business", label: "Negocio", Icon: FaBuilding },
    { key: "provider", label: "Proveedores", Icon: PiTruckFill },
    { key: "taxes", label: "Impuestos", Icon: FaReceipt },
    { key: "cash", label: "Efectivo", Icon: FaMoneyBillWave },
    { key: "credit-card", label: "Tarjetas", Icon: FaCreditCard },
    { key: "investment", label: "Inversiones", Icon: FaChartLine },
    { key: "gift", label: "Promociones", Icon: FaGift },
    { key: "savings", label: "Reserva", Icon: MdOutlineSavings },
    { key: "store", label: "Inventario", Icon: PiStorefrontFill },
    { key: "bag", label: "Mercancía", Icon: PiBagSimpleFill },
    { key: "register", label: "Caja registradora", Icon: FaCashRegister },
    { key: "dollar", label: "Ventas", Icon: FaCircleDollarToSlot },
    { key: "handshake", label: "Clientes", Icon: FaHandshake },
    { key: "shield", label: "Seguridad", Icon: FaShield },
    { key: "toolbox", label: "Mantenimiento", Icon: FaToolbox },
    { key: "suitcase", label: "Distribución", Icon: FaSuitcase },
    { key: "seedling", label: "Crecimiento", Icon: FaSeedling },
    { key: "heart", label: "Personal", Icon: FaHeart },
    { key: "coins", label: "Cambio", Icon: FaCoins },
    { key: "landmark", label: "Servicios", Icon: FaLandmark },
    { key: "hospital", label: "Emergencias", Icon: FaHospital },
    { key: "sack-dollar", label: "Utilidades", Icon: FaSackDollar },
];

const ICON_ALIASES = {
    "bx-wallet": "wallet",
    "bx-home": "home",
    "bx-briefcase": "briefcase",
    "bx-car": "car",
    "bx-credit-card": "credit-card",
    "bx-piggy-bank": "piggy-bank",
    "bx-gift": "gift",
    "bx-coin": "coins",
    "bx-package": "toolbox",
    "bx-heart": "heart",
    "bx-building": "business",
    "bx-store": "store",
    "bx-wallet-alt": "wallet",
    "bx-bank": "bank",
};

const ICON_MAP = BOLSILLO_ICON_OPTIONS.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
}, {});

export function normalizeBolsilloIcon(iconKey) {
    if (!iconKey) return BOLSILLO_ICON_OPTIONS[0].key;
    return ICON_ALIASES[iconKey] || iconKey;
}

export function getBolsilloIconOption(iconKey) {
    const normalized = normalizeBolsilloIcon(iconKey);
    return ICON_MAP[normalized] || BOLSILLO_ICON_OPTIONS[0];
}

export function BolsilloIcon({ iconKey, size = 20, className }) {
    const { Icon } = getBolsilloIconOption(iconKey);
    return React.createElement(Icon, { size, className, "aria-hidden": true });
}
