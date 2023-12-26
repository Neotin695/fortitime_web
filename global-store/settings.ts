import { Currency, Language } from "@/types/global";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStoreState {
  selectedLanguage?: Language;
  selectedCurrency?: Currency;
  updateSelectedLanguage: (lang: Language) => void;
  updateSelectedCurrency: (currency: Currency) => void;
  settings?: Record<string, string>;
  updateSettings: (settings: Record<string, string>) => void;
}

const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      updateSelectedCurrency: (selectedCurrency) => set({ selectedCurrency }),
      updateSelectedLanguage: (selectedLanguage) => set({ selectedLanguage }),
      updateSettings: (settings) => set({ settings }),
    }),
    { name: "settings" }
  )
);

export default useSettingsStore;
