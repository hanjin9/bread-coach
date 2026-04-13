import { create } from 'zustand';

export interface BreathingTemplate {
  id: string;
  name: string;
  breathing: {
    inhale: number;
    hold1: number;
    exhale: number;
    hold2: number;
  };
  pipeline: {
    thickness: number;
    color: string;
    curvature: number;
    startExtend: number;
    endExtend: number;
  };
  orb: {
    size: number;
    color: string;
    opacity: number;
    texture: 'glossy' | 'matte' | 'metallic';
    shadowOpacity: number;
  };
  background: {
    image: string | null;
    opacity: number;
  };
  sound: {
    url: string | null;
    volume: number;
  };
  style?: 'standard' | 'penetration';
}

const defaultTemplate: BreathingTemplate = {
  id: 'default',
  name: '기본 템플릿',
  breathing: {
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
  },
  pipeline: {
    thickness: 8,
    color: '#d4af37',
    curvature: 30,
    startExtend: 20,
    endExtend: 20,
  },
  orb: {
    size: 25,
    color: '#d4af37',
    opacity: 1,
    texture: 'glossy',
    shadowOpacity: 0.3,
  },
  background: {
    image: null,
    opacity: 0.8,
  },
  sound: {
    url: null,
    volume: 0.5,
  },
  style: 'standard',
};

interface TemplateStore {
  template: BreathingTemplate;
  templates: BreathingTemplate[];
  updateTemplate: (template: BreathingTemplate) => void;
  saveTemplate: (template: BreathingTemplate) => void;
  loadTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  resetTemplate: () => void;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  template: defaultTemplate,
  templates: [defaultTemplate],

  updateTemplate: (template) => set({ template }),

  saveTemplate: (template) =>
    set((state) => ({
      templates: [
        ...state.templates.filter((t) => t.id !== template.id),
        template,
      ],
    })),

  loadTemplate: (id) =>
    set((state) => {
      const template = state.templates.find((t) => t.id === id);
      if (template) {
        return { template };
      }
      return state;
    }),

  deleteTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),

  resetTemplate: () => set({ template: defaultTemplate }),
}));
