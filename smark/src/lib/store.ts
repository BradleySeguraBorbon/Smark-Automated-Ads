import { create } from 'zustand';
import { IClient } from '@/types/Client';
import { IAdMessage } from '@/types/AdMessage';
import { ITag } from '@/types/Tag';
import { ICampaignAudience } from '@/types/CampaignAudience';
import { IMarketingCampaign } from '@/types/MarketingCampaign';
import { ITemplate } from '@/types/Template';
import { IUser } from '@/types/User';
import { persist } from 'zustand/middleware';
import { decodeToken } from "@/lib/utils/decodeToken";

interface ClientStore {
  clients: IClient[];
  setClients: (clients: IClient[]) => void;
  addClient: (client: IClient) => void;
  updateClient: (id: string, updates: Partial<IClient>) => void;
  removeClient: (id: string) => void;
  clearClients: () => void;
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set) => ({
      clients: [],
      setClients: (clients) => set({ clients }),
      addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
      updateClient: (id, updates) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c._id === id ? { ...(c as any), ...updates } as IClient : c
          ),
        })),
      removeClient: (id) =>
        set((state) => ({ clients: state.clients.filter((c) => c._id !== id) })),
      clearClients: () => set({ clients: [] }),
    }),
    {
      name: 'client-storage', // Nombre clave para localStorage
    }
  )
);
interface AdMessageStore {
  adMessages: IAdMessage[];
  setAdMessages: (messages: IAdMessage[]) => void;
  addAdMessage: (msg: IAdMessage) => void;
  updateAdMessage: (id: string, updates: Partial<IAdMessage>) => void;
  removeAdMessage: (id: string) => void;
  clearAdMessages: () => void;
  hasHydrated: boolean;
}

export const useAdMessageStore = create<AdMessageStore>()(
  persist(
    (set) => ({
      adMessages: [],
      setAdMessages: (messages) => set({ adMessages: messages }),
      addAdMessage: (msg) => set((state) => ({ adMessages: [...state.adMessages, msg] })),
      updateAdMessage: (id, updates) =>
        set((state) => ({
          adMessages: state.adMessages.map((m) =>
            m._id === id ? { ...(m as any), ...updates } as IAdMessage : m
          ),
        })),
      removeAdMessage: (id) => set((state) => ({ adMessages: state.adMessages.filter((m) => m._id !== id) })),
      clearAdMessages: () => set({ adMessages: [] }),
      hasHydrated: false
    }),
    {
      name: 'ad-message-storage',
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          useMarketingCampaignStore.setState({ hasHydrated: true });
        }
      }
    }
  )
);

interface CampaignAudienceStore {
  audiences: ICampaignAudience[];
  setAudiences: (audiences: ICampaignAudience[]) => void;
  addAudience: (audience: ICampaignAudience) => void;
  updateAudience: (id: string, updates: Partial<ICampaignAudience>) => void;
  removeAudience: (id: string) => void;
  clearAudiences: () => void;
}

export const useCampaignAudienceStore = create<CampaignAudienceStore>()(
  persist(
    (set) => ({
      audiences: [],
      setAudiences: (audiences) => set({ audiences }),
      addAudience: (audience) => set((state) => ({ audiences: [...state.audiences, audience] })),
      updateAudience: (id, updates) =>
        set((state) => ({
          audiences: state.audiences.map((a) =>
            a._id === id ? { ...(a as any), ...updates } as ICampaignAudience : a
          ),
        })),
      removeAudience: (id) => set((state) => ({ audiences: state.audiences.filter((a) => a._id !== id) })),
      clearAudiences: () => set({ audiences: [] }),
    }),
    { name: 'audience-storage' }
  )
);

interface MarketingCampaignStore {
  campaigns: IMarketingCampaign[];
  setCampaigns: (campaigns: IMarketingCampaign[]) => void;
  addCampaign: (campaign: IMarketingCampaign) => void;
  updateCampaign: (id: string, updates: Partial<IMarketingCampaign>) => void;
  removeCampaign: (id: string) => void;
  clearCampaigns: () => void;
  hasHydrated: boolean;
}

