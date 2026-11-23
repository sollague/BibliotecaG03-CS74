import { forwardRef } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

const FormSelect = forwardRef(function FormSelect(
  {
    etiqueta,
    requerido,
    error,
    helperText,
    opciones,
    placeholder,
    slotProps,
    ...props
  },
  ref,
) {
  return (
    <TextField
      {...props}
      select
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
    >
      {placeholder ? (
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>
      ) : null}
      {opciones.map((opcion) => (
        <MenuItem key={opcion.valor} value={opcion.valor}>
          {opcion.etiqueta}
        </MenuItem>
      ))}
    </TextField>
  );
});

export default FormSelect;
