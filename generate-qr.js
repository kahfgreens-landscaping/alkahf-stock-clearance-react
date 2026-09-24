import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = 'https://kahfgreens-landscaping.github.io/alkahf-stock-clearance-react/';

async function generate() {
  const pubDir = path.join(__dirname, 'public');
  const driveDir = 'G:/My Drive/ALKAHF LANDSCAPING/STOCK CLEARANCE';

  // 1. Forest Green Branded QR (high-res 1200px)
  const greenPngPath = path.join(pubDir, 'qr-code.png');
  await QRCode.toFile(greenPngPath, url, {
    width: 1200,
    margin: 2,
    color: {
      dark: '#14532d', // deep forest green
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });

  // 2. High Contrast Black & White QR (1200px)
  const blackPngPath = path.join(pubDir, 'qr-code-black.png');
  await QRCode.toFile(blackPngPath, url, {
    width: 1200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });

  // 3. Crisp Vector SVG
  const svgContent = await QRCode.toString(url, {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#14532d',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });
  fs.writeFileSync(path.join(pubDir, 'qr-code.svg'), svgContent);

  // 4. Save copies to Google Drive if accessible
  if (fs.existsSync(driveDir)) {
    try {
      fs.copyFileSync(greenPngPath, path.join(driveDir, 'QR_CODE_KAHF_GREENS.png'));
      fs.copyFileSync(blackPngPath, path.join(driveDir, 'QR_CODE_KAHF_GREENS_BLACK.png'));
      fs.copyFileSync(path.join(pubDir, 'qr-code.svg'), path.join(driveDir, 'QR_CODE_KAHF_GREENS.svg'));
      console.log('Copied QR codes to Google Drive folder!');
    } catch (e) {
      console.warn('Could not copy to drive:', e.message);
    }
  }

  console.log('All QR codes generated successfully!');
}

generate();
