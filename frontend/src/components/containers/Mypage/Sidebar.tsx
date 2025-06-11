import React, { useState, useEffect } from "react";
import styles from "@/styles/Sidebar.module.css";

interface SidebarProps {
  selectedMenu: string;
  onSelect: (menu: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedMenu, onSelect }) => {
    const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

    const menuItems = [
        { name: "기본 정보", icon: "/icons/Edit-nohover.svg", hoverIcon: "/icons/Edit-hover.svg" },  // hover 아이콘 추가
        { name: "채팅 보관", icon: "/icons/Message-nohover.svg", hoverIcon: "/icons/Message-hover.svg" },   // hover 아이콘 추가
    ];

    const handleMouseEnter = (name: string) => {
        setHoveredMenu(name);
    };

    const handleMouseLeave = () => {
        setHoveredMenu(null);
    };

    useEffect(() => {
        if (selectedMenu) {
            setHoveredMenu(null);
        }
    }, [selectedMenu]);
    
    return (
        <div className={styles.sidebar}>
            <ul className={styles.menuList}>
                {menuItems.map((item) => (
                    <li
                        key={item.name}
                        className={`${styles.menuItem} ${selectedMenu === item.name ? styles.active : ""}`}
                        onClick={() => onSelect(item.name)}
                        onMouseEnter={() => handleMouseEnter(item.name)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <img 
                            src={hoveredMenu === item.name || selectedMenu === item.name ? item.hoverIcon : item.icon} 
                            alt={`${item.name} 아이콘`} 
                            className={styles.icon} 
                        />
                        {item.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
