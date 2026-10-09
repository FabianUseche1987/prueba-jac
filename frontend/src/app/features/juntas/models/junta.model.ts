// Basado en la tabla `junta` de la base de datos.
// Los campos que en la BD pueden ser NULL aquí son `string | null`.
export interface Junta {
  idJunta: number;                    // id_junta
  nombre: string;                     // nombre
  barrio: string;                     // barrio
  municipio: string;                  // municipio
  departamento: string | null;        // departamento
  nit: string | null;                 // nit
  representanteLegal: string | null;  // representante_legal
  fechaFundacion: string | null;      // fecha_fundacion (formato 'AAAA-MM-DD')
  estado: 'activa' | 'inactiva';      // estado
}
