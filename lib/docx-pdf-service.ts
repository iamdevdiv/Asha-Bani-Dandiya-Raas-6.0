import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export interface PassGenerationInput {
  stallNumber: string;
  bookerName: string;
  brandName: string;
  bookingNumber: string;
  eventDate?: string;
  venue?: string;
  qrDataUrl?: string;
}

export interface PassGenerationResult {
  docxBuffer: Buffer | null;
  pdfBuffer: Buffer | null;
  image1080DataUrl: string;
  methodUsed: 'adobe_services' | 'server_render_pipeline';
}

/**
 * Replaces {{stall_number}} in reference/stall_booked.docx
 */
export async function populateStallDocx(stallNumber: string): Promise<Buffer> {
  const templatePath = path.join(process.cwd(), 'assets', 'templates', 'stall_booked.docx');

  if (!fs.existsSync(templatePath)) {
    throw new Error('stall_booked.docx template file not found in assets/templates.');
  }

  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
  });

  doc.render({
    stall_number: stallNumber,
    STALL_NUMBER: stallNumber,
    stall: stallNumber,
  });

  const buffer = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return buffer;
}

/**
 * Attempts Adobe PDF Services API conversion if credentials are provided
 */
export async function convertDocxToPdfWithAdobe(docxBuffer: Buffer): Promise<Buffer | null> {
  const clientId = process.env.ADOBE_CLIENT_ID;
  const clientSecret = process.env.ADOBE_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === 'your_adobe_client_id') {
    return null;
  }

  try {
    // Dynamic import to support environment without blocking on optional native modules
    const pdfServicesSDK = await import('@adobe/pdfservices-node-sdk');
    const {
      ServicePrincipalCredentials,
      PDFServices,
      CreatePDFJob,
      CreatePDFParams,
      CreatePDFTarget,
      MIMEType,
    } = pdfServicesSDK as any;

    if (ServicePrincipalCredentials && PDFServices) {
      const credentials = new ServicePrincipalCredentials({
        clientId,
        clientSecret,
      });

      const pdfServices = new PDFServices({ credentials });
      const readStream = Readable.from(docxBuffer);
      const inputAsset = await pdfServices.upload({
        readStream,
        mimeType: MIMEType.DOCX,
      });

      const job = new CreatePDFJob({ inputAsset });
      const pollingURL = await pdfServices.submit({ job });
      const pdfServicesResponse = await pdfServices.getJobResult({
        pollingURL,
        resultType: CreatePDFTarget,
      });

      const resultAsset = pdfServicesResponse.result.asset;
      const streamAsset = await pdfServices.getContent({ asset: resultAsset });
      const chunks: Buffer[] = [];
      for await (const chunk of streamAsset.readStream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }
  } catch (err) {
    console.warn('Adobe PDF Services conversion attempt notice:', err);
  }
  return null;
}

/**
 * Generates an auspicious, 1080x1080 official booked stall certificate graphic
 */
