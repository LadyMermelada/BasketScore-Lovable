export interface Zone {
  id: string;
  label: string;
  type: 'tl' | '2p' | '3p';
}

export const ZONES: Zone[] = [
  { id: 'Triple_Izq', label: 'Triple Izq', type: '3p' },
  { id: 'Triple_Der', label: 'Triple Der', type: '3p' },
  { id: 'Triple_Frontal', label: 'Triple Frontal', type: '3p' },
  { id: 'Triple_Esquina_Izq', label: 'Triple Esquina Izq', type: '3p' },
  { id: 'Triple_Esquina_Der', label: 'Triple Esquina Der', type: '3p' },
  { id: 'Doble_Lateral_Izq', label: 'Doble Lateral Izq', type: '2p' },
  { id: 'Doble_Lateral_Der', label: 'Doble Lateral Der', type: '2p' },
  { id: 'Doble_Ala_Izq', label: 'Doble Ala Izq', type: '2p' },
  { id: 'Doble_Ala_Der', label: 'Doble Ala Der', type: '2p' },
  { id: 'Pintura_Baja', label: 'Pintura Baja', type: '2p' },
  { id: 'Pintura_Alta', label: 'Pintura Alta', type: '2p' },
  { id: 'TiroLibre', label: 'Tiro Libre', type: 'tl' },
];

export const ZONE_TYPE_LABELS: Record<string, string> = {
  tl: 'Tiro Libre',
  '2p': '2 Puntos',
  '3p': '3 Puntos',
};
