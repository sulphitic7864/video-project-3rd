import { BlogPost } from './types';

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Behind the Lens: Color & Contrast of Pièce de Résistance',
    projectContext: 'Pièce de Résistance (2025)',
    date: 'October 14, 2025',
    readTime: '4 min read',
    excerpt: 'An in-depth exploration of color chemistry, custom exposure LUTs, and capturing skin tones under heavy ambient blue lighting on the FX9.',
    content: 'For Pièce de Résistance, we wanted a color palette that felt both classical and modern. We opted for the Sony FX9 because of its dual base ISO (800/4000) and exceptional dynamic range under challenging lighting. \n\nWe lit the primary kitchen sequence using a single large source—an Aputure 600d Pro bounced into a 12x12 unbleached muslin, supplemented with subtle LED tube accents for high-contrast chiaroscuro. To retain richness in the shadow details while keeping highlights creamy, we engineered a custom S-Cinetone-based exposure LUT. This allowed us to view the exact texture of the steam and low-key skin tones in real-time, reducing our digital post-production correction time by 60%.',
    coverUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800',
    cameraGear: 'Sony FX9 (Full-Frame Cinematic Camera)',
    lenses: 'Cooke Anamorphic/i S35 Prime (40mm & 75mm)',
    lightingSetup: 'Aputure 600d Pro with Muslin Bounce, Nanlite Pavotubes'
  },
  {
    id: 'post-2',
    title: 'Action Comedy Pacing: Lightweight Rigging for Funny Business',
    projectContext: 'Funny Business (2026)',
    date: 'February 22, 2026',
    readTime: '3 min read',
    excerpt: 'Deconstructing the speed and kinetic energy of the indie pilot. How a barebones FX3 build allowed our actors to move without bounds.',
    content: 'Comedy thrives on natural timing and spontaneous physical performance. In "Funny Business", traditional heavy camera rigs would have slowed down our setup and blocked the actors from navigating the tight apartment location freely.\n\nWe stripped down our setup to a barebones Sony FX3 rig mounted on a custom lightweight hand-held cage. Rather than running a bulky wireless video transmitter, we relied on a compact high-brightness monitor. Lighting was strictly limited to exterior daylight coming through windows, controlled using negative fill black velvet flags and passive foam-core boards to bounce soft fill. This gave the cast complete freedom to improvise across 360 degrees without bumping into stands or waiting for light adjustments.',
    coverUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    cameraGear: 'Sony FX3 (Compact Cinema Line)',
    lenses: 'Sony G-Master 24-70mm f/2.8 II',
    lightingSetup: 'Natural Daylight with Negative Fill, Matthews Foam-Core Boards'
  },
  {
    id: 'post-3',
    title: 'Intimate Acoustics: Setting up the Pragyaan Podcast',
    projectContext: 'Pragyaan (Podcast)',
    date: 'April 5, 2026',
    readTime: '5 min read',
    excerpt: 'Transforming a hollow industrial brick studio into a warm, sound-dampened room with precise multi-cam alignments.',
    content: 'Documenting the technical setup for the Pragyaan Podcast series. Recording in a spacious warehouse meant dealing with terrible echo and industrial reverb. Before placing a single camera, we fully treated the walls with custom-wrapped high-density fiberglass panels and thick velvet backdrops.\n\nFor the visual look, we designed a cozy multi-cam layout. Camera A (Sony FX6) remained locked on the host in a medium-wide frame, while Camera B and C (Sony A7SIII) provided close-ups. We lit the set using warm overhead paper lanterns (China balls) with soft amber bulbs and colored LED tubes behind the brick arches to add three-dimensional depth and separate our subjects from the background.',
    coverUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800',
    cameraGear: 'Sony FX6 & dual Sony A7SIII multi-cam setup',
    lenses: 'Sigma Art 50mm f/1.4 & Zeiss Batis 85mm',
    lightingSetup: 'Warm China Lanterns, Astera Titan Tubes for BG accents'
  }
];
