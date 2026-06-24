import { useTranslation } from "react-i18next";
import { Modal } from "../../components/Modal";
import { catalogToCity, CITY_CATALOG } from "../../lib/cities";
import { useStore } from "../../store/StoreContext";
import { canAddDisplayCity } from "../../store/reducer";
import { selectDisplayCities, selectHomeCity } from "../../store/selectors";
import type { City } from "../../store/types";
import { CitySearchPanel, type CitySearchMode } from "./CitySearchPanel";

interface CitySearchModalProps {
  open: boolean;
  onClose: () => void;
  mode?: CitySearchMode;
  takenIds?: Set<string>;
  onGroupSelect?: (city: City) => void;
}

export function CitySearchModal({
  open,
  onClose,
  mode = "add",
  takenIds,
  onGroupSelect,
}: CitySearchModalProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useStore();
  const displayCities = selectDisplayCities(state);
  const home = selectHomeCity(state);
  const atMax = !canAddDisplayCity(state);

  const title = mode === "group" ? t("group.addCity") : t("search.title");

  const handleSelect = (id: string) => {
    const entry = CITY_CATALOG.find((city) => city.id === id);
    if (!entry) return;

    if (mode === "group") {
      const city = catalogToCity(entry, entry.id === home?.id, 0);
      onGroupSelect?.(city);
      onClose();
      return;
    }

    if (displayCities.some((city) => city.id === id)) {
      const conflict = displayCities.find((city) => city.id === id);
      dispatch({ type: "SET_PULSE_CITY", payload: { cityId: conflict!.id } });
      onClose();
      return;
    }

    if (atMax) return;
    dispatch({ type: "ADD_CITY", payload: { city: catalogToCity(entry, false, state.cities.allIds.length) } });
    onClose();
  };

  return (
    <Modal open={open} title={title} onClose={onClose}>
      {open && (
        <CitySearchPanel
          key={`${mode}-${open}`}
          mode={mode}
          takenIds={takenIds}
          onSelect={handleSelect}
        />
      )}
    </Modal>
  );
}