export const useMarketingCampaignStore = create<MarketingCampaignStore>()(
  persist(
    (set) => ({
      campaigns: [],
      setCampaigns: (campaigns) => set({ campaigns }),
      addCampaign: (campaign) => set((state) => ({ campaigns: [...state.campaigns, campaign] })),
      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c._id === id ? { ...(c as any), ...updates } as IMarketingCampaign : c
          ),
        })),
      removeCampaign: (id) => set((state) => ({ campaigns: state.campaigns.filter((c) => c._id !== id) })),
      clearCampaigns: () => set({ campaigns: [] }),
      hasHydrated: false
    }),
    {
      name: 'campaign-storage',
      partialize: (state) => ({
        campaigns: state.campaigns
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          useMarketingCampaignStore.setState({ hasHydrated: true });
        }
      }
    }
  )
);

interface TagStore {
  tags: ITag[];
  setTags: (tags: ITag[]) => void;
  addTag: (tag: ITag) => void;
  updateTag: (id: string, updates: Partial<ITag>) => void;
  removeTag: (id: string) => void;
  clearTags: () => void;
  hasHydrated: boolean;
}

export const useTagStore = create<TagStore>()(
  persist(
    (set) => ({
      tags: [],
      setTags: (tags) => set({ tags }),
      addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
      updateTag: (id, updates) =>
        set((state) => ({
          tags: state.tags.map((t) =>
            t._id === id ? { ...(t as any), ...updates } as ITag : t
          ),
        })),
      removeTag: (id) => set((state) => ({ tags: state.tags.filter((t) => t._id !== id) })),
      clearTags: () => set({ tags: [] }),
      hasHydrated: false
    }),
    {
      name: 'tag-storage',
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          useTagStore.setState({ hasHydrated: true });
        }
      }
    }
  )
);

interface TemplateStore {
  templates: ITemplate[];
  setTemplates: (templates: ITemplate[]) => void;
  addTemplate: (template: ITemplate) => void;
  updateTemplate: (id: string, updates: Partial<ITemplate>) => void;
  removeTemplate: (id: string) => void;
  clearTemplates: () => void;
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      templates: [],
      setTemplates: (templates) => set({ templates }),
      addTemplate: (template) => set((state) => ({ templates: [...state.templates, template] })),
      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t._id === id ? { ...(t as any), ...updates } as ITemplate : t
          ),
        })),
      removeTemplate: (id) => set((state) => ({ templates: state.templates.filter((t) => t._id !== id) })),
      clearTemplates: () => set({ templates: [] }),
    }),
    { name: 'template-storage' }
  )
);


interface UserStore {
  user: IUser | null;
  setUser: (u: IUser) => void;
  updateUser: (u: Partial<IUser>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      updateUser: (u) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...u } as IUser : null,
        })),
      clearUser: () => set({ user: null }),
    }),
    { name: 'user-storage' }
  )
);

interface UserListStore {
  users: IUser[];
  setUsers: (users: IUser[]) => void;
  addUser: (user: IUser) => void;
  updateUser: (id: string, updates: Partial<IUser>) => void;
  removeUser: (id: string) => void;
  clearUsers: () => void;
  hasHydrated: boolean;
}

export const useUserListStore = create<UserListStore>()(
  persist(
    (set) => ({
      users: [],
      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) =>
            u._id === id ? { ...(u as any), ...updates } as IUser : u
          ),
        })),
      removeUser: (id) => set((state) => ({ users: state.users.filter((u) => u._id !== id) })),
      clearUsers: () => set({ users: [] }),
      hasHydrated: false
    }),
    {
      name: 'user-list-storage',
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          useUserListStore.setState({ hasHydrated: true });
        }
      }
    }
  )
);


interface AuthStore {
  token: string | null;
  user: { username: string; role: string; id: string } | null;
  _hasHydrated: boolean;
  setToken: (token: string | null) => Promise<void>;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      setToken: async (token) => {
        set({ token });
        if (token) {
          const decoded = await decodeToken(token);
          if (decoded) {
            set({ user: decoded });
          } else {
            set({ token: null, user: null });
          }
        } else {
          set({ user: null });
        }
      },
      clearAuth: () => set({ token: null, user: null }),
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

type AlertType = 'success' | 'error';

interface NotificationStore {
    open: boolean;
    type: AlertType;
    message: string;
    showAlert: (type: AlertType, message: string) => void;
    clearAlert: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    open: false,
    type: 'success',
    message: '',
    showAlert: (type, message) => set({ open: true, type, message }),
    clearAlert: () => set({ open: false, type: 'success', message: '' }),
}));