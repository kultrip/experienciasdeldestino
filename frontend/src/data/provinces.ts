export interface Province {
  name: string;
  community: string;
  code: string;
}

export const SPANISH_PROVINCES: Province[] = [
  { name: 'A Coruña', community: 'Galicia', code: 'C' },
  { name: 'Lugo', community: 'Galicia', code: 'LU' },
  { name: 'Ourense', community: 'Galicia', code: 'OU' },
  { name: 'Pontevedra', community: 'Galicia', code: 'PO' },
  { name: 'Almería', community: 'Andalucía', code: 'AL' },
  { name: 'Cádiz', community: 'Andalucía', code: 'CA' },
  { name: 'Córdoba', community: 'Andalucía', code: 'CO' },
  { name: 'Granada', community: 'Andalucía', code: 'GR' },
  { name: 'Huelva', community: 'Andalucía', code: 'H' },
  { name: 'Jaén', community: 'Andalucía', code: 'J' },
  { name: 'Málaga', community: 'Andalucía', code: 'MA' },
  { name: 'Sevilla', community: 'Andalucía', code: 'SE' },
  { name: 'Barcelona', community: 'Cataluña', code: 'B' },
  { name: 'Girona', community: 'Cataluña', code: 'GI' },
  { name: 'Lleida', community: 'Cataluña', code: 'L' },
  { name: 'Tarragona', community: 'Cataluña', code: 'T' },
  { name: 'Alicante', community: 'Comunidad Valenciana', code: 'A' },
  { name: 'Castellón', community: 'Comunidad Valenciana', code: 'CS' },
  { name: 'Valencia', community: 'Comunidad Valenciana', code: 'V' },
  { name: 'Álava', community: 'País Vasco', code: 'VI' },
  { name: 'Guipúzcoa', community: 'País Vasco', code: 'SS' },
  { name: 'Vizcaya', community: 'País Vasco', code: 'BI' },
  { name: 'Ávila', community: 'Castilla y León', code: 'AV' },
  { name: 'Burgos', community: 'Castilla y León', code: 'BU' },
  { name: 'León', community: 'Castilla y León', code: 'LE' },
  { name: 'Palencia', community: 'Castilla y León', code: 'P' },
  { name: 'Salamanca', community: 'Castilla y León', code: 'SA' },
  { name: 'Segovia', community: 'Castilla y León', code: 'SG' },
  { name: 'Soria', community: 'Castilla y León', code: 'SO' },
  { name: 'Valladolid', community: 'Castilla y León', code: 'VA' },
  { name: 'Zamora', community: 'Castilla y León', code: 'ZA' },
  { name: 'Albacete', community: 'Castilla-La Mancha', code: 'AB' },
  { name: 'Ciudad Real', community: 'Castilla-La Mancha', code: 'CR' },
  { name: 'Cuenca', community: 'Castilla-La Mancha', code: 'CU' },
  { name: 'Guadalajara', community: 'Castilla-La Mancha', code: 'GU' },
  { name: 'Toledo', community: 'Castilla-La Mancha', code: 'TO' },
  { name: 'Huesca', community: 'Aragón', code: 'HU' },
  { name: 'Teruel', community: 'Aragón', code: 'TE' },
  { name: 'Zaragoza', community: 'Aragón', code: 'Z' },
  { name: 'Asturias', community: 'Asturias', code: 'O' },
  { name: 'Cantabria', community: 'Cantabria', code: 'S' },
  { name: 'La Rioja', community: 'La Rioja', code: 'LO' },
  { name: 'Murcia', community: 'Murcia', code: 'MU' },
  { name: 'Badajoz', community: 'Extremadura', code: 'BA' },
  { name: 'Cáceres', community: 'Extremadura', code: 'CC' },
  { name: 'Islas Baleares', community: 'Islas Baleares', code: 'PM' },
  { name: 'Las Palmas', community: 'Islas Canarias', code: 'GC' },
  { name: 'Santa Cruz de Tenerife', community: 'Islas Canarias', code: 'TF' },
  { name: 'Madrid', community: 'Comunidad de Madrid', code: 'M' },
  { name: 'Navarra', community: 'Navarra', code: 'NA' },
  { name: 'Ceuta', community: 'Ceuta', code: 'CE' },
  { name: 'Melilla', community: 'Melilla', code: 'ML' },
];

export const getProvinceNames = (): string[] => {
  return SPANISH_PROVINCES.map((p) => p.name);
};
