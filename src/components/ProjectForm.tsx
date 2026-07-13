/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VideoProject, ProjectCategory, CrewMember } from '../types';
import { X, Plus, Trash2, HelpCircle } from 'lucide-react';
import { uploadToCloudinary } from '../cloudinary';

interface ProjectFormProps {
  project: VideoProject | null; // Null means we are creating a new project
  onSave: (project: VideoProject) => void;
  onClose: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('narrative');
  const [client, setClient] = useState('');
  const [role, setRole] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  // Custom states for list items
  const [gearText, setGearText] = useState(''); // Comma separated
  const [crewList, setCrewList] = useState<CrewMember[]>([]);
  
  // Crew inputs temp state
  const [tempCrewRole, setTempCrewRole] = useState('');
  const [tempCrewName, setTempCrewName] = useState('');

  // Drag-and-drop & File Upload state for thumbnail customization
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file (PNG, JPG, WEBP).');
      return;
    }
    
    setIsUploading(true);
    try {
      const secureUrl = await uploadToCloudinary(file);
      setThumbnailUrl(secureUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Populate form if we are editing an existing project
  useEffect(() => {
    setErrorMessage(null);
    if (project) {
      setTitle(project.title);
      setCategory(project.category);
      setClient(project.client || '');
      setRole(project.role);
      setYear(project.year);
      setDuration(project.duration);
      setDescription(project.description);
      setSynopsis(project.synopsis || '');
      setVideoUrl(project.videoUrl);
      setThumbnailUrl(project.thumbnailUrl);
      setGearText(project.gearUsed ? project.gearUsed.join(', ') : '');
      setCrewList(project.crewList || []);
    } else {
      // Clear fields
      setTitle('');
      setCategory('narrative');
      setClient('');
      setRole('');
      setYear(new Date().getFullYear());
      setDuration('');
      setDescription('');
      setSynopsis('');
      setVideoUrl('');
      setThumbnailUrl('');
      setGearText('');
      setCrewList([]);
    }
  }, [project]);

  const addCrewMember = () => {
    if (!tempCrewRole.trim() || !tempCrewName.trim()) return;
    setCrewList([...crewList, { role: tempCrewRole.trim(), name: tempCrewName.trim() }]);
    setTempCrewRole('');
    setTempCrewName('');
  };

  const removeCrewMember = (index: number) => {
    setCrewList(crewList.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!title.trim() || !role.trim() || !videoUrl.trim()) {
      setErrorMessage('Please fill out the Title, Role, and Video URL.');
      return;
    }

    // Process gear list
    const gearUsed = gearText
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g !== '');

    const savedProject: VideoProject = {
      id: project ? project.id : `user-project-${Date.now()}`,
      title: title.trim(),
      category,
      client: client.trim() || undefined,
      role: role.trim(),
      year,
      duration: duration.trim() || '0:00',
      description: description.trim(),
      synopsis: synopsis.trim() || undefined,
      videoUrl: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
      gearUsed: gearUsed.length > 0 ? gearUsed : undefined,
      crewList: crewList.length > 0 ? crewList : undefined,
    };

    onSave(savedProject);
  };

  return (
    <div
      id="project-editor-drawer"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-neutral-200 flex flex-col focus:outline-hidden"
    >
      {/* Drawer Header */}
      <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
        <h3 className="text-base font-medium tracking-tight text-neutral-900 font-sans uppercase">
          {project ? 'Edit Project Specifications' : 'Upload New Video Project'}
        </h3>
        <button
          id="close-drawer-btn"
          onClick={onClose}
          className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors focus:ring-1 focus:ring-black focus:outline-hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Form Container */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center justify-between rounded-sm">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-700 font-bold ml-2 text-sm"
            >
              &times;
            </button>
          </div>
        )}
        
        {/* Core details */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-neutral-500 uppercase mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Solstice Coffee - The Morning Ritual"
              className="w-full px-3 py-2 border border-neutral-200 focus-ring text-sm font-sans text-neutral-900 placeholder-neutral-400 bg-brand-beige"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-neutral-500 uppercase mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3 py-2 border border-neutral-200 focus-ring text-sm font-mono text-neutral-900 bg-brand-beige"
              >
                <option value="narrative">Narrative</option>
                <option value="documentary">Documentary</option>
                <option value="commercial">Commercial</option>
                <option value="notes">Notes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-500 uppercase mb-1">Client/Organization</label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g., Solstice Coffee Roasters"
                className="w-full px-3 py-2 border border-neutral-200 focus-ring text-sm font-sans text-neutral-900 placeholder-neutral-400 bg-brand-beige"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-mono text-neutral-500 uppercase mb-1">Your Role *</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Director of Photography"
                className="w-full px-3 py-2 border border-neutral-200 focus-ring text-sm font-sans text-neutral-900 placeholder-neutral-400 bg-brand-beige"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-500 uppercase mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="w-full px-3 py-2 border border-neutral-200 focus-ring text-sm font-sans text-neutral-900 bg-brand-beige"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-neutral-500 uppercase mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 2:30 or 12:45"
                className="w-full px-3 py-2 border border-neutral-200 focus-ring text-sm font-sans text-neutral-900 placeholder-neutral-400 bg-brand-beige"
              />
            </div>
          </div>

          <div className="space-y-1.5 border-t border-neutral-100 pt-3">
            <label className="block text-xs font-mono text-neutral-500 uppercase">
              Thumbnail Cover Image
            </label>
            <p className="text-[10px] text-neutral-400 italic mb-2">
              Select or drag an image file, or paste an external image URL below. This represents the preview thumbnail seen before selecting the video.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && document.getElementById('thumbnail-file-input')?.click()}
                className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-amber-500 bg-amber-50/40 text-amber-700'
                    : 'border-neutral-200 hover:border-neutral-400 bg-neutral-50 text-neutral-500'
                } ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <input
                  type="file"
                  id="thumbnail-file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-1"></div>
                    <span className="text-xs font-mono text-amber-600 animate-pulse">Uploading to Cloudinary...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-6 h-6 mb-1 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium text-neutral-700 block">
                      Click or drag image file
                    </span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      PNG, JPG, WEBP formats
                    </span>
                  </>
                )}
              </div>

              {/* URL input and Thumbnail Preview */}
              <div className="flex flex-col justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3">
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-950 border border-neutral-200 rounded-sm flex items-center justify-center">
                  {thumbnailUrl ? (
                    <>
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setThumbnailUrl('')}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/75 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                        title="Clear Thumbnail"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-neutral-400 italic font-serif">
                      No thumbnail cover
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                    Or paste external Image URL
                  </label>
                  <input
                    type="url"
                    value={thumbnailUrl && thumbnailUrl.startsWith('data:') ? '' : thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-2.5 py-1.5 border border-neutral-200 focus-ring text-xs font-sans text-neutral-900 placeholder-neutral-400 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Connection */}
        <div className="bg-neutral-50 p-4 border border-neutral-100">
          <div className="flex items-center gap-1.5 mb-2">
            <label className="block text-xs font-mono text-neutral-700 uppercase font-semibold">Video URL / Link *</label>
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-neutral-400 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-5 hidden group-hover:block w-64 p-3 bg-neutral-900 text-white text-[11px] font-sans leading-snug shadow-lg rounded-sm z-50">
                Supports YouTube watch links, Vimeo links, and direct video file paths (.mp4, .webm).
              </div>
            </div>
          </div>
          <input
            type="text"
            required
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="e.g., https://vimeo.com/1234567"
            className="w-full px-3 py-2 border border-neutral-200 focus-ring text-sm font-sans text-neutral-900 placeholder-neutral-400 bg-white"
          />
        </div>

        {/* Text descriptions */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-neutral-500 uppercase mb-1">Production Brief / Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short statement outlining the creative intent, mood, style, or story behind this piece."
              rows={3}
              className="w-full px-3 py-2 border border-neutral-200 focus-ring text-sm font-sans text-neutral-900 placeholder-neutral-400 bg-brand-beige resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-500 uppercase mb-1">Detailed Synopsis or Narrative</label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Full concept, director commentary, or background lore (displayed elegantly on details view)."
              rows={2}
              className="w-full px-3 py-2 border border-neutral-200 focus-ring text-sm font-sans text-neutral-900 placeholder-neutral-400 bg-brand-beige resize-none"
            />
          </div>
        </div>

        {/* Technical Gear */}
        <div>
          <label className="block text-xs font-mono text-neutral-500 uppercase mb-1">Technical Gear (comma-separated)</label>
          <input
            type="text"
            value={gearText}
            onChange={(e) => setGearText(e.target.value)}
            placeholder="RED Komodo 6K, Cooke Anamorphic Lenses, DaVinci Resolve Studio"
            className="w-full px-3 py-2 border border-neutral-200 focus-ring text-sm font-sans text-neutral-900 placeholder-neutral-400 bg-brand-beige"
          />
        </div>

        {/* Dynamic Crew List */}
        <div className="pt-2 border-t border-neutral-100">
          <label className="block text-xs font-mono text-neutral-500 uppercase mb-2">Production Crew List</label>
          
          {crewList.length > 0 && (
            <div className="mb-3 space-y-1.5 max-h-40 overflow-y-auto border border-neutral-100 p-2 bg-neutral-50">
              {crewList.map((crew, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs text-neutral-700 bg-white border border-neutral-200/60 px-2 py-1 font-mono">
                  <span>
                    <strong className="text-neutral-500 font-medium">{crew.role}:</strong> {crew.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCrewMember(idx)}
                    className="p-1 hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={tempCrewRole}
              onChange={(e) => setTempCrewRole(e.target.value)}
              placeholder="Crew Role (e.g., Gaffer)"
              className="px-2.5 py-1.5 border border-neutral-200 focus-ring text-xs font-sans text-neutral-900 placeholder-neutral-400 bg-brand-beige"
            />
            <div className="flex gap-1.5">
              <input
                type="text"
                value={tempCrewName}
                onChange={(e) => setTempCrewName(e.target.value)}
                placeholder="Crew Name (e.g., Alice Wu)"
                className="flex-1 px-2.5 py-1.5 border border-neutral-200 focus-ring text-xs font-sans text-neutral-900 placeholder-neutral-400 bg-brand-beige"
              />
              <button
                type="button"
                onClick={addCrewMember}
                className="bg-neutral-900 text-white hover:bg-neutral-800 px-2.5 py-1.5 flex items-center justify-center cursor-pointer transition-colors"
                title="Add Crew Member"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </form>

      {/* Drawer Action Bar */}
      <div className="p-5 border-t border-neutral-100 flex gap-3 bg-neutral-50">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 text-xs font-mono tracking-wider border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-100 bg-white transition-colors uppercase"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          type="button"
          className="flex-1 py-2 text-xs font-mono tracking-wider bg-neutral-900 text-white hover:bg-neutral-800 transition-colors uppercase font-medium"
        >
          {project ? 'Save Changes' : 'Publish Project'}
        </button>
      </div>
    </div>
  );
};
