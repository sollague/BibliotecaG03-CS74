import { createTheme } from '@mui/material/styles';

const PALETA = {
  primary: {
    main: '#E87524',
    dark: '#BD5417',
    light: '#FFF0E5',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#374151',
    dark: '#252E3B',
    light: '#EEF0F3',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F7F7F8',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#252525',
    secondary: '#6B7280',
  },
  divider: '#E5E7EB',
  success: {
    main: '#23834A',
    dark: '#1A6338',
    light: '#E6F4EC',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#B7791F',
    dark: '#8A5A16',
    light: '#FBF3E4',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#C0392B',
    dark: '#8F2B21',
    light: '#FBEAE8',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#2563A6',
    dark: '#1C4B7E',
    light: '#E8F0F9',
    contrastText: '#FFFFFF',
  },
};

export const tema = createTheme({
  palette: PALETA,
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontSize: '1.625rem', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.35 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.45 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: PALETA.background.default,
          color: PALETA.text.primary,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 16,
          minHeight: 38,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderColor: PALETA.divider,
          borderRadius: 10,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${PALETA.divider}`,
          paddingBlock: 14,
        },
        head: {
          backgroundColor: '#F9FAFB',
          color: PALETA.text.secondary,
          fontWeight: 600,
          fontSize: '0.8125rem',
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: PALETA.background.paper,
        },
      },
    },
  },
});
