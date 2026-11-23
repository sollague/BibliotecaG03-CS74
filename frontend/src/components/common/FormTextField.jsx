import { forwardRef } from 'react';
import TextField from '@mui/material/TextField';

// forwardRef + inputRef son necesarios para que react-hook-form pueda
// registrar el input real y leer su valor al validar y enviar.
const FormTextField = forwardRef(function FormTextField(
  { etiqueta, requerido, helperText, error, slotProps, ...props },
  ref,
) {
  return (
    <TextField
      {...props}
      inputRef={ref}
      label={etiqueta}
      required={requerido}
      error={error}
      helperText={helperText}
      fullWidth
      slotProps={{
        ...slotProps,
        inputLabel: { shrink: true, ...slotProps?.inputLabel },
      }}
    />
  );
});

export default FormTextField;
