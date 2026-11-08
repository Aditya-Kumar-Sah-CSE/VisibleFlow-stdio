'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Presentation,
  GitBranch,
  Network,
  BarChart3,
  FileCheck2,
  Plus,
  Search,
  Star,
  Folder,
  Trash2,
  Copy,
  Edit2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  ChevronRight,
  Layers,
  MoreVertical,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import type { ProjectType, UniversalProject, Template } from '@visualflow/shared-types';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'starred'>('all');
  const [selectedStudioFilter, setSelectedStudioFilter] = useState<string>('all');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const studioLaunchers = [
    {
      type: 'flowchart' as ProjectType,
      name: 'Flowchart',
      desc: 'Smart nodes & logic graphs',
      icon: GitBranch,
      gradient: 'from-emerald-600 to-teal-500',
      badge: 'Interactive Flow',
    },
    {
      type: 'slide' as ProjectType,
      name: 'Presentation',
      desc: '16:9 slides & keynotes',
      icon: Presentation,
      gradient: 'from-orange-600 to-amber-500',
      badge: 'Native PPTX',
    },
    {
      type: 'document' as ProjectType,
      name: 'Document',
      desc: 'A4 pagination & KaTeX math',
      icon: FileText,
      gradient: 'from-blue-600 to-indigo-500',
      badge: 'Zero-LaTeX Math',
    },
    {
      type: 'diagram' as ProjectType,
      name: 'Diagram',
      desc: 'UML, ER & Cloud Architecture',
      icon: Network,
      gradient: 'from-purple-600 to-pink-500',
      badge: 'System Design',
    },
    {
      type: 'chart' as ProjectType,
      name: 'Chart',
      desc: 'ECharts & Tabular data editor',
      icon: BarChart3,
      gradient: 'from-cyan-600 to-blue-500',
      badge: 'Apache ECharts',
    },
    {
      type: 'pdf' as ProjectType,
      name: 'PDF Studio',
      desc: 'Merge, split & markup PDFs',
      icon: FileCheck2,
      gradient: 'from-rose-600 to-orange-500',
      badge: 'PDF Engine',
    },
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedProjects, fetchedTemplates] = await Promise.all([
        api.getProjects({
          type: selectedStudioFilter !== 'all' ? selectedStudioFilter : undefined,
          isStarred: activeTab === 'starred' ? true : undefined,
          search: searchQuery || undefined,
        }),
        api.getTemplates(),
      ]);
      setProjects(fetchedProjects);
      setTemplates(fetchedTemplates);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStudioFilter, activeTab]);

  const handleCreateProject = async (type: ProjectType, defaultTitle?: string) => {
    const title = defaultTitle || `New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    try {
      const newProj = await api.createProject(type, title);
      toast.success(`Created ${newProj.title}`);
      router.push(`/studio/${newProj.id}`);
    } catch {
      toast.error('Failed to create project');
    }
  };

  const handleCreateFromTemplate = async (template: Template) => {
    try {
      const newProj = await api.createProject(template.category, template.title, template.projectData);
      toast.success(`Created from template "${template.title}"`);
      router.push(`/studio/${newProj.id}`);
    } catch {
      toast.error('Failed to create project from template');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const dup = await api.duplicateProject(id);
      setProjects((prev) => [dup, ...prev]);
      toast.success(`Duplicated as "${dup.title}"`);
    } catch {
      toast.error('Failed to duplicate project');
    }
  };

  const handleToggleStar = async (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const updated = await api.updateProject(project.id, { isStarred: !project.isStarred });
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, isStarred: updated.isStarred } : p)));
      toast.success(updated.isStarred ? 'Added to Starred' : 'Removed from Starred');
    } catch {
      toast.error('Failed to update project');
    }
  };

  const handleStartRename = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    e.preventDefault();
    setRenamingId(project.id);
    setRenameValue(project.title);
  };

  const handleSaveRename = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!renameValue.trim()) return;
    try {
      await api.updateProject(id, { title: renameValue.trim() });
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, title: renameValue.trim() } : p)));
      setRenamingId(null);
      toast.success('Project renamed');
    } catch {
      toast.error('Failed to rename');
    }
  };

  const getStudioBadgeColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'slide':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'flowchart':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'diagram':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'chart':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-white">VisualFlow <span className="text-blue-400 font-medium">Studio</span></span>
          </Link>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Workspace</span>
        </div>

        {/* Global Search */}
        <div className="relative w-80 max-w-sm hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 pl-3 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
              D
            </div>
            <span className="text-xs font-medium text-slate-300 hidden sm:inline">Demo Creator</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Studio Launchers Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Create New</h1>
              <p className="text-xs text-slate-400 mt-0.5">Select a studio to launch with dedicated rendering and editing tools</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {studioLaunchers.map((studio) => {
              const Icon = studio.icon;
              return (
                <button
                  key={studio.type}
                  onClick={() => handleCreateProject(studio.type)}
                  className="group relative p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700 transition-all text-left flex flex-col justify-between h-36 overflow-hidden shadow-sm hover:shadow-md"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${studio.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                      {studio.name}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {studio.desc}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Template Gallery Section */}
        {templates.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h2 className="text-base font-bold text-white">Recommended Templates</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleCreateFromTemplate(tmpl)}
                  className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-950 overflow-hidden hover:border-slate-700 transition-all"
                >
                  <div className="h-32 bg-slate-900 relative overflow-hidden">
                    <img
                      src={tmpl.thumbnailUrl}
                      alt={tmpl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-200 border border-slate-700 capitalize">
                        {tmpl.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-xs text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {tmpl.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {tmpl.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Explorer */}
        <div>
          {/* Filters & Tabs Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Projects
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'recent' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setActiveTab('starred')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'starred' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Starred</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Filter Studio:</span>
              <select
                value={selectedStudioFilter}
                onChange={(e) => setSelectedStudioFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Studios</option>
                <option value="flowchart">Flowchart</option>
                <option value="slide">Presentation</option>
                <option value="document">Document</option>
                <option value="diagram">Diagram</option>
                <option value="chart">Chart</option>
              </select>
            </div>
          </div>

          {/* Project Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-56 rounded-xl border border-slate-800 bg-slate-950/40 animate-pulse p-4">
                  <div className="h-28 bg-slate-800 rounded-lg mb-3" />
                  <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No projects found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery ? 'No projects match your search query.' : 'Create your first document, slide deck, flowchart, or chart to get started.'}
              </p>
              <button
                onClick={() => handleCreateProject('flowchart')}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
              >
                Create Flowchart Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => router.push(`/studio/${proj.id}`)}
                  className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-950 overflow-hidden hover:border-slate-700 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  {/* Thumbnail Banner */}
                  <div className="h-36 bg-slate-900 canvas-grid-pattern relative flex items-center justify-center border-b border-slate-800/80 p-4">
                    <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-center shadow-md">
                      <span className="text-xs font-bold text-slate-200 block truncate max-w-[140px]">
                        {proj.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 capitalize">
                        {proj.type} Studio
                      </span>
                    </div>

                    {/* Star button */}
                    <button
                      onClick={(e) => handleToggleStar(e, proj)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      <Star className={`w-3.5 h-3.5 ${proj.isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                    </button>

                    <div className="absolute bottom-2 left-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-slate-300">
                        {proj.type}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {renamingId === proj.id ? (
                        <form onSubmit={(e) => handleSaveRename(e, proj.id)} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={(e) => handleSaveRename(e, proj.id)}
                            autoFocus
                            className="w-full bg-slate-900 border border-blue-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
                          />
                        </form>
                      ) : (
                        <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                          {proj.title}
                        </h3>
                      )}
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Edited {new Date(proj.updatedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{proj.pageCount || 1} {proj.pageCount === 1 ? 'page' : 'pages'}</span>
                      </div>
                    </div>

                    {/* Quick Action Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => handleStartRename(e, proj)}
                          title="Rename"
                          className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDuplicate(e, proj.id)}
                          title="Duplicate"
                          className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, proj.id)}
                          title="Delete"
                          className="p-1 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[11px] font-medium text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                        Open <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
