import React from "react";
import styles from "@/styles/Sidebar.module.css";

interface SidebarProps {
  selectedMenu: string;
  onSelect: (menu: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedMenu, onSelect }) => {
    const menuItems = [
        { name: "기본 정보", icon: "👤" },
        { name: "채팅 보관", icon: "💬" },
    ];

    return (
        <div className={styles.sidebar}>
            <ul className={styles.menuList}>
                {menuItems.map((item) => (
                <li
                    key={item.name}
                    className={`${styles.menuItem} ${selectedMenu === item.name ? styles.active : ""}`}
                    onClick={() => onSelect(item.name)}
                >
                    <span className={styles.icon}>{item.icon}</span>
                    {item.name}
                </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;