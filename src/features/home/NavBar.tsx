import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store/StoreContext";
import { selectActiveGroup } from "../../store/selectors";
import { IconArrow, IconGroup, IconHome, IconSetting } from "../../components/icons/Icons";
import iconBtn from "../../components/IconActionButton.module.css";
import logoImage from "../../assets/logo.png";
import styles from "./NavBar.module.css";

interface NavBarProps {
  onOpenSettings: () => void;
}

export function NavBar({ onOpenSettings }: NavBarProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useStore();
  const activeGroup = selectActiveGroup(state);
  const groups = state.groups.allIds.map((id) => state.groups.byId[id]).filter(Boolean);
  const hasGroups = groups.length > 0;
  const displayName = activeGroup?.name ?? t("nav.selectGroup");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen]);

  const onGroupContext = (e: React.MouseEvent) => {
    if (!activeGroup) return;
    e.preventDefault();
    const setDefault = !activeGroup.isDefault;
    const label = setDefault ? t("group.setDefaultAction") : t("group.unsetDefaultAction");
    if (window.confirm(label)) {
      dispatch({ type: "TOGGLE_GROUP_DEFAULT", payload: { groupId: activeGroup.id, isDefault: setDefault } });
    }
  };

  const switchGroup = (groupId: string | null) => {
    dispatch({ type: "SET_ACTIVE_GROUP", payload: { groupId } });
    setMenuOpen(false);
  };

  return (
    <header className={styles.nav}>
      <div className={styles.left}>
        <img className={styles.logo} src={logoImage} alt={t("logo")} width={120} height={32} />
        <div className={styles.groupArea} ref={menuRef}>
          <button
            type="button"
            className={styles.groupBtn}
            onClick={() => hasGroups && setMenuOpen((v) => !v)}
            onContextMenu={onGroupContext}
            aria-expanded={menuOpen}
            aria-haspopup={hasGroups ? "listbox" : undefined}
            title={activeGroup ? t("group.defaultHint") : undefined}
          >
            <IconGroup width={18} height={18} />
            <span>{displayName}</span>
            {hasGroups && <IconArrow width={15} height={15} />}
          </button>
          {menuOpen && hasGroups && (
            <div className={styles.groupMenu} role="listbox">
              <button
                type="button"
                role="option"
                aria-selected={!activeGroup}
                className={`${styles.groupMenuItem} ${!activeGroup ? styles.groupMenuItemActive : ""}`}
                onClick={() => switchGroup(null)}
              >
                <span className={styles.homeMenuLabel}>
                  <IconHome width={14} height={14} />
                  {t("nav.homeOnly")}
                </span>
              </button>
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  role="option"
                  aria-selected={activeGroup?.id === group.id}
                  className={`${styles.groupMenuItem} ${activeGroup?.id === group.id ? styles.groupMenuItemActive : ""}`}
                  onClick={() => switchGroup(group.id)}
                >
                  {group.name}
                  {group.isDefault && <span className={styles.defaultBadge}>{t("group.defaultBadge")}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" className={iconBtn.secondary} aria-label={t("settings.title")} onClick={onOpenSettings}>
          <IconSetting width={18} height={18} />
        </button>
      </div>
    </header>
  );
}
