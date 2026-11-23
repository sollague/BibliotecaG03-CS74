import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { autenticar, autorizar } from '../../middlewares/auth.js';
import { validar } from '../../middlewares/validate.js';
import { AppError } from '../../utils/AppError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { metaPaginacion, obtenerPaginacion } from '../../utils/pagination.js';
import {
  DIRECTORIO_DOCUMENTOS,
  cancelarSolicitudCliente,
  crearSolicitudTipo,
  listarSolicitudesCliente,
  listarSolicitudesTipo,
  obtenerDocumentoSolicitud,
  revisarSolicitudTipo,
} from './solicitudes-tipo.service.js';
import {
  esquemaCrearSolicitudTipo,
  esquemaDocumentoSolicitud,
  esquemaIdSolicitud,
  esquemaListarSolicitudesTipo,
  esquemaRevisarSolicitudTipo,
} from './solicitudes-tipo.schemas.js';

const MIMES_PERMITIDOS = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

const subirDocumentos = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter: (req, archivo, siguiente) => {
    if (!MIMES_PERMITIDOS.has(archivo.mimetype)) {
      siguiente(
        new AppError(400, 'Solo se permiten documentos PDF, JPG o PNG.'),
      );
      return;
    }
    siguiente(null, true);
  },
});

// Si el cliente adjunta archivos sin escribir una descripción, se usa el
// nombre de los archivos para conservar el campo histórico documentoValidacion.
function completarDescripcion(req, res, siguiente) {
  if (!req.body.documentoValidacion && req.files?.length) {
    req.body.documentoValidacion = req.files
      .map((archivo) => archivo.originalname)
      .join(', ')
      .slice(0, 255);
  }
  siguiente();
}

export const solicitudesTipoRouter = Router();

solicitudesTipoRouter.use(autenticar);

// Cliente: presenta y consulta sus propias solicitudes.
solicitudesTipoRouter.post(
  '/',
  autorizar('CLIENTE'),
  subirDocumentos.array('documentos', 3),
  completarDescripcion,
  validar(esquemaCrearSolicitudTipo),
  asyncHandler(async (req, res) => {
    const solicitud = await crearSolicitudTipo(
      req.usuario.id,
      req.body,
      req.files ?? [],
    );
    return res.status(201).json({
      data: solicitud,
      mensaje:
        'Solicitud enviada. El Bibliotecario revisará los documentos y actualizará tu tipo de cliente.',
    });
  }),
);

solicitudesTipoRouter.get(
  '/mias',
  autorizar('CLIENTE'),
  asyncHandler(async (req, res) => {
    const solicitudes = await listarSolicitudesCliente(req.usuario.id);
    return res.json({ data: solicitudes });
  }),
);

solicitudesTipoRouter.get(
  '/:id/documentos/:documentoId',
  validar(esquemaDocumentoSolicitud, 'params'),
  asyncHandler(async (req, res) => {
    const documento = await obtenerDocumentoSolicitud(
      req.params.id,
      req.params.documentoId,
      req.usuario,
    );
    return res.download(
      path.join(DIRECTORIO_DOCUMENTOS, documento.nombreArchivo),
      documento.nombreOriginal,
    );
  }),
);

solicitudesTipoRouter.patch(
  '/:id/cancelar',
  autorizar('CLIENTE'),
  validar(esquemaIdSolicitud, 'params'),
  asyncHandler(async (req, res) => {
    const solicitud = await cancelarSolicitudCliente(req.usuario.id, req.params.id);
    return res.json({
      data: solicitud,
      mensaje: 'Solicitud cancelada correctamente.',
    });
  }),
);

// Bibliotecario: revisa las solicitudes presentadas por los clientes.
solicitudesTipoRouter.get(
  '/',
  autorizar('BIBLIOTECARIO'),
  validar(esquemaListarSolicitudesTipo, 'query'),
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = obtenerPaginacion(req.query);
    const { total, solicitudes } = await listarSolicitudesTipo({
      estado: req.query.estado,
      skip,
      take,
    });
    return res.json({
      data: solicitudes,
      meta: metaPaginacion(total, page, pageSize),
    });
  }),
);

solicitudesTipoRouter.patch(
  '/:id/revisar',
  autorizar('BIBLIOTECARIO'),
  validar(esquemaIdSolicitud, 'params'),
  validar(esquemaRevisarSolicitudTipo),
  asyncHandler(async (req, res) => {
    const solicitud = await revisarSolicitudTipo(
      req.params.id,
      req.body,
      req.usuario.id,
    );
    return res.json({
      data: solicitud,
      mensaje:
        req.body.estado === 'APROBADA'
          ? 'Solicitud aprobada. El tipo de cliente fue actualizado.'
          : 'Solicitud rechazada. El cliente conserva su tipo actual.',
    });
  }),
);
