import { z } from 'zod';

const textoOpcional = (max) => z.string().trim().max(max).optional().or(z.literal(''));

const datosInstitucion = {
  institucionNombre: textoOpcional(191),
  institucionRuc: textoOpcional(20),
  responsableNombre: textoOpcional(191),
  responsableCargo: textoOpcional(100),
  responsableEmail: textoOpcional(191),
  responsableTelefono: textoOpcional(30),
};

function validarDatosInstitucion(datos, ctx) {
  if (datos.tipoSolicitado !== 'INSTITUCION_EDUCATIVA') return;

  if (!datos.institucionNombre) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['institucionNombre'],
      message: 'Ingresa el nombre de la institución educativa.',
    });
  }
  if (!datos.responsableNombre) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['responsableNombre'],
      message: 'Ingresa el nombre del responsable de la institución.',
    });
  }
  if (
    datos.responsableEmail &&
    !z.string().email().safeParse(datos.responsableEmail).success
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['responsableEmail'],
      message: 'Ingresa un correo válido para el responsable.',
    });
  }
}

export const esquemaCrearSolicitudTipo = z
  .object({
    tipoSolicitado: z.enum(['ESTUDIANTE', 'BECARIO', 'INSTITUCION_EDUCATIVA'], {
      errorMap: () => ({
        message: 'Selecciona Estudiante, Becario o Institución educativa.',
      }),
    }),
    documentoValidacion: z
      .string()
      .trim()
      .min(3, 'Describe el documento de validación que presentarás.')
      .max(255),
    motivo: textoOpcional(255),
    ...datosInstitucion,
  })
  .superRefine(validarDatosInstitucion);

export const esquemaRevisarSolicitudTipo = z
  .object({
    estado: z.enum(['APROBADA', 'RECHAZADA'], {
      errorMap: () => ({ message: 'Selecciona aprobar o rechazar la solicitud.' }),
    }),
    observacionRevision: textoOpcional(255),
  })
  .superRefine((datos, ctx) => {
    if (datos.estado === 'RECHAZADA' && !datos.observacionRevision) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['observacionRevision'],
        message: 'Indica el motivo del rechazo para que el cliente pueda corregirlo.',
      });
    }
  });

export const esquemaListarSolicitudesTipo = z.object({
  estado: z
    .enum(['PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA'])
    .optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const esquemaIdSolicitud = z.object({
  id: z.coerce.number().int().positive(),
});

export const esquemaDocumentoSolicitud = z.object({
  id: z.coerce.number().int().positive(),
  documentoId: z.coerce.number().int().positive(),
});
