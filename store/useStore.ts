
import { create } from 'zustand';

// Define the shape of the store
interface AppState {
    count: number;
    isLoading: boolean;
    increase: (by: number) => void;
    setLoading: (status: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
    count: 0,
    isLoading: false,
    increase: (by) => set((state) => ({ count: state.count + by })),
    setLoading: (status) => set({ isLoading: status }),
}));

