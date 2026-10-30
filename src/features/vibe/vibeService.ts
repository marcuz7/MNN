import { VibeKnowledgeProject } from './types';

export async function fetchVibePresets(): Promise<VibeKnowledgeProject[]> {
  try {
    const res = await fetch('/api/vibe-knowledge/presets');
    if (!res.ok) throw new Error('Failed to load presets');
    const data = await res.json();
    return data.presets || [];
  } catch (err) {
    console.warn('Using client-side fallback presets', err);
    return [];
  }
}

export async function generateVibeProject(params: {
  topic: string;
  customText?: string;
  sources?: any[];
  visualStyle?: 'dark-tech' | 'neon-terminal' | 'clean-academic';
  aspectRatio?: '9:16' | '16:9';
}): Promise<VibeKnowledgeProject> {
  const res = await fetch('/api/vibe-knowledge/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to decompose knowledge point');
  }

  const data = await res.json();
  return data.project;
}

export async function saveVibeProject(project: VibeKnowledgeProject): Promise<void> {
  await fetch('/api/vibe-knowledge/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project })
  });
}
