/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { VideoProject, ProjectCategory, BlogPost } from './types';
import { INITIAL_PROJECTS } from './data';
import { INITIAL_BLOG_POSTS } from './blogData';
import { ProjectCard } from './components/ProjectCard';
import { ProjectModal } from './components/ProjectModal';
import { ProjectForm } from './components/ProjectForm';
import { ContactPage } from './components/ContactPage';
import {
  Film,
  Search,
  Plus,
  Lock,
  Unlock,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Play,
  X,
  RefreshCw,
  BookOpen,
  Calendar,
  Clock,
  Cpu,
  Edit,
  Trash2,
  Upload,
  Menu,
  LogOut,
  LogIn,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import dbUsers from './db.json';
import { 
  fetchProjectsFromFirestore, 
  saveProjectToFirestore, 
  deleteProjectFromFirestore, 
  fetchSettingsFromFirestore, 
  saveSettingsToFirestore, 
  fetchUsersFromFirestore,
  AdminUser,
  db
} from './firebase';
import { uploadToCloudinary } from './cloudinary';
import { writeBatch, doc } from 'firebase/firestore';

const SHOW_NOTES = false; // Toggle to true to turn the production notes feature back on

export default function App() {
  // Primary state: load projects from state, loaded from Firestore
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [allowedUsers, setAllowedUsers] = useState<AdminUser[]>([]);

  // Segment-specific background images configuration
  const [segmentImages, setSegmentImages] = useState<Record<ProjectCategory, string>>({
    narrative: '',
    documentary: '',
    commercial: '',
    notes: '',
  });

  // Segment-specific background captions configuration
  const [segmentCaptions, setSegmentCaptions] = useState<Record<ProjectCategory, string>>({
    narrative: 'Pièce de Résistance, 2025. Shot on FX9.',
    documentary: 'Funny Business, 2026. Shot on Sony FX3',
    commercial: 'Pragyaan (Podcast)',
    notes: 'Director notebook & project documentation, 2026.',
  });

  // Header background GIF/Image/Video configuration
  const [headerBackground, setHeaderBackground] = useState<string>('');

  // Header positioning & cropping configuration
  const [headerZoom, setHeaderZoom] = useState<number>(100);
  const [headerXOffset, setHeaderXOffset] = useState<number>(50);
  const [headerYOffset, setHeaderYOffset] = useState<number>(50);
  const [headerAspectRatio, setHeaderAspectRatio] = useState<string>('aspect-video md:aspect-[21/9]');

  // Vertical (Mobile) positioning & cropping configuration
  const [headerZoomVertical, setHeaderZoomVertical] = useState<number>(100);
  const [headerXOffsetVertical, setHeaderXOffsetVertical] = useState<number>(50);
  const [headerYOffsetVertical, setHeaderYOffsetVertical] = useState<number>(50);

  const [activeCropMode, setActiveCropMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isHeaderDragging, setIsHeaderDragging] = useState(false);

  // Active page route representing "pages within the website" or null for all home bands
  const [activeCategoryTab, setActiveCategoryTab] = useState<ProjectCategory | 'contact' | null>(null);

  // Contact page states
  const [contactBio, setContactBio] = useState<string>("Cinematographer & Director of Photography based in Mumbai, India. Specialized in anamorphic storytelling, commercial campaigns, and narrative features. Translating emotions into frames.");
  const [contactEmail, setContactEmail] = useState<string>("bahriakshit@gmail.com");
  const [contactPhoto, setContactPhoto] = useState<string>("/src/assets/images/akshit_portrait_1783337842451.jpg");

  // Load initial data from Firestore
  useEffect(() => {
    async function loadAllData() {
      try {
        setIsDataLoading(true);
        const [loadedProjects, loadedSettings, loadedUsers] = await Promise.all([
          fetchProjectsFromFirestore(),
          fetchSettingsFromFirestore(),
          fetchUsersFromFirestore()
        ]);

        setProjects(loadedProjects);
        setAllowedUsers(loadedUsers);

        // Map settings
        if (loadedSettings) {
          if (loadedSettings.segmentImages) setSegmentImages(loadedSettings.segmentImages);
          if (loadedSettings.segmentCaptions) setSegmentCaptions(loadedSettings.segmentCaptions);
          if (loadedSettings.headerBackground !== undefined) setHeaderBackground(loadedSettings.headerBackground);
          if (loadedSettings.headerZoom !== undefined) setHeaderZoom(loadedSettings.headerZoom);
          if (loadedSettings.headerXOffset !== undefined) setHeaderXOffset(loadedSettings.headerXOffset);
          if (loadedSettings.headerYOffset !== undefined) setHeaderYOffset(loadedSettings.headerYOffset);
          if (loadedSettings.headerAspectRatio !== undefined) setHeaderAspectRatio(loadedSettings.headerAspectRatio);
          if (loadedSettings.headerZoomVertical !== undefined) setHeaderZoomVertical(loadedSettings.headerZoomVertical);
          if (loadedSettings.headerXOffsetVertical !== undefined) setHeaderXOffsetVertical(loadedSettings.headerXOffsetVertical);
          if (loadedSettings.headerYOffsetVertical !== undefined) setHeaderYOffsetVertical(loadedSettings.headerYOffsetVertical);
          if (loadedSettings.contactBio !== undefined) setContactBio(loadedSettings.contactBio);
          if (loadedSettings.contactEmail !== undefined) setContactEmail(loadedSettings.contactEmail);
          if (loadedSettings.contactPhoto !== undefined) setContactPhoto(loadedSettings.contactPhoto);
        }
      } catch (error) {
        console.error('Error initializing data from Firestore:', error);
      } finally {
        setIsDataLoading(false);
      }
    }
    loadAllData();
  }, []);

  // Synchronise global settings changes to Firestore with a debounce to avoid rate limiting
  useEffect(() => {
    if (isDataLoading) return; // Wait until initial data is loaded from Firestore

    const delayDebounce = setTimeout(async () => {
      try {
        await saveSettingsToFirestore({
          segmentImages,
          segmentCaptions,
          headerBackground,
          headerZoom,
          headerXOffset,
          headerYOffset,
          headerAspectRatio,
          headerZoomVertical,
          headerXOffsetVertical,
          headerYOffsetVertical,
          contactBio,
          contactEmail,
          contactPhoto
        });
        console.log('Successfully synchronised settings to Firestore.');
      } catch (error) {
        console.error('Failed to auto-sync settings to Firestore:', error);
      }
    }, 1000); // Debounce by 1 second

    return () => clearTimeout(delayDebounce);
  }, [
    segmentImages,
    segmentCaptions,
    headerBackground,
    headerZoom,
    headerXOffset,
    headerYOffset,
    headerAspectRatio,
    headerZoomVertical,
    headerXOffsetVertical,
    headerYOffsetVertical,
    contactBio,
    contactEmail,
    contactPhoto,
    isDataLoading
  ]);

  const handleHeaderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processHeaderFile(file);
    }
  };

  const processHeaderFile = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setToastMessage('Please select a valid image, GIF, or video file.');
      return;
    }

    setToastMessage('Uploading header background to Cloudinary...');
    try {
      const secureUrl = await uploadToCloudinary(file);
      setHeaderBackground(secureUrl);
      setToastMessage('Header background uploaded and updated successfully!');
    } catch (err: any) {
      setToastMessage(`Upload failed: ${err.message || err}`);
    }
  };

  // Blog Posts state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const cached = localStorage.getItem('video_portfolio_blog_posts');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to restore custom blog posts:', e);
      }
    }
    return INITIAL_BLOG_POSTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('video_portfolio_blog_posts', JSON.stringify(blogPosts));
    } catch (e) {
      console.error('Failed to save blog posts to localStorage:', e);
    }
  }, [blogPosts]);

  // Selected blog post to view details
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);

  const [coverInputVal, setCoverInputVal] = useState('');
  const [image1InputVal, setImage1InputVal] = useState('');
  const [image2InputVal, setImage2InputVal] = useState('');
  const [image3InputVal, setImage3InputVal] = useState('');

  useEffect(() => {
    if (isBlogFormOpen) {
      setCoverInputVal(editingBlogPost?.coverUrl || '');
      setImage1InputVal(editingBlogPost?.image1Url || '');
      setImage2InputVal(editingBlogPost?.image2Url || '');
      setImage3InputVal(editingBlogPost?.image3Url || '');
    } else {
      setCoverInputVal('');
      setImage1InputVal('');
      setImage2InputVal('');
      setImage3InputVal('');
    }
  }, [editingBlogPost, isBlogFormOpen]);

  const compressAndSetImage = (file: File, callback: (url: string) => void) => {
    if (!file.type.startsWith('image/')) {
      setToastMessage('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const rawUrl = event.target.result as string;
        
        // Skip canvas resize for small gifs to keep animation
        if (file.type === 'image/gif') {
          callback(rawUrl);
          return;
        }

        const img = new Image();
        img.onload = () => {
          const maxDim = 1200; // Optimal size for blog visuals
          let width = img.width;
          let height = img.height;
          
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.82);
            callback(compressedUrl);
          } else {
            callback(rawUrl);
          }
        };
        img.onerror = () => {
          callback(rawUrl);
        };
        img.src = rawUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  // Dialog & Modal controls
  const [activeProject, setActiveProject] = useState<VideoProject | null>(null);
  const [editingProject, setEditingProject] = useState<VideoProject | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasAdminAuthorized, setHasAdminAuthorized] = useState<boolean>(() => {
    const cached = localStorage.getItem('video_portfolio_admin_authorized');
    return cached === 'true';
  });
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    const cached = localStorage.getItem('video_portfolio_admin_authorized');
    return cached === 'true';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // URL query parameter check on mount to unlock/lock admin toggle or trigger login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'true') {
      setIsLoginDialogOpen(true);
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    } else if (params.get('admin') === 'true') {
      setIsLoginDialogOpen(true);
      setToastMessage('Please log in with your credentials to unlock admin features.');
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    } else if (params.get('admin') === 'false') {
      localStorage.removeItem('video_portfolio_admin_authorized');
      setHasAdminAuthorized(false);
      setIsAdminMode(false);
      setToastMessage('Admin mode locked. The edit toggle is now hidden.');
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Custom dialogs & notification states (to replace blocked iframe alerts/confirms)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Scroll to top when changing active tab/category or selecting a blog post
  // Also reset active blog post when moving away from 'notes' category
  useEffect(() => {
    if (activeCategoryTab !== 'notes') {
      setActiveBlogPost(null);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeCategoryTab, activeBlogPost]);

  // Filter logic based on category selection
  const filteredProjects = useMemo(() => {
    return projects;
  }, [projects]);

  // Grouped portfolios
  const groupedCategories = useMemo(() => {
    const list: { id: ProjectCategory; title: string; num: string; description: string; items: VideoProject[] }[] = [
      {
        id: 'narrative',
        title: 'Narrative',
        num: '01',
        description: '',
        items: []
      },
      {
        id: 'documentary',
        title: 'Documentary',
        num: '02',
        description: '',
        items: []
      },
      {
        id: 'commercial',
        title: 'Commercial',
        num: '03',
        description: '',
        items: []
      },
      {
        id: 'notes',
        title: 'Notes',
        num: '04',
        description: '',
        items: []
      }
    ];

    list.forEach((cat) => {
      cat.items = filteredProjects.filter((item) => item.category === cat.id);
    });

    return list;
  }, [filteredProjects]);

  // Scroll to horizontal dividers smoothly
  const scrollToCategory = (id: string) => {
    setActiveCategoryTab(null); // Reset page tab view first to ensure home section renders
    setTimeout(() => {
      const element = document.getElementById(`section-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Add Project click
  const handleAddNewProjectClick = (categoryHint?: ProjectCategory) => {
    setEditingProject(null);
    setIsFormOpen(true);
    if (categoryHint) {
      setTimeout(() => {
        const select = document.querySelector('select') as HTMLSelectElement;
        if (select) select.value = categoryHint;
      }, 50);
    }
  };

  // Edit action
  const handleEditSelect = (project: VideoProject) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  // Save action
  const handleSaveProject = async (savedProject: VideoProject) => {
    try {
      await saveProjectToFirestore(savedProject);
      const exists = projects.find((p) => p.id === savedProject.id);
      if (exists) {
        setProjects(projects.map((p) => (p.id === savedProject.id ? savedProject : p)));
      } else {
        setProjects([savedProject, ...projects]);
      }
      setToastMessage('Project saved successfully.');
    } catch (err: any) {
      console.error('Error saving project:', err);
      setToastMessage(`Failed to save project: ${err.message || err}`);
    }
    // Set activeCategoryTab to show the page with their changes
    setActiveCategoryTab(savedProject.category);
    setIsFormOpen(false);
    setEditingProject(null);
  };

  // Delete action (opens custom confirm modal)
  const handleDeleteProgress = (id: string) => {
    setDeleteConfirmId(id);
  };

  // Move / Reorder action
  const handleMoveProject = async (id: string, direction: 'left' | 'right') => {
    const projIndex = projects.findIndex((p) => p.id === id);
    if (projIndex === -1) return;
    
    const targetProj = projects[projIndex];
    
    // Find all indices of projects sharing the exact same category
    const sameCatIndices = projects
      .map((p, idx) => (p.category === targetProj.category ? idx : -1))
      .filter((idx) => idx !== -1);
      
    const positionInCat = sameCatIndices.indexOf(projIndex);
    if (positionInCat === -1) return;
    
    let swapIndex = -1;
    if (direction === 'left' && positionInCat > 0) {
      swapIndex = sameCatIndices[positionInCat - 1];
    } else if (direction === 'right' && positionInCat < sameCatIndices.length - 1) {
      swapIndex = sameCatIndices[positionInCat + 1];
    }
    
    if (swapIndex !== -1) {
      const updated = [...projects];
      const temp = updated[projIndex];
      updated[projIndex] = updated[swapIndex];
      updated[swapIndex] = temp;
      
      try {
        const batch = writeBatch(db);
        updated.forEach((p) => {
          batch.set(doc(db, 'projects', p.id), p);
        });
        await batch.commit();
        setProjects(updated);
        setToastMessage('Project order updated.');
      } catch (err: any) {
        console.error('Failed to save reordered projects:', err);
        setToastMessage('Failed to save project order.');
      }
    }
  };

  // Reset to default sample portfolio items (opens custom confirm modal)
  const handleResetToDefaults = () => {
    setResetConfirmOpen(true);
  };

  const navTabs = SHOW_NOTES
    ? (['narrative', 'documentary', 'commercial', 'notes', 'contact'] as const)
    : (['narrative', 'documentary', 'commercial', 'contact'] as const);

  const sDesk = headerZoom / 100;
  const txDesk = sDesk > 1 ? ((headerXOffset - 50) * (sDesk - 1)) / sDesk : 0;
  const tyDesk = sDesk > 1 ? ((headerYOffset - 50) * (sDesk - 1)) / sDesk : 0;

  const sMob = headerZoomVertical / 100;
  const txMob = sMob > 1 ? ((headerXOffsetVertical - 50) * (sMob - 1)) / sMob : 0;
  const tyMob = sMob > 1 ? ((headerYOffsetVertical - 50) * (sMob - 1)) / sMob : 0;

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col justify-between selection:bg-white selection:text-black font-serif">
      
      {/* Header Sticky Navigation floating on dark backdrop */}
      <nav className="w-full border-b border-neutral-900 bg-neutral-950/95 sticky top-0 backdrop-blur-md z-40">
        {/* Horizontal (Desktop/Tablet) Layout */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 h-20 items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveCategoryTab(null)}>
            <span className="font-serif font-semibold text-lg md:text-xl tracking-widest uppercase text-white">
              Akshit Bahri
            </span>
            <span className="text-[10px] text-neutral-500 font-serif italic tracking-widest hidden sm:inline">
              // Director of Photography
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Quick Filter Selection */}
            <div className="flex items-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-neutral-400 overflow-x-auto scrollbar-none max-w-[55vw] sm:max-w-none">
              {navTabs.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategoryTab(cat);
                  }}
                  className={`hover:text-white transition-colors cursor-pointer capitalize font-serif italic tracking-wider py-1 border-b shrink-0 ${
                    activeCategoryTab === cat
                      ? 'text-white border-white'
                      : 'border-transparent text-neutral-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Subtle Admin Mode Toggle Button */}
            {hasAdminAuthorized && (
              <button
                id="admin-mode-toggle"
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border font-serif italic text-xs tracking-wider transition-all duration-200 cursor-pointer ${
                  isAdminMode
                    ? 'bg-amber-950/30 border-amber-600/50 text-amber-300 font-medium'
                    : 'bg-transparent border-neutral-800 text-neutral-400 hover:text-white'
                }`}
                title="Toggle Custom Project Editor"
              >
                {isAdminMode ? <Unlock className="w-3.5 h-3.5 text-amber-500" /> : <Lock className="w-3.5 h-3.5 text-neutral-500" />}
                <span className="hidden sm:inline">{isAdminMode ? 'Editor Enabled' : 'Portfolio Editor'}</span>
              </button>
            )}

            {/* Logout on Desktop (Only visible when logged in) */}
            {hasAdminAuthorized && (
              <button
                onClick={() => {
                  localStorage.removeItem('video_portfolio_admin_authorized');
                  setHasAdminAuthorized(false);
                  setIsAdminMode(false);
                  setToastMessage('Logged out of Admin mode.');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white font-serif italic text-xs tracking-wider transition-all duration-200 cursor-pointer bg-neutral-950"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Vertical (Mobile/Portrait) Layout */}
        <div className="flex md:hidden w-full px-6 h-20 items-center justify-between relative">
          <div className="flex flex-col items-start justify-center cursor-pointer text-left" onClick={() => { setActiveCategoryTab(null); setIsMobileMenuOpen(false); }}>
            <span className="font-serif font-semibold text-base sm:text-lg tracking-widest uppercase text-white">
              Akshit Bahri
            </span>
            <span className="text-[9px] text-neutral-500 font-serif italic tracking-widest mt-0.5">
              Director of Photography
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile/Tablet Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 border border-neutral-800 rounded-sm text-neutral-400 hover:text-white transition-all cursor-pointer bg-neutral-900/50 hover:bg-neutral-900"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Drawer / Overlay Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-20 left-0 w-full bg-neutral-950 border-b border-neutral-900 shadow-2xl z-50 md:hidden overflow-hidden"
            >
              <div className="flex flex-col px-6 py-6 space-y-6">
                {/* Available top logo inside the menu */}
                <div className="flex flex-col pb-4 border-b border-neutral-900">
                  <span className="font-serif font-semibold text-lg tracking-widest uppercase text-white">
                    Akshit Bahri
                  </span>
                  <span className="text-[10px] text-neutral-500 font-serif italic tracking-widest mt-1">
                    // Director of Photography
                  </span>
                </div>

                {/* Menus / Links */}
                <div className="flex flex-col space-y-4">
                  <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">Sections</span>
                  {navTabs.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategoryTab(cat);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`text-left text-base font-serif italic tracking-wider py-1.5 capitalize transition-all ${
                        activeCategoryTab === cat
                          ? 'text-white font-medium pl-2 border-l-2 border-amber-500'
                          : 'text-neutral-400 hover:text-white pl-0'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Bottom Section: Editor Toggle (if authorized) & Login / Logout */}
                <div className="pt-6 border-t border-neutral-900 flex flex-col space-y-4">
                  {hasAdminAuthorized && (
                    <div className="flex items-center justify-between bg-neutral-900/40 p-3 border border-neutral-900 rounded-sm">
                      <span className="text-xs text-neutral-400 font-serif italic">Editor Panel</span>
                      <button
                        onClick={() => setIsAdminMode(!isAdminMode)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border font-serif italic text-xs tracking-wider transition-all duration-200 cursor-pointer ${
                          isAdminMode
                            ? 'bg-amber-950/30 border-amber-600/50 text-amber-300'
                            : 'bg-transparent border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {isAdminMode ? <Unlock className="w-3.5 h-3.5 text-amber-500" /> : <Lock className="w-3.5 h-3.5 text-neutral-500" />}
                        <span>{isAdminMode ? 'Editor Enabled' : 'Portfolio Editor'}</span>
                      </button>
                    </div>
                  )}

                  {hasAdminAuthorized && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        localStorage.removeItem('video_portfolio_admin_authorized');
                        setHasAdminAuthorized(false);
                        setIsAdminMode(false);
                        setToastMessage('Logged out of Admin mode.');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 hover:border-neutral-600 text-neutral-300 hover:text-white font-serif italic text-sm tracking-wider transition-all duration-200 cursor-pointer rounded-sm"
                    >
                      <LogOut className="w-4 h-4 text-neutral-400" />
                      <span>Logout</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Primary Container */}
      <div className="flex-1">
        
        {/* Intro/Header Bio Block */}
        {activeCategoryTab === null && (
          <header className={`relative w-full border-b border-neutral-900 ${headerAspectRatio} max-h-[70vh] min-h-[250px] overflow-hidden flex items-center bg-neutral-950 animate-fade-in`}>
            {/* Background Image of film crew/set */}
            <div className="absolute inset-0 z-0 overflow-hidden w-full h-full">
              <style>{`
                .cinematic-header-img {
                  transform: scale(${sDesk}) translate(${txDesk}%, ${tyDesk}%);
                  object-position: ${headerXOffset}% ${headerYOffset}%;
                }
                @media (max-width: 767px) {
                  .cinematic-header-img {
                    transform: scale(${sMob}) translate(${txMob}%, ${tyMob}%) !important;
                    object-position: ${headerXOffsetVertical}% ${headerYOffsetVertical}% !important;
                  }
                }
              `}</style>
              {headerBackground && (headerBackground.toLowerCase().endsWith('.mp4') || headerBackground.toLowerCase().endsWith('.webm') || headerBackground.includes('/video/upload')) ? (
                <video
                  src={headerBackground}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-all duration-300 cinematic-header-img"
                />
              ) : (
                <img
                  src={headerBackground || "/src/assets/images/akshit_bio_background_1782904525358.jpg"}
                  alt="Cinematic Showcase"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-300 cinematic-header-img"
                />
              )}
            </div>
          </header>
        )}

        {/* Cinematic Bands or Isolated Category Page */}

        {/* Cinematic Bands OR Isolated Category Page */}
        {activeCategoryTab === null ? (
          <div className="w-full">
            {groupedCategories
              .filter((group) => group.id !== 'notes')
              .map((group) => {
              const hasItems = group.items.length > 0;
              const featuredProject = group.items[0];

              return (
                <div key={group.id} className="w-full flex flex-col">
                  
                  {/* Horizontal Band Section Header */}
                  <section
                    id={`section-${group.id}`}
                    className="w-full min-h-[60vh] md:min-h-[75vh] flex flex-col justify-between pt-16 pb-4 md:pt-24 md:pb-6 relative overflow-hidden group/row border-b border-black bg-neutral-950"
                  >
                    {/* Backdrop Snap image taking up the entire horizontal space */}
                    <div className="absolute inset-0 z-0">
                      <img
                        src={
                          segmentImages[group.id] ||
                          featuredProject?.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1200'
                        }
                        alt={group.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover/row:scale-105"
                      />
                      {/* Lighter multiplier overlay so the base image is brighter, getting even lighter on hover */}
                      <div className="absolute inset-0 bg-neutral-950/40 mix-blend-multiply transition-colors duration-500 group-hover/row:bg-neutral-950/15" />
                      {/* Soft gradient overlay that brightens on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 transition-opacity duration-500 group-hover/row:opacity-40" />
                    </div>

                    {/* Spacer */}
                    <div className="h-6" />

                    {/* Centered Majestic Category Title (Direct Match of reference picture style) */}
                    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center my-auto py-12 gap-6">
                      <h2
                        onClick={() => setActiveCategoryTab(group.id)}
                        className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-widest text-white leading-none hover:text-amber-200 transition-colors duration-300 cursor-pointer select-none"
                      >
                        {group.title}
                      </h2>

                      {/* All Videos action button leading to page */}
                      <div>
                        <button
                          onClick={() => setActiveCategoryTab(group.id)}
                          className="px-8 py-3.5 border border-white hover:bg-white hover:text-black text-white font-serif italic text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer bg-black/40 backdrop-blur-sm"
                        >
                          All Videos &rarr;
                        </button>
                      </div>
                    </div>

                    {/* Subtle footer credit details of the row */}
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-end text-neutral-400 font-serif italic text-[11px] md:text-xs gap-4">
                      <span className="max-w-xs md:max-w-md text-left leading-relaxed">
                        {segmentCaptions[group.id] || ''}
                      </span>
                      {isAdminMode && (
                        <button
                          onClick={() => handleAddNewProjectClick(group.id)}
                          className="p-1 px-2.5 bg-neutral-900/80 border border-neutral-700 hover:border-white text-xs text-white transition-all uppercase cursor-pointer shrink-0 self-start sm:self-auto"
                        >
                          + Add {group.title} Project
                        </button>
                      )}
                    </div>

                  </section>
                </div>
              );
            })}
          </div>
        ) : activeCategoryTab === 'contact' ? (
          /* Contact Page view representing a distinct contact page */
          <div className="w-full bg-black py-8 md:py-12 animate-fade-in">
            <ContactPage
              isAdminMode={isAdminMode}
              contactBio={contactBio}
              setContactBio={setContactBio}
              contactEmail={contactEmail}
              setContactEmail={setContactEmail}
              contactPhoto={contactPhoto}
              setContactPhoto={setContactPhoto}
              setToastMessage={setToastMessage}
            />
          </div>
        ) : (
          /* Isolated Category Page view representing its own page within the website */
          <div className="w-full bg-black py-8 md:py-12">
            {groupedCategories
              .filter((group) => group.id === activeCategoryTab)
              .map((group) => {
                const hasItems = group.items.length > 0;

                return (
                  <div key={group.id} className="max-w-7xl mx-auto px-6 md:px-12 space-y-8">
                    
                    {/* Clean Minimal Centered Category Header - Title only, no boxes, no back buttons */}
                    {!activeBlogPost && (
                      <div className="w-full flex flex-col items-center justify-center text-center py-4">
                        <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold uppercase tracking-widest text-white leading-none">
                          {group.title}
                        </h2>
                      </div>
                    )}

                    {isAdminMode && !activeBlogPost && group.id !== 'notes' && (
                      <div className="flex justify-center pb-2">
                        <button
                          onClick={() => handleAddNewProjectClick(group.id)}
                          className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-500 text-xs font-serif text-white transition-all uppercase cursor-pointer"
                        >
                          + Add {group.title} Project
                        </button>
                      </div>
                    )}

                    {isAdminMode && !activeBlogPost && group.id === 'notes' && (
                      <div className="flex justify-center pb-2">
                        <button
                          onClick={() => {
                            setEditingBlogPost(null);
                            setIsBlogFormOpen(true);
                          }}
                          className="px-4 py-2 bg-amber-950/20 border border-amber-500/40 hover:border-amber-400 text-xs font-serif text-amber-200 transition-all uppercase cursor-pointer"
                        >
                          + Create New Production Note
                        </button>
                      </div>
                    )}

                    {/* List Items */}
                    {group.id === 'notes' ? (
                      activeBlogPost ? (
                        /* Dedicated Blog Post View - occupying the same vertical, centered amount of space as the previous modal (max-w-3xl) but as an inline page flow */
                        <div className="max-w-3xl mx-auto w-full space-y-8 animate-fade-in pb-16">
                          {/* Navigation Breadcrumb / Back button */}
                          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                            <button
                              onClick={() => setActiveBlogPost(null)}
                              className="group flex items-center gap-2 text-xs font-mono tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer uppercase"
                            >
                              &larr; Back to production notes
                            </button>
                            {isAdminMode && (
                              <button
                                onClick={() => {
                                  setEditingBlogPost(activeBlogPost);
                                  setIsBlogFormOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-500/30 bg-amber-950/20 text-xs font-mono text-amber-300 hover:border-amber-400 transition-colors cursor-pointer uppercase"
                              >
                                <Edit className="w-3.5 h-3.5 text-amber-500" />
                                Edit Post
                              </button>
                            )}
                          </div>

                          {/* Cover Image Banner */}
                          {activeBlogPost.coverUrl && (
                            <div className="aspect-video sm:aspect-[21/9] w-full overflow-hidden bg-neutral-900 relative rounded-sm shadow-xl">
                              <img
                                src={activeBlogPost.coverUrl}
                                alt={activeBlogPost.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            </div>
                          )}

                          {/* Content Container */}
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-amber-500">
                                <span className="px-2.5 py-1 bg-amber-950/30 border border-amber-500/20">
                                  {activeBlogPost.projectContext}
                                </span>
                                <span className="text-neutral-500">•</span>
                                <span className="text-neutral-400">{activeBlogPost.date}</span>
                                <span className="text-neutral-500">•</span>
                                <span className="text-neutral-400">{activeBlogPost.readTime}</span>
                              </div>

                              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                                {activeBlogPost.title}
                              </h1>
                            </div>

                            {/* Technical Specifications Bar */}
                            {(activeBlogPost.cameraGear || activeBlogPost.lenses || activeBlogPost.lightingSetup) && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-neutral-900/30 border border-neutral-900 rounded-sm text-xs font-mono">
                                {activeBlogPost.cameraGear && (
                                  <div className="space-y-1">
                                    <div className="text-[10px] uppercase text-neutral-500 tracking-widest flex items-center gap-1.5">
                                      <Cpu className="w-3.5 h-3.5 text-amber-500" /> Camera
                                    </div>
                                    <div className="text-neutral-200">{activeBlogPost.cameraGear}</div>
                                  </div>
                                )}
                                {activeBlogPost.lenses && (
                                  <div className="space-y-1">
                                    <div className="text-[10px] uppercase text-neutral-500 tracking-widest flex items-center gap-1.5">
                                      <BookOpen className="w-3.5 h-3.5 text-amber-500" /> Glass / Lenses
                                    </div>
                                    <div className="text-neutral-200">{activeBlogPost.lenses}</div>
                                  </div>
                                )}
                                {activeBlogPost.lightingSetup && (
                                  <div className="space-y-1">
                                    <div className="text-[10px] uppercase text-neutral-500 tracking-widest flex items-center gap-1.5">
                                      <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" /> Lighting
                                    </div>
                                    <div className="text-neutral-200">{activeBlogPost.lightingSetup}</div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Body Content */}
                            <div className="font-serif text-sm md:text-base text-neutral-300 leading-relaxed space-y-6 whitespace-pre-wrap">
                              {activeBlogPost.content}
                            </div>

                            {/* Optional Production Gallery */}
                            {(activeBlogPost.image1Url || activeBlogPost.image2Url || activeBlogPost.image3Url) && (
                              <div className="pt-8 border-t border-neutral-900 space-y-6">
                                <h4 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-semibold">Production Gallery & Stills</h4>
                                <div className="space-y-6">
                                  {activeBlogPost.image1Url && (
                                    <div className="space-y-2">
                                      <div className="aspect-video w-full overflow-hidden bg-neutral-900 relative rounded-sm border border-neutral-900">
                                        <img
                                          src={activeBlogPost.image1Url}
                                          alt={activeBlogPost.image1Caption || "Production Still 1"}
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                                        />
                                      </div>
                                      {activeBlogPost.image1Caption && (
                                        <p className="text-[11px] font-mono text-neutral-400 italic text-center">
                                          // {activeBlogPost.image1Caption}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {activeBlogPost.image2Url && (
                                    <div className="space-y-2">
                                      <div className="aspect-video w-full overflow-hidden bg-neutral-900 relative rounded-sm border border-neutral-900">
                                        <img
                                          src={activeBlogPost.image2Url}
                                          alt={activeBlogPost.image2Caption || "Production Still 2"}
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                                        />
                                      </div>
                                      {activeBlogPost.image2Caption && (
                                        <p className="text-[11px] font-mono text-neutral-400 italic text-center">
                                          // {activeBlogPost.image2Caption}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {activeBlogPost.image3Url && (
                                    <div className="space-y-2">
                                      <div className="aspect-video w-full overflow-hidden bg-neutral-900 relative rounded-sm border border-neutral-900">
                                        <img
                                          src={activeBlogPost.image3Url}
                                          alt={activeBlogPost.image3Caption || "Production Still 3"}
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                                        />
                                      </div>
                                      {activeBlogPost.image3Caption && (
                                        <p className="text-[11px] font-mono text-neutral-400 italic text-center">
                                          // {activeBlogPost.image3Caption}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Bottom Close/Back */}
                            <div className="pt-8 border-t border-neutral-900 flex justify-start">
                              <button
                                onClick={() => setActiveBlogPost(null)}
                                className="px-6 py-2.5 border border-neutral-800 hover:border-neutral-700 text-xs font-mono tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer uppercase"
                              >
                                &larr; Back to notes list
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-12">
                          {/* Minimalist Subtitle */}
                          <p className="text-center font-serif text-sm italic text-neutral-400 max-w-2xl mx-auto -mt-4 pb-4">
                            Behind the camera observations, lens testing archives, lighting breakdowns, and director logs.
                          </p>

                          {/* Blog Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                            {blogPosts.map((post) => (
                              <article
                                key={post.id}
                                onClick={() => setActiveBlogPost(post)}
                                className="group bg-neutral-950 border border-neutral-900 hover:border-neutral-800 p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer h-full hover:translate-y-[-2px] hover:shadow-xl"
                              >
                                <div className="space-y-4">
                                  {/* Thumbnail Image */}
                                  {post.coverUrl && (
                                    <div className="aspect-video w-full overflow-hidden bg-neutral-900 relative">
                                      <img
                                        src={post.coverUrl}
                                        alt={post.title}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                      />
                                      <div className="absolute top-3 left-3 bg-black/70 px-2 py-1 text-[9px] font-mono tracking-widest text-neutral-300 uppercase">
                                        {post.readTime}
                                      </div>
                                    </div>
                                  )}

                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-amber-500">
                                      <span className="font-semibold">{post.projectContext}</span>
                                      <span>•</span>
                                      <span className="text-neutral-500">{post.date}</span>
                                    </div>

                                    <h3 className="font-serif text-base font-semibold text-white tracking-tight group-hover:text-amber-200 transition-colors">
                                      {post.title}
                                    </h3>

                                    <p className="text-xs text-neutral-400 leading-relaxed font-serif line-clamp-3 italic">
                                      {post.excerpt}
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-6 flex items-center justify-between border-t border-neutral-900/50 mt-4 text-[11px] font-mono">
                                  <span className="text-amber-500/85 group-hover:text-amber-400 tracking-wider transition-colors">
                                    Read Log &rarr;
                                  </span>

                                  {isAdminMode && (
                                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => {
                                          setEditingBlogPost(post);
                                          setIsBlogFormOpen(true);
                                        }}
                                        className="text-neutral-400 hover:text-amber-400 transition-colors"
                                        title="Edit post"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Remove the log "${post.title}"?`)) {
                                            setBlogPosts(blogPosts.filter((bp) => bp.id !== post.id));
                                            setToastMessage('Note deleted successfully.');
                                          }
                                        }}
                                        className="text-neutral-400 hover:text-red-500 transition-colors"
                                        title="Delete post"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      )
                    ) : hasItems ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {group.items.map((project) => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={() => setActiveProject(project)}
                            isEditable={isAdminMode}
                            onEdit={(e) => {
                              e.stopPropagation();
                              handleEditSelect(project);
                            }}
                            onDelete={(e) => {
                              e.stopPropagation();
                              handleDeleteProgress(project.id);
                            }}
                            onMoveLeft={(e) => {
                              e.stopPropagation();
                              handleMoveProject(project.id, 'left');
                            }}
                            onMoveRight={(e) => {
                              e.stopPropagation();
                              handleMoveProject(project.id, 'right');
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center text-neutral-500 text-sm border border-dashed border-neutral-800">
                        No items loaded for {group.title} yet. Use the admin controls to create.
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}



        {/* Porting Sandbox custom controls for local editor mode */}
        {isAdminMode && activeCategoryTab !== 'notes' && activeCategoryTab !== 'contact' && (
          <section className="bg-neutral-950/80 border-y border-neutral-900 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-900 pb-6">
                <div className="space-y-1">
                  <h4 className="font-serif italic text-amber-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Portfolio Sandbox configurations
                  </h4>
                  <p className="font-serif text-xs italic text-neutral-400 leading-relaxed">
                    As the director, you can load customized MP4 streams, edit copy text, update production years, configure front segment cover backgrounds, or restore standard cinema samples instantly.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleResetToDefaults}
                    className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs italic text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                  <button
                    onClick={() => handleAddNewProjectClick()}
                    className="px-4 py-2 bg-white text-black hover:bg-neutral-100 text-xs italic tracking-wider transition-colors cursor-pointer uppercase font-medium"
                  >
                    + Add Project
                  </button>
                </div>
              </div>

              {/* Header Showcase Background Customization panel */}
              <div className="space-y-4 border-b border-neutral-900 pb-8 pt-2">
                <h5 className="text-xs text-neutral-300 uppercase tracking-widest font-semibold font-serif text-amber-100">
                  Configure Header Showcase (GIF or Image)
                </h5>
                <p className="text-[11px] text-neutral-400 italic leading-relaxed">
                  Upload a looping GIF, dynamic banner, or paste an external image/GIF URL (e.g. from Giphy, Tenor, Imgur) to display on the landing page header showcase block.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  {/* Left Column (Inputs) - occupies 5/12 span */}
                  <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                    {/* File Drag & Drop for Header GIF/Image */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsHeaderDragging(true);
                      }}
                      onDragLeave={() => setIsHeaderDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsHeaderDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          processHeaderFile(file);
                        }
                      }}
                      onClick={() => document.getElementById('header-file-input')?.click()}
                      className={`border-2 border-dashed rounded-lg p-6 flex-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        isHeaderDragging
                          ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                          : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/20 text-neutral-400'
                      }`}
                    >
                      <input
                        type="file"
                        id="header-file-input"
                        accept="image/*,video/*"
                        onChange={handleHeaderFileChange}
                        className="hidden"
                      />
                      <svg className="w-8 h-8 mb-2 text-neutral-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-neutral-300 block">
                        Click or drag Video/GIF/Image file
                      </span>
                      <span className="text-[10px] text-neutral-500 block mt-0.5">
                        MP4, WebM, GIF, PNG, JPG, WEBP formats supported
                      </span>
                    </div>

                    {/* URL Input */}
                    <div className="p-4 bg-neutral-900/30 border border-neutral-900 rounded-lg space-y-2">
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                        Or Paste External Video / GIF / Image URL
                      </label>
                      <input
                        type="url"
                        value={headerBackground && headerBackground.startsWith('data:') ? '' : headerBackground}
                        onChange={(e) => setHeaderBackground(e.target.value)}
                        placeholder="https://media.giphy.com/media/... or https://..."
                        className="w-full bg-neutral-950 px-3 py-2 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 italic font-serif"
                      />
                    </div>
                  </div>

                  {/* Right Column (Live Previews / Visualizer) - occupies 7/12 span */}
                  <div className="lg:col-span-7 bg-neutral-900/30 border border-neutral-900 rounded-lg p-5 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Live Responsive Viewports
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                      {/* Left Side: Desktop/Wide Live Preview */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setActiveCropMode('horizontal')}
                          className={`w-full text-center block transition-all ${
                            activeCropMode === 'horizontal' ? 'text-amber-400 font-semibold scale-105' : 'text-neutral-500 hover:text-neutral-300'
                          }`}
                        >
                          <span className="text-[9px] font-mono uppercase tracking-wider block">
                            Desktop / Wide View {activeCropMode === 'horizontal' && '●'}
                          </span>
                        </button>
                        <div
                          onClick={() => setActiveCropMode('horizontal')}
                          className={`relative aspect-video w-full overflow-hidden bg-neutral-950 border rounded flex items-center justify-center max-w-xs mx-auto transition-all duration-300 cursor-pointer ${
                            activeCropMode === 'horizontal'
                              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10'
                              : 'border-neutral-800 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {headerBackground ? (
                            <>
                              {headerBackground.toLowerCase().endsWith('.mp4') || headerBackground.toLowerCase().endsWith('.webm') || headerBackground.includes('/video/upload') ? (
                                <video
                                  src={headerBackground}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover transition-all duration-300"
                                  style={{
                                    transform: `scale(${sDesk}) translate(${txDesk}%, ${tyDesk}%)`,
                                    objectPosition: `${headerXOffset}% ${headerYOffset}%`,
                                  }}
                                />
                              ) : (
                                <img
                                  src={headerBackground}
                                  alt="Header Background preview"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-all duration-300"
                                  style={{
                                    transform: `scale(${sDesk}) translate(${txDesk}%, ${tyDesk}%)`,
                                    objectPosition: `${headerXOffset}% ${headerYOffset}%`,
                                  }}
                                />
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHeaderBackground('');
                                }}
                                className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-black text-white rounded-full transition-colors cursor-pointer border border-neutral-800 z-10"
                                title="Reset background"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <div className="relative w-full h-full">
                              <img
                                src="/src/assets/images/akshit_bio_background_1782904525358.jpg"
                                alt="Default Header Background"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover opacity-60 transition-all duration-300"
                                style={{
                                  transform: `scale(${sDesk}) translate(${txDesk}%, ${tyDesk}%)`,
                                  objectPosition: `${headerXOffset}% ${headerYOffset}%`,
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <span className="text-[8px] text-neutral-300 font-medium font-mono uppercase tracking-wider bg-neutral-950/90 px-1.5 py-0.5 border border-neutral-800">
                                  Default Active
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Simulated Smartphone Preview */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setActiveCropMode('vertical')}
                          className={`w-full text-center block transition-all ${
                            activeCropMode === 'vertical' ? 'text-amber-400 font-semibold scale-105' : 'text-neutral-500 hover:text-neutral-300'
                          }`}
                        >
                          <span className="text-[9px] font-mono uppercase tracking-wider block">
                            Mobile Portrait View {activeCropMode === 'vertical' && '●'}
                          </span>
                        </button>
                        
                        {/* Elegant Smartphone Mockup */}
                        <div
                          onClick={() => setActiveCropMode('vertical')}
                          className={`relative w-[110px] h-[196px] bg-black border-[3px] rounded-xl overflow-hidden flex flex-col shadow-lg mx-auto transition-all duration-300 cursor-pointer ${
                            activeCropMode === 'vertical'
                              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10'
                              : 'border-neutral-800 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {/* Speaker Notch */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-neutral-800 rounded-b-sm z-30" />
                          
                          {/* Screen content */}
                          <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
                            {/* Miniature sticky navigation with center-aligned name */}
                            <div className="h-4 bg-neutral-950/95 border-b border-neutral-900 flex items-center justify-center px-1 z-20">
                              <span className="text-[5px] tracking-wider uppercase text-neutral-300 font-semibold font-serif whitespace-nowrap scale-90">
                                Akshit Bahri
                              </span>
                            </div>
                            
                            {/* Simulated Mobile Header Crop Box */}
                            <div className="w-full h-[73px] overflow-hidden bg-neutral-950 relative border-b border-neutral-900">
                              {headerBackground && (headerBackground.toLowerCase().endsWith('.mp4') || headerBackground.toLowerCase().endsWith('.webm') || headerBackground.includes('/video/upload')) ? (
                                <video
                                  src={headerBackground}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover transition-all duration-300"
                                  style={{
                                    transform: `scale(${sMob}) translate(${txMob}%, ${tyMob}%)`,
                                    objectPosition: `${headerXOffsetVertical}% ${headerYOffsetVertical}%`,
                                  }}
                                />
                              ) : (
                                <img
                                  src={headerBackground || "/src/assets/images/akshit_bio_background_1782904525358.jpg"}
                                  alt="Mobile Header Preview"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-all duration-300"
                                  style={{
                                    transform: `scale(${sMob}) translate(${txMob}%, ${tyMob}%)`,
                                    objectPosition: `${headerXOffsetVertical}% ${headerYOffsetVertical}%`,
                                  }}
                                />
                              )}
                            </div>
                            
                            {/* Simulated Body Content (Cinematic row previews) */}
                            <div className="flex-1 p-1 space-y-1 bg-neutral-950 z-10 flex flex-col justify-start">
                              <div className="h-1 w-3/4 bg-neutral-900 rounded-2xs" />
                              <div className="h-[25px] w-full bg-neutral-900/60 rounded-xs flex flex-col items-center justify-center p-0.5 gap-0.5">
                                <div className="h-1 w-2/3 bg-neutral-850 rounded-2xs" />
                                <div className="h-0.5 w-1/3 bg-neutral-800 rounded-2xs" />
                              </div>
                              <div className="h-[25px] w-full bg-neutral-900/60 rounded-xs flex flex-col items-center justify-center p-0.5 gap-0.5">
                                <div className="h-1 w-2/3 bg-neutral-850 rounded-2xs" />
                                <div className="h-0.5 w-1/3 bg-neutral-800 rounded-2xs" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Crop & Position Controls */}
                <div className="bg-neutral-900/10 border border-neutral-900/60 p-5 rounded-lg space-y-5 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-2.5 gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-300 font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Precision Cropping & Alignment Options
                    </span>
                    <button
                      onClick={() => {
                        setHeaderZoom(100);
                        setHeaderXOffset(50);
                        setHeaderYOffset(50);
                        setHeaderZoomVertical(100);
                        setHeaderXOffsetVertical(50);
                        setHeaderYOffsetVertical(50);
                        setHeaderAspectRatio('aspect-video md:aspect-[21/9]');
                        setToastMessage('Reset all horizontal and vertical header crop settings.');
                      }}
                      className="text-[9px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors uppercase tracking-wider border border-neutral-800 px-2 py-0.5 self-start sm:self-auto"
                    >
                      Reset All Crop Settings
                    </button>
                  </div>

                  {/* Desktop vs Mobile Position Tab Selector */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-950/40 p-3 border border-neutral-900 rounded-md">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
                        Select Viewport To Align
                      </span>
                      <p className="text-[9px] text-neutral-500 italic">
                        Select a view to position the image. The same image will use different positions on desktop vs mobile.
                      </p>
                    </div>
                    <div className="flex gap-1.5 p-1 bg-neutral-950 border border-neutral-900 rounded shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveCropMode('horizontal')}
                        className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all rounded-sm cursor-pointer ${
                          activeCropMode === 'horizontal'
                            ? 'bg-amber-950/25 border border-amber-500/50 text-amber-300 font-semibold'
                            : 'text-neutral-500 hover:text-neutral-300 border border-transparent'
                        }`}
                      >
                        Desktop (Horizontal)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCropMode('vertical')}
                        className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all rounded-sm cursor-pointer ${
                          activeCropMode === 'vertical'
                            ? 'bg-amber-950/25 border border-amber-500/50 text-amber-300 font-semibold'
                            : 'text-neutral-500 hover:text-neutral-300 border border-transparent'
                        }`}
                      >
                        Mobile (Vertical)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Aspect Ratio / Framing & Zoom */}
                    <div className="space-y-4">
                      {/* Aspect Ratio choice is global to the page layout structure, let's keep it clean */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                          Header Framing / Aspect Ratio (Global Structure)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Cinema Scope (21:9)', value: 'aspect-video md:aspect-[21/9]' },
                            { label: 'Classic Video (16:9)', value: 'aspect-video' },
                            { label: 'Ultra Panavision (3:1)', value: 'aspect-[3/1]' },
                            { label: 'Academy Format (4:3)', value: 'aspect-[4/3]' },
                          ].map((opt) => (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => setHeaderAspectRatio(opt.value)}
                              className={`p-2 text-left transition-all border text-[10px] font-mono ${
                                headerAspectRatio === opt.value
                                  ? 'bg-neutral-900 border-neutral-700 text-white font-semibold'
                                  : 'bg-neutral-950/40 border-neutral-900 text-neutral-400 hover:border-neutral-800 hover:text-neutral-300'
                              }`}
                            >
                              <div>{opt.label}</div>
                              <div className="text-[8px] text-neutral-500 mt-0.5 font-sans italic">
                                {opt.value === 'aspect-[3/1]' ? 'Very slim banner' : opt.value === 'aspect-[4/3]' ? 'Tall historic format' : 'Dynamic wide frame'}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Zoom control linked to active mode */}
                      <div className="space-y-1.5 p-3.5 bg-neutral-950/30 border border-neutral-900 rounded">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-amber-500" />
                            Zoom Scale ({activeCropMode === 'horizontal' ? 'Desktop' : 'Mobile'})
                          </span>
                          <span className="text-amber-400 font-bold">
                            {activeCropMode === 'horizontal' ? headerZoom : headerZoomVertical}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono text-neutral-600">100%</span>
                          <input
                            type="range"
                            min="100"
                            max="300"
                            step="5"
                            value={activeCropMode === 'horizontal' ? headerZoom : headerZoomVertical}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (activeCropMode === 'horizontal') {
                                setHeaderZoom(val);
                              } else {
                                setHeaderZoomVertical(val);
                              }
                            }}
                            className="flex-1 accent-amber-500 h-1 bg-neutral-950 rounded-lg appearance-none cursor-pointer border border-neutral-900"
                          />
                          <span className="text-[9px] font-mono text-neutral-600">300%</span>
                        </div>
                        <p className="text-[9px] text-neutral-500 italic">
                          Increase zoom to crop out unwanted outer borders and focus closely for the {activeCropMode === 'horizontal' ? 'widescreen' : 'smartphone'} crop.
                        </p>
                      </div>
                    </div>

                    {/* Right Column: X & Y Position offset (Focal Point) */}
                    <div className="space-y-4">
                      {/* Vertical Shift (Y Offset) */}
                      <div className="space-y-1.5 p-3.5 bg-neutral-950/30 border border-neutral-900 rounded">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-amber-500" />
                            Vertical Shift (Y-Axis) - {activeCropMode === 'horizontal' ? 'Desktop' : 'Mobile'}
                          </span>
                          <span className="text-amber-400 font-bold">
                            {(() => {
                              const yVal = activeCropMode === 'horizontal' ? headerYOffset : headerYOffsetVertical;
                              return yVal === 50 ? 'Center (50%)' : yVal < 50 ? `Top: ${100 - yVal * 2}%` : `Bottom: ${(yVal - 50) * 2}%`;
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono text-neutral-600">Top</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={activeCropMode === 'horizontal' ? headerYOffset : headerYOffsetVertical}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (activeCropMode === 'horizontal') {
                                setHeaderYOffset(val);
                              } else {
                                setHeaderYOffsetVertical(val);
                              }
                            }}
                            className="flex-1 accent-amber-500 h-1 bg-neutral-950 rounded-lg appearance-none cursor-pointer border border-neutral-900"
                          />
                          <span className="text-[9px] font-mono text-neutral-600">Bottom</span>
                        </div>
                        <p className="text-[9px] text-neutral-500 italic">
                          Adjust vertical balance for {activeCropMode === 'horizontal' ? 'desktop banners' : 'mobile screens'}.
                        </p>
                      </div>

                      {/* Horizontal Shift (X Offset) */}
                      <div className="space-y-1.5 p-3.5 bg-neutral-950/30 border border-neutral-900 rounded">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-amber-500" />
                            Horizontal Shift (X-Axis) - {activeCropMode === 'horizontal' ? 'Desktop' : 'Mobile'}
                          </span>
                          <span className="text-amber-400 font-bold">
                            {(() => {
                              const xVal = activeCropMode === 'horizontal' ? headerXOffset : headerXOffsetVertical;
                              return xVal === 50 ? 'Center (50%)' : xVal < 50 ? `Left: ${100 - xVal * 2}%` : `Right: ${(xVal - 50) * 2}%`;
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono text-neutral-600">Left</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={activeCropMode === 'horizontal' ? headerXOffset : headerXOffsetVertical}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (activeCropMode === 'horizontal') {
                                setHeaderXOffset(val);
                              } else {
                                setHeaderXOffsetVertical(val);
                              }
                            }}
                            className="flex-1 accent-amber-500 h-1 bg-neutral-950 rounded-lg appearance-none cursor-pointer border border-neutral-900"
                          />
                          <span className="text-[9px] font-mono text-neutral-600">Right</span>
                        </div>
                        <p className="text-[9px] text-neutral-500 italic">
                          Adjust horizontal balance. Especially helpful for portrait crops where subjects are off-center.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segment cover images & captions customization panel */}
              <div className="space-y-4">
                <h5 className="text-xs text-neutral-300 uppercase tracking-widest font-semibold font-serif text-amber-100">
                  Configure Front Page Segment Cover Backgrounds & Captions
                </h5>
                <p className="text-[11px] text-neutral-400 italic leading-relaxed">
                  Paste any custom image URL and provide a brief caption to be displayed on the bottom-left of each front page segment. Leave blank or use default settings to reset at any time.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {groupedCategories.map((group) => (
                    <div key={group.id} className="space-y-3 bg-neutral-900/40 p-4 border border-neutral-900">
                      <div className="border-b border-neutral-800 pb-1.5">
                        <span className="text-xs font-semibold text-neutral-200 font-serif capitalize">
                          {group.title} Settings
                        </span>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-neutral-400 font-serif uppercase tracking-wider">
                          Cover Image URL
                        </label>
                        <input
                          type="text"
                          value={segmentImages[group.id]}
                          onChange={(e) => {
                            setSegmentImages((prev) => ({
                              ...prev,
                              [group.id]: e.target.value,
                            }));
                          }}
                          placeholder="Fallback to featured project thumbnail"
                          className="w-full bg-neutral-950 px-3 py-2 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 italic font-serif"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-neutral-400 font-serif uppercase tracking-wider">
                          Bottom-Left Caption
                        </label>
                        <input
                          type="text"
                          value={segmentCaptions[group.id]}
                          onChange={(e) => {
                            setSegmentCaptions((prev) => ({
                              ...prev,
                              [group.id]: e.target.value,
                            }));
                          }}
                          placeholder="e.g., A story of silence, 2025"
                          className="w-full bg-neutral-950 px-3 py-2 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 italic font-serif"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* Cinematic Frame Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between gap-10 items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="font-serif font-semibold text-base uppercase text-white tracking-widest">
                Akshit Bahri
              </span>
            </div>
            <p className="font-serif text-xs italic text-neutral-500 leading-relaxed max-w-xl">
              All visual, dynamic, and copyright production materials shown herein are copyright of someone or the other.
            </p>
          </div>
        </div>
      </footer>

      {/* Embedded Theater Mode Player Modal */}
      {activeProject && (
        <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
      )}

      {/* Responsive Form Drawer Sheet */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs" onClick={() => setIsFormOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <ProjectForm
              project={editingProject}
              onSave={(saved) => {
                handleSaveProject(saved);
                setToastMessage(`Project "${saved.title}" saved successfully!`);
              }}
              onClose={() => {
                setIsFormOpen(false);
                setEditingProject(null);
              }}
            />
          </div>
        </div>
      )}



      {/* Blog Post Form Drawer */}
      {isBlogFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-end" onClick={() => setIsBlogFormOpen(false)}>
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full max-w-xl bg-neutral-950 border-l border-neutral-900 h-full flex flex-col justify-between shadow-2xl text-left overflow-y-auto animate-slide-in"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-900 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-semibold">Production Archives</span>
                <h3 className="text-base font-serif font-semibold text-white tracking-tight">
                  {editingBlogPost ? 'Edit Production Note' : 'Create New Production Note'}
                </h3>
              </div>
              <button onClick={() => setIsBlogFormOpen(false)} className="text-neutral-500 hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = formData.get('title') as string;
                const projectContext = formData.get('projectContext') as string;
                const excerpt = formData.get('excerpt') as string;
                const content = formData.get('content') as string;
                
                const coverUrl = coverInputVal;
                const cameraGear = formData.get('cameraGear') as string;
                const lenses = formData.get('lenses') as string;
                const lightingSetup = formData.get('lightingSetup') as string;
                const image1Url = image1InputVal;
                const image1Caption = formData.get('image1Caption') as string;
                const image2Url = image2InputVal;
                const image2Caption = formData.get('image2Caption') as string;
                const image3Url = image3InputVal;
                const image3Caption = formData.get('image3Caption') as string;

                if (!title || !projectContext || !content) {
                  alert('Please fill out Title, Project Context, and Content.');
                  return;
                }

                const postData: BlogPost = {
                  id: editingBlogPost?.id || `post-${Date.now()}`,
                  title,
                  projectContext,
                  date: editingBlogPost?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                  readTime: editingBlogPost?.readTime || `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min read`,
                  excerpt: excerpt || (content.substring(0, 120) + '...'),
                  content,
                  coverUrl: coverUrl || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800',
                  cameraGear,
                  lenses,
                  lightingSetup,
                  image1Url: image1Url || undefined,
                  image1Caption: image1Caption || undefined,
                  image2Url: image2Url || undefined,
                  image2Caption: image2Caption || undefined,
                  image3Url: image3Url || undefined,
                  image3Caption: image3Caption || undefined
                };

                if (editingBlogPost) {
                  setBlogPosts(blogPosts.map((p) => p.id === editingBlogPost.id ? postData : p));
                  if (activeBlogPost && activeBlogPost.id === editingBlogPost.id) {
                    setActiveBlogPost(postData);
                  }
                  setToastMessage('Production note updated.');
                } else {
                  setBlogPosts([postData, ...blogPosts]);
                  setToastMessage('Production note added successfully.');
                }
                setIsBlogFormOpen(false);
                setEditingBlogPost(null);
              }}
              className="flex-1 p-6 space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Log Title *</label>
                <input
                  name="title"
                  required
                  defaultValue={editingBlogPost?.title || ''}
                  placeholder="e.g. Behind the Scenes on Pièce de Résistance"
                  className="w-full bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-xs px-3.5 py-2.5 rounded-sm outline-hidden font-serif"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Project Context *</label>
                  <input
                    name="projectContext"
                    required
                    defaultValue={editingBlogPost?.projectContext || ''}
                    placeholder="e.g. Pièce de Résistance (2025)"
                    className="w-full bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-xs px-3.5 py-2.5 rounded-sm outline-hidden font-serif"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase block">Cover Image</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={coverInputVal}
                        onChange={(e) => setCoverInputVal(e.target.value)}
                        placeholder="Paste image link or upload..."
                        className="flex-1 bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-xs px-3 py-2 rounded-sm outline-hidden font-serif"
                      />
                      <label className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white px-3 py-2 text-xs font-mono rounded-sm cursor-pointer transition-colors flex items-center justify-center gap-1.5 shrink-0">
                        <Upload className="w-3.5 h-3.5 text-amber-500" />
                        File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) compressAndSetImage(file, setCoverInputVal);
                          }}
                        />
                      </label>
                    </div>
                    {coverInputVal && (
                      <div className="flex items-center gap-2 bg-neutral-900/30 border border-neutral-900 p-1.5 rounded-sm">
                        <img src={coverInputVal} alt="Cover Preview" className="w-8 h-8 object-cover rounded-sm border border-neutral-800" referrerPolicy="no-referrer" />
                        <span className="text-[9px] font-mono text-neutral-400 truncate flex-1">
                          {coverInputVal.startsWith('data:') ? 'Uploaded local image' : coverInputVal}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCoverInputVal('')}
                          className="text-neutral-500 hover:text-red-400 text-xs px-1"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Log Excerpt</label>
                <input
                  name="excerpt"
                  defaultValue={editingBlogPost?.excerpt || ''}
                  placeholder="Short scannable teaser or preview text..."
                  className="w-full bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-xs px-3.5 py-2.5 rounded-sm outline-hidden font-serif"
                />
              </div>

              <div className="border-t border-neutral-900 pt-3 mt-3 space-y-3">
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-semibold">Technical Specifications (Optional)</span>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase">Camera</label>
                    <input
                      name="cameraGear"
                      defaultValue={editingBlogPost?.cameraGear || ''}
                      placeholder="e.g. Sony FX9"
                      className="w-full bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-[11px] px-2.5 py-2 rounded-sm outline-hidden font-serif"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase">Lenses</label>
                    <input
                      name="lenses"
                      defaultValue={editingBlogPost?.lenses || ''}
                      placeholder="e.g. Cooke Prime 40mm"
                      className="w-full bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-[11px] px-2.5 py-2 rounded-sm outline-hidden font-serif"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase">Lighting</label>
                    <input
                      name="lightingSetup"
                      defaultValue={editingBlogPost?.lightingSetup || ''}
                      placeholder="e.g. Aputure 600d"
                      className="w-full bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-[11px] px-2.5 py-2 rounded-sm outline-hidden font-serif"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-900 pt-3 mt-3 space-y-4">
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-semibold">Additional Production Stills / Diagrams (Optional)</span>
                
                <div className="space-y-4">
                  {/* Image 1 slot */}
                  <div className="space-y-2 p-2 bg-neutral-950 border border-neutral-900 rounded-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block">Image 1 (URL or Upload)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={image1InputVal}
                            onChange={(e) => setImage1InputVal(e.target.value)}
                            placeholder="Paste image link or upload..."
                            className="flex-1 bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-[11px] px-2.5 py-2 rounded-sm outline-hidden font-serif"
                          />
                          <label className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white px-2.5 py-2 text-[11px] font-mono rounded-sm cursor-pointer transition-colors flex items-center justify-center gap-1 shrink-0">
                            <Upload className="w-3 h-3 text-amber-500" />
                            File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) compressAndSetImage(file, setImage1InputVal);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase">Image 1 Caption</label>
                        <input
                          name="image1Caption"
                          defaultValue={editingBlogPost?.image1Caption || ''}
                          placeholder="e.g. Lighting diagram for scene 3"
                          className="w-full bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-[11px] px-2.5 py-2 rounded-sm outline-hidden font-serif"
                        />
                      </div>
                    </div>
                    {image1InputVal && (
                      <div className="flex items-center gap-2 bg-neutral-900/30 border border-neutral-900 p-1 rounded-sm">
                        <img src={image1InputVal} alt="Preview 1" className="w-8 h-8 object-cover rounded-sm border border-neutral-800" referrerPolicy="no-referrer" />
                        <span className="text-[9px] font-mono text-neutral-400 truncate flex-1">
                          {image1InputVal.startsWith('data:') ? 'Uploaded image 1' : image1InputVal}
                        </span>
                        <button
                          type="button"
                          onClick={() => setImage1InputVal('')}
                          className="text-neutral-500 hover:text-red-400 text-xs px-1"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Image 2 slot */}
                  <div className="space-y-2 p-2 bg-neutral-950 border border-neutral-900 rounded-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block">Image 2 (URL or Upload)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={image2InputVal}
                            onChange={(e) => setImage2InputVal(e.target.value)}
                            placeholder="Paste image link or upload..."
                            className="flex-1 bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-[11px] px-2.5 py-2 rounded-sm outline-hidden font-serif"
                          />
                          <label className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white px-2.5 py-2 text-[11px] font-mono rounded-sm cursor-pointer transition-colors flex items-center justify-center gap-1 shrink-0">
                            <Upload className="w-3 h-3 text-amber-500" />
                            File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) compressAndSetImage(file, setImage2InputVal);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase">Image 2 Caption</label>
                        <input
                          name="image2Caption"
                          defaultValue={editingBlogPost?.image2Caption || ''}
                          placeholder="e.g. Camera setup on dolly"
                          className="w-full bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-[11px] px-2.5 py-2 rounded-sm outline-hidden font-serif"
                        />
                      </div>
                    </div>
                    {image2InputVal && (
                      <div className="flex items-center gap-2 bg-neutral-900/30 border border-neutral-900 p-1 rounded-sm">
                        <img src={image2InputVal} alt="Preview 2" className="w-8 h-8 object-cover rounded-sm border border-neutral-800" referrerPolicy="no-referrer" />
                        <span className="text-[9px] font-mono text-neutral-400 truncate flex-1">
                          {image2InputVal.startsWith('data:') ? 'Uploaded image 2' : image2InputVal}
                        </span>
                        <button
                          type="button"
                          onClick={() => setImage2InputVal('')}
                          className="text-neutral-500 hover:text-red-400 text-xs px-1"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Image 3 slot */}
                  <div className="space-y-2 p-2 bg-neutral-950 border border-neutral-900 rounded-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block">Image 3 (URL or Upload)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={image3InputVal}
                            onChange={(e) => setImage3InputVal(e.target.value)}
                            placeholder="Paste image link or upload..."
                            className="flex-1 bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-[11px] px-2.5 py-2 rounded-sm outline-hidden font-serif"
                          />
                          <label className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white px-2.5 py-2 text-[11px] font-mono rounded-sm cursor-pointer transition-colors flex items-center justify-center gap-1 shrink-0">
                            <Upload className="w-3 h-3 text-amber-500" />
                            File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) compressAndSetImage(file, setImage3InputVal);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase">Image 3 Caption</label>
                        <input
                          name="image3Caption"
                          defaultValue={editingBlogPost?.image3Caption || ''}
                          placeholder="e.g. Final graded frame still"
                          className="w-full bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-[11px] px-2.5 py-2 rounded-sm outline-hidden font-serif"
                        />
                      </div>
                    </div>
                    {image3InputVal && (
                      <div className="flex items-center gap-2 bg-neutral-900/30 border border-neutral-900 p-1 rounded-sm">
                        <img src={image3InputVal} alt="Preview 3" className="w-8 h-8 object-cover rounded-sm border border-neutral-800" referrerPolicy="no-referrer" />
                        <span className="text-[9px] font-mono text-neutral-400 truncate flex-1">
                          {image3InputVal.startsWith('data:') ? 'Uploaded image 3' : image3InputVal}
                        </span>
                        <button
                          type="button"
                          onClick={() => setImage3InputVal('')}
                          className="text-neutral-500 hover:text-red-400 text-xs px-1"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Note Body Content *</label>
                <textarea
                  name="content"
                  required
                  rows={8}
                  defaultValue={editingBlogPost?.content || ''}
                  placeholder="Document your technical creative decisions, lighting ratios, camera setups, and production discoveries here..."
                  className="w-full bg-neutral-900/50 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 text-xs px-3.5 py-2.5 rounded-sm outline-hidden font-serif resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBlogFormOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-mono uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
                >
                  {editingBlogPost ? 'Save Archive' : 'Publish Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sleek Minimal Toast Notification */}
      {toastMessage && (
        <div id="custom-toast" className="fixed bottom-6 left-6 z-50 bg-neutral-900 border border-amber-500/40 text-neutral-100 text-xs font-mono px-5 py-3.5 flex items-center justify-between gap-4 shadow-2xl max-w-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-neutral-400 hover:text-white font-semibold text-sm">&times;</button>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div id="delete-confirmation-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 max-w-md w-full space-y-6 text-left" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase font-semibold">Security Action Required</span>
              <h3 className="text-lg font-serif font-semibold text-white tracking-tight">Remove project from showcase?</h3>
              <p className="text-xs text-neutral-400 font-serif leading-relaxed">
                Are you absolutely sure you want to remove this video project from your portfolio? This action cannot be undone, and the item will be cleared from offline storage.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-mono tracking-wider border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white bg-transparent transition-colors uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteProjectFromFirestore(deleteConfirmId);
                    setProjects((prev) => prev.filter((p) => p.id !== deleteConfirmId));
                    setToastMessage('Project removed successfully.');
                  } catch (err: any) {
                    console.error('Failed to delete project:', err);
                    setToastMessage('Failed to delete project.');
                  }
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 text-xs font-mono tracking-wider bg-red-600 hover:bg-red-700 text-white transition-colors uppercase font-medium cursor-pointer"
              >
                Delete Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div id="reset-confirmation-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" onClick={() => setResetConfirmOpen(false)}>
          <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 max-w-md w-full space-y-6 text-left" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-semibold">Database Reversion</span>
              <h3 className="text-lg font-serif font-semibold text-white tracking-tight">Reset portfolio structure?</h3>
              <p className="text-xs text-neutral-400 font-serif leading-relaxed">
                This will reset your portfolio projects, segments, custom cover images, and captions back to the default curated cinematography samples. All custom changes will be permanently cleared.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2 text-xs font-mono tracking-wider border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white bg-transparent transition-colors uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setProjects(INITIAL_PROJECTS);
                  setSegmentImages({
                    narrative: '',
                    documentary: '',
                    commercial: '',
                    notes: '',
                  });
                  setSegmentCaptions({
                    narrative: 'Pièce de Résistance, 2025. Shot on FX9.',
                    documentary: 'Funny Business, 2026. Shot on Sony FX3',
                    commercial: 'Pragyaan (Podcast)',
                    notes: 'Director notebook & project documentation, 2026.',
                  });
                  setBlogPosts(INITIAL_BLOG_POSTS);
                  setHeaderBackground('');
                  localStorage.removeItem('video_portfolio_projects');
                  localStorage.removeItem('video_portfolio_segment_images');
                  localStorage.removeItem('video_portfolio_segment_captions');
                  localStorage.removeItem('video_portfolio_header_background');
                  localStorage.removeItem('video_portfolio_blog_posts');
                  setResetConfirmOpen(false);
                  setToastMessage('Portfolio reset to default samples.');
                }}
                className="flex-1 py-2 text-xs font-mono tracking-wider bg-amber-600 hover:bg-amber-700 text-white transition-colors uppercase font-medium cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Login Modal */}
      {isLoginDialogOpen && (
        <div id="login-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-fade-in text-neutral-100 font-serif" onClick={() => setIsLoginDialogOpen(false)}>
          <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 max-w-sm w-full space-y-6 text-left" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-semibold">Director Access</span>
              <h3 className="text-xl font-serif font-semibold text-white tracking-tight">Admin Authentication</h3>
              <p className="text-xs text-neutral-400 font-serif leading-relaxed">
                Sign in to customize projects, upload images/videos, and manage your portfolio.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const usernameInput = loginUsername.trim().toLowerCase();
                const passwordInput = loginPassword;
                
                // Check against live Firestore allowedUsers with a local fallback to dbUsers
                const matchedUser = allowedUsers.find(
                  (u) => u.username.toLowerCase() === usernameInput && u.password === passwordInput
                ) || dbUsers?.users?.find(
                  (u: any) => u.username.toLowerCase() === usernameInput && u.password === passwordInput
                );

                if (matchedUser) {
                  localStorage.setItem('video_portfolio_admin_authorized', 'true');
                  setHasAdminAuthorized(true);
                  setIsAdminMode(true);
                  setIsLoginDialogOpen(false);
                  setLoginUsername('');
                  setLoginPassword('');
                  setLoginError('');
                  setShowPassword(false);
                  setToastMessage(`Welcome back, ${matchedUser.username}!`);
                } else {
                  setLoginError('Invalid username or password.');
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Username</label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => {
                    setLoginUsername(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Enter username"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-neutral-100 text-sm px-3.5 py-2 rounded-sm outline-hidden font-serif"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="Enter password"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-neutral-100 text-sm pl-3.5 pr-10 py-2 rounded-sm outline-hidden font-serif"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-hidden cursor-pointer flex items-center justify-center"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginError && (
                  <p className="text-[11px] font-serif text-red-500 italic mt-2">{loginError}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginDialogOpen(false);
                    setLoginUsername('');
                    setLoginPassword('');
                    setLoginError('');
                    setShowPassword(false);
                  }}
                  className="flex-1 py-2 text-xs font-mono tracking-widest border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white bg-transparent transition-colors uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-mono tracking-widest bg-white hover:bg-neutral-200 text-black transition-colors uppercase font-semibold cursor-pointer"
                >
                  Authenticate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
