import Link from "next/link";
import { Box } from "@mui/material";

const iconStyle = { width: 28, height: 28, marginRight: 12, verticalAlign: 'middle', filter: 'invert(1)' };

export default function Footer() {
  return (
    <Box sx={{
      width: '100%',
      bgcolor: '#000',
      color: '#fff',
      py: { xs: 6, sm: 8 },
      mt: 10,
      px: 0,
      borderTop: '1px solid #222',
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-around',
      alignItems: { xs: 'flex-start', md: 'center' },
      gap: { xs: 4, md: 0 },
      fontSize: 16,
    }}>
      {/* 1st column */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Link href="/shoes" style={{ color: '#fff', textDecoration: 'none' }}>
          <Box sx={{ cursor: 'pointer', fontWeight: 500, letterSpacing: '.5px', textTransform: 'uppercase', fontSize: 15, borderBottom: '2px solid transparent', transition: 'border 0.2s', '&:hover': { borderBottom: '2px solid #fff' } }}>Shoes</Box>
        </Link>
        <Link href="/reviews" style={{ color: '#fff', textDecoration: 'none' }}>
          <Box sx={{ cursor: 'pointer', fontWeight: 500, letterSpacing: '.5px', textTransform: 'uppercase', fontSize: 15, borderBottom: '2px solid transparent', transition: 'border 0.2s', '&:hover': { borderBottom: '2px solid #fff' } }}>Reviews</Box>
        </Link>
        <Link href="/profile" style={{ color: '#fff', textDecoration: 'none' }}>
          <Box sx={{ cursor: 'pointer', fontWeight: 500, letterSpacing: '.5px', textTransform: 'uppercase', fontSize: 15, borderBottom: '2px solid transparent', transition: 'border 0.2s', '&:hover': { borderBottom: '2px solid #fff' } }}>Profile</Box>
        </Link>
      </Box>
      {/* 2nd column */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Link href="/legal" style={{ color: '#fff', textDecoration: 'none' }}>
          <Box sx={{ cursor: 'pointer', fontWeight: 500, fontSize: 15, textDecoration: 'underline' }}>Legal Disclaimer</Box>
        </Link>
        <Link href="/privacy" style={{ color: '#fff', textDecoration: 'none' }}>
          <Box sx={{ cursor: 'pointer', fontWeight: 500, fontSize: 15, textDecoration: 'underline' }}>Privacy Policy</Box>
        </Link>
        <Link href="/about" style={{ color: '#fff', textDecoration: 'none' }}>
          <Box sx={{ cursor: 'pointer', fontWeight: 500, fontSize: 15, textDecoration: 'underline' }}>About Page</Box>
        </Link>
      </Box>
      {/* 3rd column: Social icons */}
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, mt: { xs: 2, md: 0 } }}>
        <a href="#" aria-label="Instagram"><img style={iconStyle} src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg" alt="Instagram" /></a>
        <a href="#" aria-label="Twitter"><img style={iconStyle} src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg" alt="Twitter" /></a>
        <a href="#" aria-label="Facebook"><img style={iconStyle} src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" alt="Facebook" /></a>
      </Box>
    </Box>
  );
}
