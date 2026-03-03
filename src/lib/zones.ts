export interface Zone {
  id: string;
  label: string;
  type: 'tl' | '2p' | '3p';
  path: string;
  labelPos: { x: number; y: number };
}

export const ZONES: Zone[] = [
  {
    id: 'Triple_Esquina_Izq',
    label: 'Triple Esq. Izq',
    type: '3p',
    path: 'M 0 220 L 30 220 L 30 300 L 0 300 Z',
    labelPos: { x: 15, y: 260 }
  },
  {
    id: 'Triple_Esquina_Der',
    label: 'Triple Esq. Der',
    type: '3p',
    path: 'M 370 220 L 400 220 L 400 300 L 370 300 Z',
    labelPos: { x: 385, y: 260 }
  },
  {
    id: 'Triple_Izq',
    label: 'Triple Izq',
    type: '3p',
    path: 'M 0 220 L 30 220 Q 30 110 115 80 L 115 0 L 0 0 Z',
    labelPos: { x: 50, y: 100 }
  },
  {
    id: 'Triple_Frontal',
    label: 'Triple Frontal',
    type: '3p',
    path: 'M 115 0 L 115 80 Q 160 50 200 50 Q 240 50 285 80 L 285 0 L 115 0 Z',
    labelPos: { x: 200, y: 35 }
  },
  {
    id: 'Triple_Der',
    label: 'Triple Der',
    type: '3p',
    path: 'M 285 0 L 285 80 Q 370 110 370 220 L 400 220 L 400 0 Z',
    labelPos: { x: 350, y: 100 }
  },
  {
    id: 'Doble_Lateral_Izq',
    label: 'Doble Lateral Izq',
    type: '2p',
    path: 'M 30 220 L 140 220 L 140 300 L 30 300 Z',
    labelPos: { x: 85, y: 260 }
  },
  {
    id: 'Doble_Lateral_Der',
    label: 'Doble Lateral Der',
    type: '2p',
    path: 'M 260 220 L 370 220 L 370 300 L 260 300 Z',
    labelPos: { x: 315, y: 260 }
  },
  {
    id: 'Doble_Ala_Izq',
    label: 'Doble Ala Izq',
    type: '2p',
    path: 'M 30 220 Q 30 110 115 80 Q 160 50 200 50 L 200 80 A 60 60 0 0 0 140 140 L 140 220 L 30 220 Z',
    labelPos: { x: 100, y: 155 }
  },
  {
    id: 'Doble_Ala_Der',
    label: 'Doble Ala Der',
    type: '2p',
    path: 'M 200 50 Q 240 50 285 80 Q 370 110 370 220 L 260 220 L 260 140 A 60 60 0 0 0 200 80 L 200 50 Z',
    labelPos: { x: 300, y: 155 }
  },
  {
    id: 'Pintura_Baja',
    label: 'Pintura Baja',
    type: '2p',
    path: 'M 140 220 L 260 220 L 260 300 L 140 300 Z',
    labelPos: { x: 200, y: 260 }
  },
  {
    id: 'Pintura_Alta',
    label: 'Pintura Alta',
    type: '2p',
    path: 'M 140 140 L 260 140 L 260 220 L 140 220 Z',
    labelPos: { x: 200, y: 180 }
  },
  {
    id: 'TiroLibre',
    label: 'Tiro Libre',
    type: 'tl',
    path: 'M 140 140 A 60 60 0 0 1 260 140 Z',
    labelPos: { x: 200, y: 110 }
  }
];

export const ZONE_TYPE_LABELS: Record<string, string> = {
  tl: 'Tiro Libre',
  '2p': '2 Puntos',
  '3p': '3 Puntos',
};
