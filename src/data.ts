/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VideoProject } from './types';

export const INITIAL_PROJECTS: VideoProject[] = [
  {
    id: 'narrative-1',
    title: 'Pièce de Résistance',
    category: 'narrative',
    role: 'DOP',
    year: 2025,
    duration: '10:36',
    description: 'A narrative cinema short capturing soft chiaroscuro lighting, custom exposure LUTs, and rich color science. Shot on Sony FX9.',
    videoUrl: 'https://gumlet.tv/watch/6a48d6ef18d11bffd55d7db0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800',
    gearUsed: ['Sony FX9'],
    crewList: [],
    synopsis: 'Designed with dual base ISO at 4000 to maintain exceptional shadow richness and creamy midtones under low light ambiance.'
  },
  {
    id: 'documentary-1',
    title: 'Funny Business',
    category: 'documentary',
    role: 'Director of Photography',
    year: 2026,
    duration: '5:20',
    description: 'A dynamic documentary tracking indie pilot production. Captured with lightweight handheld cage rigging and natural window daylight bounces. Shot on Sony FX3.',
    videoUrl: 'https://player.vimeo.com/external/394347712.sd.mp4?s=d0092ee950bd8e0c3f58a8a6beff2e03504ae386&profile_id=165&oauth2_token_id=57447761',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    gearUsed: ['Sony FX3', 'Sony G-Master 24-70mm f/2.8 II'],
    crewList: [
      { role: 'Director', name: 'David Miller' }
    ],
    synopsis: 'Focusing on physical performances by utilizing a highly responsive, lightweight, mobile setup that eliminates bulky support structures.'
  },
  {
    id: 'commercial-1',
    title: 'Pragyaan (Podcast)',
    category: 'commercial',
    role: 'Director of Photography',
    year: 2026,
    duration: '10:45',
    description: 'A multi-camera talk series filmed in a high-ceiling loft treated with custom acoustic dampening and lit with warm paper lantern globes.',
    videoUrl: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0227e330d051c911bca0ab20d43702f&profile_id=165&oauth2_token_id=57447761',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800',
    gearUsed: ['Sony FX6', 'Sony A7SIII', 'Sigma Art Prime Lenses'],
    crewList: [
      { role: 'Co-Producer', name: 'Akshit Bahri' }
    ],
    synopsis: 'A warm, three-dimensional visual depth look achieved through Astera Titan tubes back-glow accents and shallow depth focus.'
  },
  {
    id: 'comm-1',
    title: 'Aura Perfume - Essence of Midnight',
    category: 'commercial',
    client: 'Aura Cosmétiques',
    role: 'Director of Photography & Colorist',
    year: 2025,
    duration: '0:45',
    description: 'A high-fashion luxury commercial capturing structural shadow work, slow movement, and liquid dynamics. Shot on RED V-Raptor with anamorphic lenses to emphasize depth, contrast, and elegance.',
    videoUrl: 'https://player.vimeo.com/external/435674703.sd.mp4?s=6f4116185da21d51a6576042dbcf773887d16075&profile_id=165&oauth2_token_id=57447761',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
    gearUsed: ['RED V-Raptor 8K', 'Atlas Orion Anamorphic Prime Lenses', 'DaVinci Resolve Studio'],
    crewList: [
      { role: 'Director', name: 'Sofia Alvarez' },
      { role: 'Executive Producer', name: 'Marcus Chen' },
      { role: 'Lead Gaffer', name: 'James Peterson' }
    ],
    synopsis: 'Designed as a 45-second launch commercial for Aura\'s midnight fragrance collection, this project utilizes controlled studio lighting, volumetric haze, and extreme macro shots of liquid glass and velvet textures.'
  },
  {
    id: 'doc-1',
    title: 'The Glassblower - Shaping Fire',
    category: 'documentary',
    client: 'Independent Arts Grant',
    role: 'Director & Cinematographer',
    year: 2025,
    duration: '5:12',
    description: 'An intimate mini-documentary exploring the life of master glass artisan Keith Lawson. It documents the dangerous relationship between human flesh, molten glass, and constant fire.',
    videoUrl: 'https://player.vimeo.com/external/394347712.sd.mp4?s=d0092ee950bd8e0c3f58a8a6beff2e03504ae38626',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=800',
    gearUsed: ['ARRI Alexa Mini LF', 'Signature Primes', 'Evinrud Carbon Slider'],
    crewList: [
      { role: 'Cinematographer', name: 'Alasdair MacLeod' },
      { role: 'Sound Recordist', name: 'Nora Lindqvist' },
      { role: 'Composer', name: 'Julian Drake' }
    ],
    synopsis: 'Filmed over three days in a dusty, sunlit glass studio on the coast of Oregon. Keith Lawson shares thoughts on patience, physical risk, and the impermanence of working with elements that refuse to stay still.'
  },
  {
    id: 'doc-2',
    title: 'Summit Bound - Chasing the Ridge',
    category: 'documentary',
    client: 'Alpine Club of Canada',
    role: 'Cinematographer & Aerial Operator',
    year: 2024,
    duration: '12:30',
    description: 'An adrenaline-fueled story of three climbers attempting a winter ascent of Mt. Assiniboine. Focuses on extreme physical endurance, isolation, and environmental shifts in high-altitude terrain.',
    videoUrl: 'https://player.vimeo.com/external/413998851.sd.mp4?s=205934524c568f11fe6bc7df57cfb7941fb67ae9&profile_id=165&oauth2_token_id=57447761',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    gearUsed: ['FX3 Cinema Rig', 'DJI Mavic 3 Pro Cine', 'Zeiss Batis Lenses'],
    crewList: [
      { role: 'Director & Lead Climber', name: 'Toby Hendricks' },
      { role: 'Lead Guide & Safety Coordinator', name: 'Sarah Finch' }
    ],
    synopsis: 'Shot under sub-zero conditions using minimum gear configurations. This film explores high mountain architecture, the emotional dynamics of trusting crew in life-threatening scenarios, and the silent vastness of high altitude wilderness.'
  }
];