export function generate1080x1080PassImage(input: PassGenerationInput): string {
  const {
    stallNumber,
    bookerName,
    brandName,
    bookingNumber,
    eventDate = '13 October 2026',
    venue = 'Maharaja Agrasen Bhavan, Aggarwal Dharamshala, Saharanpur',
    qrDataUrl = '',
  } = input;

  const sanitizedBrand = brandName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const sanitizedBooker = bookerName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // High-definition 1080x1080 SVG with auspicious royal gold and deep crimson accents
  const svg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a0808" />
      <stop offset="35%" stop-color="#4a0e17" />
      <stop offset="70%" stop-color="#1f0406" />
      <stop offset="100%" stop-color="#0f0203" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="25%" stop-color="#facc15" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="75%" stop-color="#ca8a04" />
      <stop offset="100%" stop-color="#a16207" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04" />
    </linearGradient>
    <pattern id="festivePattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="#facc15" stroke-width="0.75" stroke-opacity="0.15" />
      <circle cx="20" cy="20" r="3" fill="#facc15" fill-opacity="0.2" />
    </pattern>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1080" fill="url(#bgGrad)" />
  <rect width="1080" height="1080" fill="url(#festivePattern)" />

  <!-- Outer Auspicious Border -->
  <rect x="36" y="36" width="1008" height="1008" rx="28" fill="none" stroke="url(#goldGrad)" stroke-width="4" filter="url(#glow)" />
  <rect x="48" y="48" width="984" height="984" rx="20" fill="none" stroke="#facc15" stroke-width="1.5" stroke-opacity="0.5" stroke-dasharray="8 6" />

  <!-- Corner Mandalas / Ornaments -->
  <g fill="url(#goldGrad)">
    <!-- Top Left -->
    <path d="M48 48 L90 48 A42 42 0 0 1 48 90 Z" opacity="0.8" />
    <circle cx="75" cy="75" r="5" />
    <!-- Top Right -->
    <path d="M1032 48 L990 48 A42 42 0 0 0 1032 90 Z" opacity="0.8" />
    <circle cx="1005" cy="75" r="5" />
    <!-- Bottom Left -->
    <path d="M48 1032 L90 1032 A42 42 0 0 0 48 990 Z" opacity="0.8" />
    <circle cx="75" cy="1005" r="5" />
    <!-- Bottom Right -->
    <path d="M1032 1032 L990 1032 A42 42 0 0 1 1032 990 Z" opacity="0.8" />
    <circle cx="1005" cy="1005" r="5" />
  </g>

  <!-- Header Section -->
  <text x="540" y="115" text-anchor="middle" font-family="'Cinzel', 'Georgia', serif" font-size="20" font-weight="700" letter-spacing="6" fill="url(#goldGrad)">
    ASHA BANI DANDIYA RAAS PRESENTS
  </text>
  <text x="540" y="165" text-anchor="middle" font-family="'Cinzel Decorative', 'Georgia', serif" font-size="34" font-weight="900" letter-spacing="2" fill="#ffffff">
    6TH GRAND DANDIYA CELEBRATION
  </text>
  <text x="540" y="200" text-anchor="middle" font-family="'Outfit', 'Helvetica', sans-serif" font-size="16" letter-spacing="3" fill="#fde047">
    OFFICIAL STALL ALLOTMENT PASS
  </text>

  <!-- Decorative Divider -->
  <line x1="200" y1="225" x2="880" y2="225" stroke="url(#goldGrad)" stroke-width="2" />
  <polygon points="540,218 548,225 540,232 532,225" fill="url(#goldGrad)" />

  <!-- Center Big Stall Allotment Badge -->
  <rect x="290" y="260" width="500" height="210" rx="20" fill="url(#cardGrad)" stroke="url(#goldGrad)" stroke-width="2.5" />
  
  <text x="540" y="300" text-anchor="middle" font-family="'Outfit', 'Helvetica', sans-serif" font-size="18" font-weight="600" letter-spacing="4" fill="#fbbf24">
    CONFIRMED ALLOTMENT
  </text>

  <text x="540" y="380" text-anchor="middle" font-family="'Cinzel', 'Georgia', serif" font-size="64" font-weight="900" letter-spacing="2" fill="url(#goldGrad)" filter="url(#glow)">
    STALL ${stallNumber}
  </text>

  <text x="540" y="435" text-anchor="middle" font-family="'Outfit', 'Helvetica', sans-serif" font-size="16" letter-spacing="2" fill="#e2e8f0">
    STATUS: RESERVED &amp; PAID
  </text>

  <!-- Details Card Grid -->
  <g font-family="'Outfit', 'Helvetica', sans-serif">
    <!-- Brand Info Box -->
    <rect x="100" y="500" width="420" height="240" rx="16" fill="url(#cardGrad)" stroke="#facc15" stroke-opacity="0.3" stroke-width="1.5" />
    <text x="130" y="540" font-size="14" letter-spacing="2" fill="#fde047" font-weight="700">BRAND / BUSINESS</text>
    <text x="130" y="580" font-size="26" font-weight="800" fill="#ffffff">${sanitizedBrand}</text>
    
    <text x="130" y="630" font-size="14" letter-spacing="2" fill="#fde047" font-weight="700">BOOKED BY</text>
    <text x="130" y="665" font-size="20" font-weight="600" fill="#ffffff">${sanitizedBooker}</text>
    
    <text x="130" y="705" font-size="13" letter-spacing="1" fill="#cbd5e1">Booking Ref: <tspan fill="#facc15" font-weight="700">${bookingNumber}</tspan></text>

    <!-- Event & Venue Box -->
    <rect x="560" y="500" width="420" height="240" rx="16" fill="url(#cardGrad)" stroke="#facc15" stroke-opacity="0.3" stroke-width="1.5" />
    <text x="590" y="540" font-size="14" letter-spacing="2" fill="#fde047" font-weight="700">DATE &amp; TIME</text>
    <text x="590" y="575" font-size="20" font-weight="700" fill="#ffffff">${eventDate}</text>
    <text x="590" y="605" font-size="15" fill="#fde047">6:00 PM to 12:00 AM (Setup 4:00 PM)</text>

    <text x="590" y="645" font-size="14" letter-spacing="2" fill="#fde047" font-weight="700">VENUE LOCATION</text>
    <text x="590" y="675" font-size="17" font-weight="600" fill="#ffffff">Maharaja Agrasen Bhavan</text>
    <text x="590" y="700" font-size="14" fill="#cbd5e1">Aggarwal Dharamshala, Saharanpur</text>
  </g>

  <!-- Bottom Section: Official Seal & Guidelines -->
  <rect x="100" y="770" width="880" height="180" rx="16" fill="url(#cardGrad)" stroke="#facc15" stroke-opacity="0.3" stroke-width="1.5" />
  
  <g font-family="'Outfit', 'Helvetica', sans-serif" fill="#ffffff">
    <text x="140" y="810" font-size="16" font-weight="700" letter-spacing="1" fill="#fde047">IMPORTANT EXHIBITOR GUIDELINES:</text>
    <text x="140" y="845" font-size="14" fill="#e2e8f0">• Allotment includes 2 tables + 1 space with 2 vendor entry passes.</text>
    <text x="140" y="875" font-size="14" fill="#e2e8f0">• Strict non-refundable &amp; non-transferable allotment terms apply.</text>
    <text x="140" y="905" font-size="14" fill="#e2e8f0">• Support &amp; On-ground Helpdesk: <tspan fill="#facc15" font-weight="700">+91 6399063455</tspan></text>
  </g>

  <!-- Watermark & Security Hash -->
  <text x="540" y="990" text-anchor="middle" font-family="'Courier New', monospace" font-size="12" letter-spacing="2" fill="#a16207">
    DIGITAL PASS VERIFICATION HASH • SECURED VIA ASHA BANI DANDIYA RAAS 2026
  </text>
</svg>
  `.trim();

  // Return data URL directly as high-definition SVG/image representation
  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

/**
 * Master generator function handling DOCX replacement and 1080x1080 pass creation
 */
export async function generateBookingConfirmationPackage(input: PassGenerationInput): Promise<PassGenerationResult> {
  let docxBuffer: Buffer | null = null;
  let pdfBuffer: Buffer | null = null;
  let methodUsed: 'adobe_services' | 'server_render_pipeline' = 'server_render_pipeline';

  try {
    docxBuffer = await populateStallDocx(input.stallNumber);
    pdfBuffer = await convertDocxToPdfWithAdobe(docxBuffer);
    if (pdfBuffer) {
      methodUsed = 'adobe_services';
    }
  } catch (err) {
    console.warn('Docx template processing notice:', err);
  }

  const image1080DataUrl = generate1080x1080PassImage(input);

  return {
    docxBuffer,
    pdfBuffer,
    image1080DataUrl,
    methodUsed,
  };
}
