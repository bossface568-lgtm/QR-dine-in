import React, { useState } from 'react';
import { Table, Branch, Restaurant, QRPrintTemplate } from '@qrdine/types';
import { Modal, Button, useToast } from '@qrdine/ui';
import { qrService } from '@qrdine/lib';
import { QRCodeCanvas } from './QRCodeCanvas';
import { buildPublicTableUrl } from '@qrdine/shared';
import {
  Printer,
  FileText,
  Sparkles,
  Square,
  Frame,
  Check,
  Download,
  Eye,
  Building2,
  Users,
} from 'lucide-react';

interface QRPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: Table[];
  restaurant: Restaurant | null;
  branches?: Branch[];
}

export const QRPrintModal: React.FC<QRPrintModalProps> = ({
  isOpen,
  onClose,
  tables,
  restaurant,
  branches = [],
}) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<QRPrintTemplate>('tent');
  const [downloading, setDownloading] = useState(false);

  if (!restaurant || tables.length === 0) return null;

  const sampleTable = tables[0];
  const sampleBranch = branches.find((b) => b.id === sampleTable.branch_id);
  const sampleUrl = buildPublicTableUrl(restaurant.slug, sampleTable.table_token);

  const templates: { id: QRPrintTemplate; name: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'tent',
      name: 'Simple Table Tent',
      desc: 'Foldable A5 / A6 tent card design with clear scan instructions for dining tables.',
      icon: <FileText className="w-5 h-5 text-orange-400" />,
    },
    {
      id: 'stand',
      name: 'Premium Table Stand',
      desc: 'Sleek dark & gold glassmorphism design for high-end dining stands & counter displays.',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'sticker',
      name: 'Square Sticker',
      desc: 'Compact square border sticker layout (100mm x 100mm) suitable for table corners.',
      icon: <Square className="w-5 h-5 text-blue-400" />,
    },
    {
      id: 'acrylic',
      name: 'Acrylic Stand Layout',
      desc: 'Clean portrait layout designed specifically for transparent acrylic photo frames.',
      icon: <Frame className="w-5 h-5 text-purple-400" />,
    },
  ];

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const pdfDoc = await qrService.generatePDF(tables, restaurant, sampleBranch, selectedTemplate);
      const countLabel = tables.length === 1 ? `table_${sampleTable.table_number}` : `${tables.length}_tables`;
      pdfDoc.save(`${restaurant.slug}_qr_sheets_${countLabel}_${selectedTemplate}.pdf`);
      toast(`Generated ${tables.length} printable QR sheet(s) PDF!`, 'success');
      onClose();
    } catch (err: any) {
      console.error('PDF Generation error:', err);
      toast('Failed to generate PDF printable sheet', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleBrowserPrint = async () => {
    try {
      setDownloading(true);
      const pdfDoc = await qrService.generatePDF(tables, restaurant, sampleBranch, selectedTemplate);
      const blob = pdfDoc.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      const printWindow = window.open(blobUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
      }
    } catch (err: any) {
      console.error('Browser print error:', err);
      toast('Failed to open browser print dialog', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Printable QR Code Templates">
      <div className="flex flex-col gap-6 py-2 text-slate-200">
        {/* Top Header summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Print Sheet Configurator
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              Generating {tables.length} Table QR Sheet{tables.length > 1 ? 's' : ''}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a professional design template to generate high-resolution print-ready PDFs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
              Target: A4 Standard Sheet
            </span>
          </div>
        </div>

        {/* Template Selector Grid & Live Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Template Selection List */}
          <div className="md:col-span-6 flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Design Template
            </label>

            {templates.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {tmpl.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-100">{tmpl.name}</h4>
                      {isSelected && (
                        <span className="p-1 rounded-full bg-orange-500 text-white">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tmpl.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Mock Template Preview Box */}
          <div className="md:col-span-6 flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Live Template Mockup</span>
              <span className="text-[10px] text-slate-500 font-mono">Sample: {sampleTable.label || sampleTable.table_number}</span>
            </label>

            <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 min-h-[340px] shadow-inner">
              {/* Tent Mockup */}
              {selectedTemplate === 'tent' && (
                <div className="w-64 bg-white text-slate-900 p-5 rounded-xl border border-slate-300 shadow-xl flex flex-col items-center text-center">
                  <div className="w-full h-1.5 bg-orange-500 rounded-full mb-3" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-900">{restaurant.name}</span>
                  <span className="text-[10px] text-slate-500 mb-2">{sampleBranch?.name || 'Main Branch'}</span>
                  <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-800 mb-3">
                    {sampleTable.label || `Table ${sampleTable.table_number}`}
                  </div>
                  <QRCodeCanvas url={sampleUrl} size={150} logoUrl={restaurant.logo_url} />
                  <span className="text-xs font-bold text-orange-600 mt-3">SCAN TO VIEW MENU & ORDER</span>
                  <span className="text-[9px] text-slate-400 mt-1">Open camera app to scan</span>
                </div>
              )}

              {/* Stand Mockup */}
              {selectedTemplate === 'stand' && (
                <div className="w-64 bg-slate-900 text-slate-100 p-5 rounded-2xl border-2 border-amber-400/80 shadow-2xl flex flex-col items-center text-center">
                  <span className="font-bold text-sm tracking-wider text-slate-100">{restaurant.name?.toUpperCase()}</span>
                  <span className="text-[9px] text-amber-400 font-semibold tracking-widest mt-0.5 mb-3">DIGITAL DINE-IN</span>
                  <div className="bg-white p-3 rounded-xl shadow-inner w-full flex flex-col items-center">
                    <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-md mb-2">
                      {sampleTable.label || `Table ${sampleTable.table_number}`}
                    </div>
                    <QRCodeCanvas url={sampleUrl} size={140} logoUrl={restaurant.logo_url} />
                  </div>
                  <span className="text-xs font-bold text-slate-200 mt-3">TOUCHLESS ORDERING</span>
                  <span className="text-[9px] text-slate-400">Point camera at QR code</span>
                </div>
              )}

              {/* Sticker Mockup */}
              {selectedTemplate === 'sticker' && (
                <div className="w-60 bg-white text-slate-900 p-4 rounded-3xl border-4 border-orange-500 shadow-xl flex flex-col items-center text-center">
                  <div className="w-full bg-orange-500 text-white font-bold text-xs py-1.5 rounded-xl mb-2">
                    {restaurant.name?.toUpperCase()}
                  </div>
                  <div className="bg-slate-100 px-3 py-0.5 rounded-full text-xs font-bold text-slate-800 mb-2">
                    {sampleTable.label || `Table ${sampleTable.table_number}`}
                  </div>
                  <QRCodeCanvas url={sampleUrl} size={140} logoUrl={restaurant.logo_url} />
                  <span className="text-xs font-bold text-slate-900 mt-2">SCAN FOR DIGITAL MENU</span>
                </div>
              )}

              {/* Acrylic Mockup */}
              {selectedTemplate === 'acrylic' && (
                <div className="w-64 bg-white text-slate-900 p-6 rounded-xl border border-slate-300 shadow-lg flex flex-col items-center text-center">
                  <div className="w-10 h-0.5 bg-orange-500 mb-2" />
                  <span className="font-bold text-sm text-slate-900 mb-1">{restaurant.name}</span>
                  <span className="text-[10px] text-slate-500 mb-3">{sampleBranch?.name || 'Dine-in'}</span>
                  <QRCodeCanvas url={sampleUrl} size={140} logoUrl={restaurant.logo_url} />
                  <div className="bg-slate-900 text-white text-xs font-bold px-4 py-1 rounded-full mt-3 mb-1">
                    {sampleTable.label || `Table ${sampleTable.table_number}`}
                  </div>
                  <span className="text-xs font-bold text-orange-600">SCAN TO ORDER & PAY</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              isLoading={downloading}
              onClick={handleDownloadPDF}
              className="gap-2 text-slate-200"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Export PDF Printable Sheet
            </Button>

            <Button
              onClick={handleBrowserPrint}
              isLoading={downloading}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold gap-2 shadow-lg shadow-orange-500/20"
            >
              <Printer className="w-4 h-4" /> Direct Print Now
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
