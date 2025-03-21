import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '@/styles/Header.module.css';
import buttons from '@/styles/Button.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ username: string | null; isLogin: boolean; image: string | null } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const [isProfileHovered, setIsProfileHovered] = useState(false);
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);

    useEffect(() => {
        const loadUser = () => {
            const username = localStorage.getItem("username");
            const isLogin = localStorage.getItem("isLogin") === "true";
            const image = localStorage.getItem("image");

            if (isLogin && username) {
                setUser({ username, isLogin, image });
            } else {
                setUser(null);
            }
        };

        loadUser();

        window.addEventListener("storage", loadUser);

        return () => {
            window.removeEventListener("storage", loadUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("token");
        localStorage.removeItem("isLogin");
        localStorage.removeItem("role");
        localStorage.removeItem("image");

        setUser(null);
        
        window.dispatchEvent(new Event("storage"));
        router.push("/")
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <Link href="/">
                    <Image src="/images/CTRL_C_Logo.png" alt="CTRL+C Logo" width={105} height={57} />
                </Link>
            </div>
            <nav className={styles.nav}>
                <ul>
                    <li>
                        <Link 
                            href='/analysis'
                            className={pathname === '/analysis' ? styles.active : ''}
                        >
                        계약서 분석
                        </Link>
                    </li>
                    <li>
                        <Link 
                            href="/description"
                            className={pathname === '/description' ? styles.active : ''}
                        >
                        계약 법률 설명
                        </Link>
                    </li>
                    <li>
                        <Link 
                            href="/faq"
                            className={pathname === '/faq' ? styles.active : ''}
                        >
                        FAQ
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className={styles.userSection}>
                {user?.isLogin ? (
                    <div 
                        className={styles.profileWrapper} 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <Image 
                            src={user.image || "/images/Erick.png"} 
                            alt="프로필 이미지" 
                            width={40} 
                            height={40} 
                            className={styles.profileImage} 
                        />
                        <span className={styles.username}>{user.username} 님</span>
                        {isDropdownOpen && (
                            <div className={styles.dropdownMenu} ref={dropdownRef}>
                                <div className={styles.dropdownItem}
                                     onMouseEnter={() => setIsProfileHovered(true)}
                                     onMouseLeave={() => setIsProfileHovered(false)}
                                >
                                    <Image 
                                        src={isProfileHovered ? "/icons/user-edit-icon.svg" : "/icons/user-edit-icon-red.svg"} 
                                        alt="편집 아이콘" 
                                        width={16} 
                                        height={16} 
                                    />
                                    <Link href="/mypage" className={styles.dropdownText}>마이페이지</Link>
                                </div>
                                <div className={styles.dropdownItem}
                                     onMouseEnter={() => setIsLogoutHovered(true)}
                                     onMouseLeave={() => setIsLogoutHovered(false)}
                                     onClick={handleLogout}
                                >
                                    <Image 
                                        src={isLogoutHovered ? "/icons/profile-remove.svg" : "/icons/profile-remove-red.svg"} 
                                        alt="로그아웃 아이콘" 
                                        width={16} 
                                        height={16} 
                                    />
                                    <span className={styles.dropdownText}>로그아웃</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/login" className={buttons.loginButton}>로그인</Link>
                )}
            </div>
        </header>
    );
}
