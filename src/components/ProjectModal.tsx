/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VideoProject } from '../types';
import { X, Calendar, Clock, Film, Wrench, Users, Briefcase } from 'lucide-react';
import { getVideoSource, capitalize } from '../utils';

interface ProjectModalProps {
  project: VideoProject | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  const { type, src } = getVideoSource(project.videoUrl);

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div
      id="project-detail-modal"
      className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-neutral-950/90 backdrop-blur-xs p-4 pt-16 sm:p-6 sm:pt-20 md:p-10 md:pt-24"
      onClick={onClose}
    >
      <div
        className="relative bg-neutral-900 border border-neutral-800 text-neutral-100 max-w-5xl w-full flex flex-col focus:outline-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-modal-btn"
          onClick={onClose}
          className="absolute -top-12 right-2 sm:right-0 p-2 text-neutral-400 hover:text-white transition-colors focus:ring-1 focus:ring-white focus:outline-hidden z-50"
          title="Close details"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video Player Section */}
        <div className="relative aspect-video w-full bg-black border-b border-neutral-800">
          {type === 'direct' ? (
            <video
              id="modal-html5-video"
              src={src}
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
            />
          ) : type === 'youtube' || type === 'vimeo' || type === 'iframe' ? (
            <iframe
              id="modal-embedded-iframe"
              src={src}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-sharing"
              allowFullScreen
              title={project.title}
            ></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-neutral-400">
              <Film className="w-12 h-12 mb-3 text-neutral-500" />
              <p className="font-mono text-sm">Media link unrecognized or unavailable.</p>
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-xs text-blue-400 underline hover:text-blue-300"
              >
                Open Original Link
              </a>
            </div>
          )}
        </div>

        {/* Info Grid (Minimalist Presentation) */}
        <div className="p-6 md:p-8 overflow-visible md:overflow-y-auto md:max-h-[50vh] grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Production Narrative */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                {capitalize(project.category)}
              </span>
              <h2 className="text-xl md:text-2xl font-serif font-semibold mt-1 tracking-tight text-white">
                {project.title}
              </h2>
            </div>

            {/* Description */}
            <div className="space-y-4 text-neutral-300 text-sm leading-relaxed">
              <p>{project.description}</p>
              
              {project.synopsis && (
                <div className="mt-6 pt-6 border-t border-neutral-800">
                  <h4 className="text-xs font-mono tracking-wider text-neutral-400 uppercase mb-2">
                    Production Notes / Synopsis
                  </h4>
                  <p className="text-neutral-400 leading-relaxed italic font-light">
                    &ldquo;{project.synopsis}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Project Details Sidebar */}
          <div className="space-y-5 bg-neutral-950/40 p-4 border border-neutral-800/80">
            <h4 className="text-xs font-mono tracking-widest text-neutral-400 uppercase border-b border-neutral-800 pb-2">
              Specifications
            </h4>

            <div className="space-y-3.5 text-xs text-neutral-300">
              {/* Role */}
              <div className="flex items-start gap-2.5">
                <Film className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-[10px] text-neutral-500">Role</div>
                  <div className="font-medium">{project.role}</div>
                </div>
              </div>

              {/* Client */}
              {project.client && (
                <div className="flex items-start gap-2.5">
                  <Briefcase className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-mono text-[10px] text-neutral-500">Client</div>
                    <div className="font-medium">{project.client}</div>
                  </div>
                </div>
              )}

              {/* Duration & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-mono text-[10px] text-neutral-500">Duration</div>
                    <div className="font-medium font-mono">{project.duration}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-mono text-[10px] text-neutral-500">Year</div>
                    <div className="font-medium font-mono">{project.year}</div>
                  </div>
                </div>
              </div>

              {/* Gear List */}
              {project.gearUsed && project.gearUsed.length > 0 && (
                <div className="pt-2.5 border-t border-neutral-800">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 uppercase mb-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Technical Gear</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.gearUsed.map((gear, idx) => (
                      <span
                        key={idx}
                        className="bg-neutral-800 text-neutral-300 font-mono text-[10px] px-2 py-0.5 border border-neutral-700/50"
                      >
                        {gear}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Crew List */}
              {project.crewList && project.crewList.length > 0 && (
                <div className="pt-3 border-t border-neutral-800">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 uppercase mb-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Production Crew</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    {project.crewList.map((crew, idx) => (
                      <div key={idx} className="flex justify-between text-neutral-400 gap-2">
                        <span className="text-neutral-500">{crew.role}:</span>
                        <span className="text-right text-neutral-300">{crew.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Dedicated Close Button */}
              <button
                onClick={onClose}
                className="w-full mt-6 py-2.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono uppercase tracking-wider transition-colors md:hidden cursor-pointer"
              >
                Close Theater View
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
