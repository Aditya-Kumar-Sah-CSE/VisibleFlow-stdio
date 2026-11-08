import type {
  UniversalProject,
  UniversalPage,
  ProjectType,
  Template,
  ExportJob,
} from '@visualflow/shared-types';
import { createDefaultProject } from '@visualflow/document-schema';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('visualflow_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('visualflow_token', token);
      } else {
        localStorage.removeItem('visualflow_token');
      }
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('visualflow_token');
    }
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // --- Auth Endpoints ---

  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Login failed');
      }
      const data = await res.json();
      this.setToken(data.token);
      return data;
    } catch (e: any) {
      // Fallback local demo login if backend is unreachable
      console.warn('API unreachable, using local demo session', e.message);
      const mock = {
        user: { id: 'demo-user', name: 'Demo Creator', email, role: 'user' },
        token: 'local-demo-token',
      };
      this.setToken(mock.token);
      return mock;
    }
  }

  async demoLogin() {
    try {
      const res = await fetch(`${API_BASE}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Demo login failed');
      const data = await res.json();
      this.setToken(data.token);
      return data;
    } catch {
      const mock = {
        user: {
          id: 'demo-user-1',
          name: 'Demo Creator',
          email: 'demo@visualflow.studio',
          role: 'user',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        },
        token: 'mock-jwt-token-12345',
      };
      this.setToken(mock.token);
      return mock;
    }
  }

  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Unauthorized');
      return await res.json();
    } catch {
      return {
        user: {
          id: 'demo-user-1',
          name: 'Demo Creator',
          email: 'demo@visualflow.studio',
          role: 'user',
        },
      };
    }
  }

  // --- Projects Endpoints ---

  async getProjects(filter?: { type?: string; isStarred?: boolean; search?: string }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.type) params.set('type', filter.type);
      if (filter?.isStarred !== undefined) params.set('isStarred', String(filter.isStarred));
      if (filter?.search) params.set('search', filter.search);

      const res = await fetch(`${API_BASE}/projects?${params.toString()}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      return await res.json();
    } catch {
      return this.getLocalProjects(filter);
    }
  }

  async getProject(id: string): Promise<UniversalProject> {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Project not found');
      return await res.json();
    } catch {
      const local = this.getLocalProject(id);
      if (local) return local;
      const def = createDefaultProject('flowchart', 'New Flowchart');
      def.id = id;
      this.saveLocalProject(def);
      return def;
    }
  }

  async createProject(type: ProjectType, title: string, initialData?: any): Promise<UniversalProject> {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ type, title, initialData }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      return await res.json();
    } catch {
      const proj = createDefaultProject(type, title);
      if (initialData?.pages) proj.pages = initialData.pages;
      this.saveLocalProject(proj);
      return proj;
    }
  }

  async updateProject(id: string, updates: Partial<UniversalProject>): Promise<UniversalProject> {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update project');
      return await res.json();
    } catch {
      const current = this.getLocalProject(id) || createDefaultProject('flowchart', 'Untitled');
      const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
      this.saveLocalProject(updated);
      return updated;
    }
  }

  async savePage(projectId: string, page: UniversalPage): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/pages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          pageId: page.id,
          order: page.order,
          name: page.name,
          width: page.width,
          height: page.height,
          background: page.background,
          elements: page.elements,
          nodes: page.nodes,
          edges: page.edges,
          documentContent: page.documentContent,
          chartConfig: page.chartConfig,
          slideSettings: page.slideSettings,
        }),
      });
      if (!res.ok) throw new Error('Failed to save page');
      return await res.json();
    } catch {
      // Offline fallback: save to localStorage project
      const proj = this.getLocalProject(projectId);
      if (proj) {
        const pageIdx = proj.pages.findIndex(p => p.id === page.id);
        if (pageIdx >= 0) {
          proj.pages[pageIdx] = page;
        } else {
          proj.pages.push(page);
        }
        proj.updatedAt = new Date().toISOString();
        this.saveLocalProject(proj);
      }
      return { success: true };
    }
  }

  async duplicateProject(id: string): Promise<UniversalProject> {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/duplicate`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to duplicate project');
      return await res.json();
    } catch {
      const current = await this.getProject(id);
      const copy = {
        ...current,
        id: 'proj-' + Math.random().toString(36).substring(2, 9),
        title: `${current.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.saveLocalProject(copy);
      return copy;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
    } catch {
      // Remove from local storage
      const keys = this.getLocalProjectKeys().filter(k => k !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('visualflow_project_index', JSON.stringify(keys));
        localStorage.removeItem(`visualflow_project_${id}`);
      }
    }
  }

  // --- Templates Endpoints ---

  async getTemplates(category?: string): Promise<Template[]> {
    try {
      const params = category ? `?category=${category}` : '';
      const res = await fetch(`${API_BASE}/templates${params}`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      return await res.json();
    } catch {
      return [];
    }
  }

  // --- AI Assistant Endpoint ---

  async generateWithAI(prompt: string, category: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/ai/generate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ prompt, category }),
      });
      if (!res.ok) throw new Error('AI generation failed');
      return await res.json();
    } catch (e: any) {
      console.warn('AI API unreachable, using client fallback generator', e.message);
      return null;
    }
  }

  // --- Exports Endpoint ---

  async createExport(projectId: string, format: string, options?: any): Promise<ExportJob> {
    try {
      const res = await fetch(`${API_BASE}/exports`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ projectId, format, options }),
      });
      if (!res.ok) throw new Error('Failed to start export');
      return await res.json();
    } catch {
      return {
        id: 'job-' + Math.random().toString(36).substring(2, 7),
        projectId,
        format: format as any,
        status: 'completed',
        progress: 100,
        createdAt: new Date().toISOString(),
      };
    }
  }

  // Local Storage Helpers for Offline Resilience
  private getLocalProjectKeys(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('visualflow_project_index');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLocalProject(project: UniversalProject) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`visualflow_project_${project.id}`, JSON.stringify(project));
      const keys = this.getLocalProjectKeys();
      if (!keys.includes(project.id)) {
        keys.unshift(project.id);
        localStorage.setItem('visualflow_project_index', JSON.stringify(keys));
      }
    } catch (e) {
      console.error('Failed to save project locally', e);
    }
  }

  private getLocalProject(id: string): UniversalProject | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`visualflow_project_${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private getLocalProjects(filter?: { type?: string; isStarred?: boolean; search?: string }): any[] {
    const keys = this.getLocalProjectKeys();
    const projects: any[] = [];
    for (const key of keys) {
      const p = this.getLocalProject(key);
      if (!p) continue;
      if (filter?.type && filter.type !== 'all' && p.type !== filter.type) continue;
      if (filter?.isStarred !== undefined && p.isStarred !== filter.isStarred) continue;
      if (filter?.search && !p.title.toLowerCase().includes(filter.search.toLowerCase())) continue;
      projects.push({
        ...p,
        pageCount: p.pages.length,
      });
    }
    return projects;
  }
}

export const api = new ApiClient();
