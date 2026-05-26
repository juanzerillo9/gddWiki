import type { PageType } from '../schemas/page'

export type ProjectType = 'videogame' | 'tabletop' | 'app' | 'novel' | 'worldbuilding'

export type TemplateNode = {
  type: PageType
  title: string
  icon?: string
  childType?: PageType
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  videogame: 'Videojuego',
  tabletop: 'Juego de mesa / RPG',
  app: 'App / Software',
  novel: 'Novela / Historia',
  worldbuilding: 'Worldbuilding',
}

export const PROJECT_TYPE_ICONS: Record<ProjectType, string> = {
  videogame: '🎮',
  tabletop: '🎲',
  app: '💻',
  novel: '📚',
  worldbuilding: '🌍',
}

export const PROJECT_TYPE_DESCRIPTIONS: Record<ProjectType, string> = {
  videogame: 'GDD completo: mecánicas, personajes, niveles, arte y producción',
  tabletop: 'RPG, board game o wargame: reglas, razas, escenarios y lore',
  app: 'Producto digital: requisitos, arquitectura, features y roadmap',
  novel: 'Ficción o guion: personajes, lugares, trama y cronología',
  worldbuilding: 'Universo o lore: historia, geografía, razas y magia',
}

export const PROJECT_TEMPLATES: Record<ProjectType, TemplateNode[]> = {
  videogame: [
    { type: 'doc', title: 'Visión / Concepto', icon: '🎯' },
    { type: 'doc', title: 'Pilares de diseño', icon: '🏛️' },
    { type: 'doc', title: 'Gameplay & Mecánicas', icon: '🎮' },
    { type: 'doc', title: 'Narrativa & Mundo', icon: '📖' },
    { type: 'section', title: 'Personajes', icon: '🧑', childType: 'character' },
    { type: 'section', title: 'Enemigos', icon: '👾', childType: 'enemy' },
    { type: 'section', title: 'Ítems', icon: '🎒', childType: 'item' },
    { type: 'section', title: 'Niveles / Mundos', icon: '🗺️', childType: 'level' },
    { type: 'section', title: 'Mecánicas', icon: '⚙️', childType: 'mechanic' },
    { type: 'doc', title: 'Arte & Estilo visual', icon: '🎨' },
    { type: 'doc', title: 'Audio', icon: '🔊' },
    { type: 'doc', title: 'UI / UX', icon: '📱' },
    { type: 'doc', title: 'Roadmap / Producción', icon: '📋' },
  ],

  tabletop: [
    { type: 'doc', title: 'Concepto del juego', icon: '🎯' },
    { type: 'doc', title: 'Mecánicas centrales', icon: '⚙️' },
    { type: 'doc', title: 'Reglas del juego', icon: '📜' },
    { type: 'section', title: 'Razas / Clases', icon: '🧙', childType: 'character' },
    { type: 'section', title: 'Bestias & PNJs', icon: '🐉', childType: 'enemy' },
    { type: 'section', title: 'Equipo & Artefactos', icon: '⚔️', childType: 'item' },
    { type: 'section', title: 'Escenarios / Módulos', icon: '🗺️', childType: 'level' },
    { type: 'doc', title: 'Trasfondo & Lore', icon: '📖' },
    { type: 'doc', title: 'Arte & Producción', icon: '🎨' },
    { type: 'doc', title: 'Fichas de referencia', icon: '📋' },
  ],

  app: [
    { type: 'doc', title: 'Visión del producto', icon: '🎯' },
    { type: 'doc', title: 'Requisitos y objetivos', icon: '📋' },
    { type: 'doc', title: 'Arquitectura técnica', icon: '🏗️' },
    { type: 'section', title: 'Funcionalidades', icon: '✨', childType: 'mechanic' },
    { type: 'section', title: 'Modelos de datos', icon: '🗄️', childType: 'item' },
    { type: 'doc', title: 'Diseño de interfaz', icon: '🖼️' },
    { type: 'doc', title: 'API & Integraciones', icon: '🔌' },
    { type: 'doc', title: 'Seguridad', icon: '🔒' },
    { type: 'doc', title: 'Plan de pruebas', icon: '🧪' },
    { type: 'doc', title: 'Roadmap', icon: '🗓️' },
  ],

  novel: [
    { type: 'doc', title: 'Sinopsis', icon: '📝' },
    { type: 'doc', title: 'Estructura narrativa', icon: '🏛️' },
    { type: 'section', title: 'Personajes', icon: '🧑', childType: 'character' },
    { type: 'section', title: 'Lugares', icon: '🏙️', childType: 'level' },
    { type: 'section', title: 'Objetos importantes', icon: '🔮', childType: 'item' },
    { type: 'doc', title: 'Cronología', icon: '⏳' },
    { type: 'doc', title: 'Tramas y subtramas', icon: '🕸️' },
    { type: 'doc', title: 'Temáticas y símbolos', icon: '🌙' },
    { type: 'doc', title: 'Notas del autor', icon: '✍️' },
  ],

  worldbuilding: [
    { type: 'doc', title: 'Historia del mundo', icon: '🌍' },
    { type: 'section', title: 'Geografía', icon: '🗺️', childType: 'level' },
    { type: 'section', title: 'Razas & Culturas', icon: '👥', childType: 'character' },
    { type: 'section', title: 'Bestias & Criaturas', icon: '🦁', childType: 'enemy' },
    { type: 'section', title: 'Artefactos & Magia', icon: '✨', childType: 'item' },
    { type: 'section', title: 'Sistemas de magia', icon: '🔮', childType: 'mechanic' },
    { type: 'doc', title: 'Facciones & Poderes', icon: '⚔️' },
    { type: 'doc', title: 'Religiones & Mitología', icon: '🏛️' },
    { type: 'doc', title: 'Idiomas & Escritura', icon: '📜' },
    { type: 'doc', title: 'Cronología del mundo', icon: '⏳' },
  ],
}

export const PROJECT_TYPES: ProjectType[] = [
  'videogame',
  'tabletop',
  'app',
  'novel',
  'worldbuilding',
]
