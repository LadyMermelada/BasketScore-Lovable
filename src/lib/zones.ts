export interface Zone {
  id: string;
  label: string;
  type: 'tl' | '2p' | '3p';
  path: string;
  labelPos: { x: number; y: number };
}

export const ZONES: Zone[] = [
  { id: 'Triple_Izq', label: 'Triple Izq', type: '3p', path: 'M 0 0 L 60 0 L 60 120 L 0 120 Z', labelPos: { x: 30, y: 60 } },
  { id: 'Triple_Der', label: 'Triple Der', type: '3p', path: 'M 340 0 L 400 0 L 400 120 L 340 120 Z', labelPos: { x: 370, y: 60 } },
  { id: 'Triple_Frontal', label: 'Triple Frontal', type: '3p', path: 'M 120 0 L 280 0 L 280 60 L 120 60 Z', labelPos: { x: 200, y: 35 } },
  { id: 'Triple_Esquina_Izq', label: 'Triple Esquina Izq', type: '3p', path: 'M 0 120 L 60 120 L 60 200 L 0 200 Z', labelPos: { x: 30, y: 160 } },
  { id: 'Triple_Esquina_Der', label: 'Triple Esquina Der', type: '3p', path: 'M 340 120 L 400 120 L 400 200 L 340 200 Z', labelPos: { x: 370, y: 160 } },
  { id: 'Doble_Lateral_Izq', label: 'Doble Lateral Izq', type: '2p', path: 'M 60 0 L 120 0 L 120 100 L 60 100 Z', labelPos: { x: 90, y: 50 } },
  { id: 'Doble_Lateral_Der', label: 'Doble Lateral Der', type: '2p', path: 'M 280 0 L 340 0 L 340 100 L 280 100 Z', labelPos: { x: 310, y: 50 } },
  { id: 'Doble_Ala_Izq', label: 'Doble Ala Izq', type: '2p', path: 'M 60 100 L 140 100 L 140 180 L 60 180 Z', labelPos: { x: 100, y: 140 } },
  { id: 'Doble_Ala_Der', label: 'Doble Ala Der', type: '2p', path: 'M 260 100 L 340 100 L 340 180 L 260 180 Z', labelPos: { x: 300, y: 140 } },
  { id: 'Pintura_Baja', label: 'Pintura Baja', type: '2p', path: 'M 140 140 L 260 140 L 260 220 L 140 220 Z', labelPos: { x: 200, y: 180 } },
  { id: 'Pintura_Alta', label: 'Pintura Alta', type: '2p', path: 'M 140 60 L 260 60 L 260 140 L 140 140 Z', labelPos: { x: 200, y: 100 } },
  { id: 'TiroLibre', label: 'Tiro Libre', type: 'tl', path: 'M 160 220 L 240 220 L 240 270 L 160 270 Z', labelPos: { x: 200, y: 248 } },
];

export const ZONE_TYPE_LABELS: Record<string, string> = {
  tl: 'Tiro Libre',
  '2p': '2 Puntos',
  '3p': '3 Puntos',
};
