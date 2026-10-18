import { create } from 'zustand'
export const useStore = create((set) => ({
  booted: false, search: false, active: null, glitch: false, flame: false,
  simModal: false, dubModal: false, verifyModal: false, pitchModal: false,
  setBooted: () => set({ booted: true }),
  setSearch: (search) => set({ search }),
  open: (id) => set({ active: id }),
  close: () => set({ active: null }),
  setFlame: (flame) => set({ flame }),
  setSimModal: (simModal) => set({ simModal }),
  setDubModal: (dubModal) => set({ dubModal }),
  setVerifyModal: (verifyModal) => set({ verifyModal }),
  setPitchModal: (pitchModal) => set({ pitchModal }),
  triggerGlitch: () => { set({ glitch: true }); setTimeout(() => set({ glitch: false }), 1000) },
}))
