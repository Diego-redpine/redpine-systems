export const FONT_OPTIONS = [
  { name: 'Inter', family: 'Inter, system-ui, sans-serif', style: 'Clean & Modern' },
  { name: 'Plus Jakarta Sans', family: '"Plus Jakarta Sans", sans-serif', style: 'Friendly & Bold' },
  { name: 'DM Sans', family: '"DM Sans", sans-serif', style: 'Geometric & Sleek' },
  { name: 'Poppins', family: 'Poppins, sans-serif', style: 'Rounded & Warm' },
  { name: 'Outfit', family: 'Outfit, sans-serif', style: 'Contemporary' },
  { name: 'Space Grotesk', family: '"Space Grotesk", sans-serif', style: 'Technical & Sharp' },
  { name: 'Manrope', family: 'Manrope, sans-serif', style: 'Professional' },
  { name: 'Sora', family: 'Sora, sans-serif', style: 'Soft & Minimal' },
  { name: 'Nunito', family: 'Nunito, sans-serif', style: 'Friendly & Round' },
  { name: 'Rubik', family: 'Rubik, sans-serif', style: 'Geometric & Readable' },
  { name: 'Work Sans', family: '"Work Sans", sans-serif', style: 'Versatile & Neutral' },
  { name: 'Raleway', family: 'Raleway, sans-serif', style: 'Elegant & Thin' },
  { name: 'Lato', family: 'Lato, sans-serif', style: 'Universal & Balanced' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif', style: 'Bold & Dynamic' },
  { name: 'Open Sans', family: '"Open Sans", sans-serif', style: 'Approachable' },
  { name: 'Roboto', family: 'Roboto, sans-serif', style: 'Material & Crisp' },
  { name: 'Quicksand', family: 'Quicksand, sans-serif', style: 'Playful & Light' },
  { name: 'Karla', family: 'Karla, sans-serif', style: 'Casual & Grotesk' },
  { name: 'Playfair Display', family: '"Playfair Display", serif', style: 'Serif & Editorial' },
  { name: 'Merriweather', family: 'Merriweather, serif', style: 'Classic Serif' },
  { name: 'Crimson Pro', family: '"Crimson Pro", serif', style: 'Elegant Serif' },
  { name: 'Fira Sans', family: '"Fira Sans", sans-serif', style: 'Sharp & Technical' },
  { name: 'Josefin Sans', family: '"Josefin Sans", sans-serif', style: 'Thin & Geometric' },
  { name: 'Archivo', family: 'Archivo, sans-serif', style: 'Industrial & Modern' },
  { name: 'Cabin', family: 'Cabin, sans-serif', style: 'Humanist & Warm' },
  { name: 'IBM Plex Sans', family: '"IBM Plex Sans", sans-serif', style: 'Technical & Clean' },
  { name: 'Libre Franklin', family: '"Libre Franklin", sans-serif', style: 'Classic & Editorial' },
  { name: 'Barlow', family: 'Barlow, sans-serif', style: 'Condensed & Tech' },
];

// Core fonts loaded in layout.tsx — everything else loaded on demand
export const CORE_FONTS = new Set(['Inter', 'DM Sans', 'Plus Jakarta Sans', 'Poppins', 'Manrope']);

export function loadExtraFonts() {
  if (document.getElementById('extra-fonts-link')) return;
  const extra = FONT_OPTIONS.filter(f => !CORE_FONTS.has(f.name)).map(f => {
    const encoded = f.name.replace(/ /g, '+');
    const weights = f.name === 'Lato' || f.name === 'Merriweather' ? 'wght@400;700' : 'wght@400;500;600;700';
    return `family=${encoded}:${weights}`;
  });
  const link = document.createElement('link');
  link.id = 'extra-fonts-link';
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${extra.join('&')}&display=swap`;
  document.head.appendChild(link);
}
