import type { PageType } from '../schemas/page'

export const ENTITY_DEFAULT_FIELDS: Record<PageType, string[]> = {
  character: ['Rol', 'Facción', 'Edad', 'Habilidades'],
  enemy: ['HP', 'Daño', 'Comportamiento', 'Debilidad'],
  item: ['Tipo', 'Rareza', 'Efecto', 'Valor'],
  level: ['Bioma', 'Dificultad', 'Objetivo', 'Duración estimada'],
  mechanic: ['Categoría', 'Inputs', 'Estado', 'Dependencias'],
  doc: [],
  section: [],
}

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  doc: 'Documento',
  section: 'Sección',
  character: 'Personaje',
  item: 'Ítem',
  enemy: 'Enemigo',
  level: 'Nivel',
  mechanic: 'Mecánica',
}

export const ENTITY_TYPES: PageType[] = [
  'character',
  'item',
  'enemy',
  'level',
  'mechanic',
]
