/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VideoProject } from '../types';
import { Edit2, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: VideoProject;
  onClick: () => void;
  isEditable?: boolean;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onMoveLeft?: (e: React.MouseEvent) => void;
  onMoveRight?: (e: React.MouseEvent) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  isEditable = false,
  onEdit,
  onDelete,
  onMoveLeft,
  onMoveRight,
}) => {
  return (
    <div
      id={`project-card-${project.id}`}
      className="group relative cursor-pointer flex flex-col justify-between"
      onClick={onClick}
    >
      {/* Thumbnail Container */}
      <div className="relative overflow-hidden bg-neutral-900 border border-neutral-200 aspect-video w-full transition-all duration-300">
        <img
          src={project.thumbnailUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800'}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 scale-100 group-hover:scale-102"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Duration Badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/75 px-1.5 py-0.5 text-[10px] text-neutral-100 font-serif tracking-wide">
          {project.duration}
        </div>

        {/* Admin Badges & Actions */}
        {isEditable && (
          <div className="absolute top-2 right-2 flex gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
            {onMoveLeft && (
              <button
                id={`move-left-btn-${project.id}`}
                onClick={onMoveLeft}
                className="p-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white shadow-xs transition-colors focus:ring-1 focus:ring-black focus:outline-hidden"
                title="Move Up"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
            {onMoveRight && (
              <button
                id={`move-right-btn-${project.id}`}
                onClick={onMoveRight}
                className="p-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white shadow-xs transition-colors focus:ring-1 focus:ring-black focus:outline-hidden"
                title="Move Down"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              id={`edit-btn-${project.id}`}
              onClick={onEdit}
              className="p-1.5 bg-white/90 hover:bg-white text-neutral-700 hover:text-black shadow-xs transition-colors focus:ring-1 focus:ring-black focus:outline-hidden"
              title="Edit Project"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              id={`delete-btn-${project.id}`}
              onClick={onDelete}
              className="p-1.5 bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors focus:ring-1 focus:ring-black focus:outline-hidden"
              title="Delete Project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Meta Content */}
      <div className="mt-3">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-serif font-medium text-sm text-neutral-100 group-hover:text-amber-200 transition-colors leading-tight line-clamp-1">
            {project.title}
          </h4>
          <span className="text-[11px] font-serif italic text-neutral-400 shrink-0 mt-0.5">
            {project.year}
          </span>
        </div>
        
        <p className="text-xs text-neutral-400 font-serif mt-1 flex flex-wrap items-center gap-1">
          <span>{project.role}</span>
          {project.client && (
            <>
              <span className="text-neutral-500">•</span>
              <span className="italic text-neutral-300">{project.client}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
