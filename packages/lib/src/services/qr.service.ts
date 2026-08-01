import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Table, Restaurant, Branch, QRPrintTemplate } from '@qrdine/types';
import { buildPublicTableUrl, formatDate } from '@qrdine/shared';

export interface QRCodeDrawOptions {
  logoUrl?: string | null;
  size?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  restaurantName?: string;
  tableLabel?: string;
}

/**
 * Local Client-Side QR Service — Zero external API calls, zero API keys, no object storage dependencies.
 * Generates scannable QR Codes dynamically using QRCode.js with Error Correction Level H (30% error tolerance).
 * Supports center logo overlay, SVG export, PNG data URL, and PDF generation with 4 printable templates.
 */
export const qrService = {
  /**
   * Generate raw PNG data URL from public table URL with optional logo overlay
   */
  async generateQRCodeDataURL(
    url: string,
    options?: QRCodeDrawOptions
  ): Promise<string> {
    const size = options?.size || 512;
    const margin = options?.margin !== undefined ? options.margin : 2;

    // 1. Generate base QR code on canvas at high error correction (Level H)
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    await QRCode.toCanvas(canvas, url, {
      errorCorrectionLevel: 'H',
      margin,
      width: size,
      color: {
        dark: options?.darkColor || '#000000',
        light: options?.lightColor || '#FFFFFF',
      },
    });

    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas.toDataURL('image/png');

    // 2. Optional: Draw center branding logo / initial badge if available
    if (options?.logoUrl) {
      try {
        const logo = await this.loadImage(options.logoUrl);
        const logoSize = Math.floor(size * 0.22); // 22% of total size (well within 30% H-level tolerance)
        const center = Math.floor(size / 2);
        const halfLogo = Math.floor(logoSize / 2);
        const padding = 8;

        // Draw white rounded background badge for contrast
        ctx.fillStyle = options?.lightColor || '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(
          center - halfLogo - padding,
          center - halfLogo - padding,
          logoSize + padding * 2,
          logoSize + padding * 2,
          12
        );
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw logo image clipped inside circle / rounded rect
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(
          center - halfLogo,
          center - halfLogo,
          logoSize,
          logoSize,
          8
        );
        ctx.clip();
        ctx.drawImage(
          logo,
          center - halfLogo,
          center - halfLogo,
          logoSize,
          logoSize
        );
        ctx.restore();
      } catch (err) {
        console.warn('Failed to load logo image for QR overlay, using fallback:', err);
      }
    }

    return canvas.toDataURL('image/png');
  },

  /**
   * Generate raw SVG string for SVG download
   */
  async generateQRCodeSVG(url: string, options?: QRCodeDrawOptions): Promise<string> {
    return await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: options?.margin !== undefined ? options.margin : 2,
      color: {
        dark: options?.darkColor || '#000000',
        light: options?.lightColor || '#FFFFFF',
      },
    });
  },

  /**
   * Helper to pre-load image cleanly
   */
  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  },

  /**
   * Trigger immediate browser file download (PNG or SVG)
   */
  downloadFile(content: string, filename: string, isDataUrl = true) {
    const link = document.createElement('a');
    link.download = filename;
    if (isDataUrl) {
      link.href = content;
    } else {
      const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
      link.href = URL.createObjectURL(blob);
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Generate PDF Document for Printing with 4 Templates
   */
  async generatePDF(
    tables: Table[],
    restaurant: Restaurant,
    branch?: Branch | null,
    template: QRPrintTemplate = 'tent'
  ): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const restaurantSlug = restaurant.slug;
    const restaurantName = restaurant.name || 'QR Dine';
    const logoUrl = restaurant.logo_url;

    for (let i = 0; i < tables.length; i++) {
      if (i > 0) doc.addPage();

      const table = tables[i];
      const tableUrl = buildPublicTableUrl(restaurantSlug, table.table_token);
      const tableLabel = table.label || `Table ${table.table_number}`;
      const branchName = branch?.name || 'Main Branch';

      // Generate PNG QR image for PDF insertion
      const qrDataUrl = await this.generateQRCodeDataURL(tableUrl, {
        logoUrl,
        size: 600,
        darkColor: '#0F172A',
        lightColor: '#FFFFFF',
      });

      if (template === 'tent') {
        this.renderTableTentTemplate(doc, qrDataUrl, restaurantName, tableLabel, table.table_number, branchName, tableUrl);
      } else if (template === 'stand') {
        this.renderPremiumStandTemplate(doc, qrDataUrl, restaurantName, tableLabel, table.table_number, branchName, tableUrl);
      } else if (template === 'sticker') {
        this.renderSquareStickerTemplate(doc, qrDataUrl, restaurantName, tableLabel, table.table_number, branchName, tableUrl);
      } else if (template === 'acrylic') {
        this.renderAcrylicStandTemplate(doc, qrDataUrl, restaurantName, tableLabel, table.table_number, branchName, tableUrl);
      }
    }

    return doc;
  },

  /**
   * Template 1: Simple Table Tent (A5 Foldable layout on A4 page)
   */
  renderTableTentTemplate(
    doc: jsPDF,
    qrDataUrl: string,
    restaurantName: string,
    tableLabel: string,
    tableNumber: string,
    branchName: string,
    tableUrl: string
  ) {
    // Top Fold Indicator line
    doc.setDrawColor(203, 213, 225);
    doc.setLineDashPattern([3, 3], 0);
    doc.line(10, 148, 200, 148);
    doc.setLineDashPattern([], 0);

    // Header accent bar
    doc.setFillColor(255, 107, 53); // #FF6B35 Orange
    doc.rect(20, 20, 170, 6, 'F');

    // Restaurant Name
    doc.setTextColor(15, 23, 42); // #0F172A
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(restaurantName.toUpperCase(), 105, 38, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(branchName, 105, 45, { align: 'center' });

    // Table Badge
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(65, 52, 80, 12, 4, 4, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(tableLabel, 105, 60, { align: 'center' });

    // QR Image
    doc.addImage(qrDataUrl, 'PNG', 55, 70, 100, 100);

    // Call to Action
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 107, 53);
    doc.text('SCAN TO VIEW MENU & ORDER', 105, 180, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Open camera app or QR scanner on your phone', 105, 187, { align: 'center' });
    doc.text(tableUrl, 105, 194, { align: 'center' });

    // Bottom Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Powered by QR Dine OS', 105, 280, { align: 'center' });
  },

  /**
   * Template 2: Premium Table Stand (Dark & Gold Glassmorphism design)
   */
  renderPremiumStandTemplate(
    doc: jsPDF,
    qrDataUrl: string,
    restaurantName: string,
    tableLabel: string,
    tableNumber: string,
    branchName: string,
    tableUrl: string
  ) {
    // Dark background box
    doc.setFillColor(15, 23, 42); // #0F172A
    doc.roundedRect(15, 15, 180, 267, 8, 8, 'F');

    // Golden accent border line
    doc.setDrawColor(247, 201, 72); // #F7C948
    doc.setLineWidth(1);
    doc.roundedRect(20, 20, 170, 257, 6, 6, 'S');

    // Restaurant Name
    doc.setTextColor(248, 250, 252);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text(restaurantName.toUpperCase(), 105, 42, { align: 'center' });

    doc.setTextColor(247, 201, 72);
    doc.setFontSize(11);
    doc.text(`DIGITAL DINE-IN • ${branchName.toUpperCase()}`, 105, 52, { align: 'center' });

    // White QR Container Card
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(45, 65, 120, 140, 8, 8, 'F');

    // Table Number Circle / Header
    doc.setFillColor(255, 107, 53);
    doc.roundedRect(65, 73, 80, 14, 4, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(tableLabel, 105, 82, { align: 'center' });

    // QR Image inside white box
    doc.addImage(qrDataUrl, 'PNG', 55, 93, 100, 100);

    // Call to Action
    doc.setTextColor(248, 250, 252);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('TOUCHLESS MENU & ORDERING', 105, 222, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('Point camera at QR code • No App Required', 105, 230, { align: 'center' });

    // Footer URL
    doc.setFontSize(9);
    doc.setTextColor(247, 201, 72);
    doc.text(tableUrl, 105, 260, { align: 'center' });
  },

  /**
   * Template 3: Square Sticker Layout (Compact 120mm x 120mm grid on A4)
   */
  renderSquareStickerTemplate(
    doc: jsPDF,
    qrDataUrl: string,
    restaurantName: string,
    tableLabel: string,
    tableNumber: string,
    branchName: string,
    tableUrl: string
  ) {
    // Sticker Outer Frame
    doc.setDrawColor(255, 107, 53);
    doc.setLineWidth(1.5);
    doc.roundedRect(30, 45, 150, 180, 10, 10, 'S');

    // Header
    doc.setFillColor(255, 107, 53);
    doc.roundedRect(30, 45, 150, 24, 10, 10, 'F');
    doc.rect(30, 59, 150, 10, 'F'); // square bottom corners of top header

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(restaurantName.toUpperCase(), 105, 60, { align: 'center' });

    // Table Pill
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(65, 75, 80, 12, 6, 6, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(tableLabel, 105, 83, { align: 'center' });

    // QR Image
    doc.addImage(qrDataUrl, 'PNG', 52, 93, 106, 106);

    // Footer
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('SCAN FOR DIGITAL MENU', 105, 210, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(branchName, 105, 218, { align: 'center' });
  },

  /**
   * Template 4: Acrylic Stand Layout (Clean portrait layout for clear acrylic frames)
   */
  renderAcrylicStandTemplate(
    doc: jsPDF,
    qrDataUrl: string,
    restaurantName: string,
    tableLabel: string,
    tableNumber: string,
    branchName: string,
    tableUrl: string
  ) {
    // Acrylic Stand Border Outline
    doc.setDrawColor(226, 232, 240); // #E2E8F0
    doc.setLineWidth(0.5);
    doc.roundedRect(25, 25, 160, 247, 4, 4, 'S');

    // Header Minimalist Line
    doc.setDrawColor(255, 107, 53);
    doc.setLineWidth(2);
    doc.line(80, 38, 130, 38);

    // Restaurant Title
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(restaurantName, 105, 52, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(branchName, 105, 60, { align: 'center' });

    // QR Image
    doc.addImage(qrDataUrl, 'PNG', 50, 75, 110, 110);

    // Table Tag
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(70, 195, 70, 14, 7, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(tableLabel, 105, 204, { align: 'center' });

    // Instruction Text
    doc.setTextColor(255, 107, 53);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('SCAN TO ORDER & PAY', 105, 222, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Instant ordering directly from your smartphone', 105, 230, { align: 'center' });
    doc.text(tableUrl, 105, 255, { align: 'center' });
  }
};
