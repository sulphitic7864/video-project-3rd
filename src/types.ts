/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectCategory = 'narrative' | 'documentary' | 'commercial' | 'notes';

export interface CrewMember {
  role: string;
  name: string;
}

export interface VideoProject {
  id: string;
  title: string;
  category: ProjectCategory;
  client?: string;
  role: string;
  year: number;
  duration: string;
  description: string;
  videoUrl: string; // Supports direct mp4/web videos or YouTube/Vimeo links
  thumbnailUrl: string;
  gearUsed?: string[];
  crewList?: CrewMember[];
  synopsis?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  projectContext: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  cameraGear?: string;
  lenses?: string;
  lightingSetup?: string;
  image1Url?: string;
  image1Caption?: string;
  image2Url?: string;
  image2Caption?: string;
  image3Url?: string;
  image3Caption?: string;
}
