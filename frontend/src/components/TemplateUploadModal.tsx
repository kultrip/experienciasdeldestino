import { useState } from 'react';
import { X, Upload, Loader2, Download } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';
import { createExperience } from '../services/experienceService';

interface TemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_LOCAL_BACKEND = 'http://localhost:8001';
const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_URL = isLocalhost ? DEFAULT_LOCAL_BACKEND : (RAW_BACKEND_URL || '')

const TEMPLATE_HEADERS = [
  'Título de la experiencia',
  'Descripción corta',
  'Descripción completa',
  'Provincia',
  'Ciudad',
  'Categoría',
  'Precio por persona',
  'Duración',
  'Tamaño grupo (min - max)',
  'Qué incluye',
  'Requisitos',
  'Política de cancelación',
  'URL de fotos'
];

const TemplateUploadModal = ({ isOpen, onClose, onSuccess }: TemplateUploadModalProps) => {
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState<any>(null);

  const downloadTemplate = () => {
    const sampleRow = [
      'Ruta gastronómica por Santiago',
      'Descubre los sabores locales',
      'Descripción completa de la experiencia...',
      'A Coruña',
      'Santiago de Compostela',
      'Gastronomía',
      '45',
      '4 horas',
      '2-12',
      'Guía experto, Degustación, Seguro',
      'Calzado cómodo',
      'Cancelación 48h',
      'https://.../foto1.jpg, https://.../foto2.jpg'
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, sampleRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Experiencia');
    XLSX.writeFile(workbook, 'experiencia-template.xlsx');
  };

  const handleParse = async () => {
    if (!file) {
      setError('Selecciona un archivo .xlsx o .docx');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${BACKEND_URL}/api/parse-experience-template`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setParsed(response.data.data);
    } catch (err: any) {
      console.error('Error parsing template:', err);
      setError('No se pudo procesar el template. Revisa el formato.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!parsed) return;
    setLoading(true);
    setError('');
    try {
      await createExperience({
        title: parsed.title || '',
        description: parsed.description || '',
        long_description: parsed.long_description || '',
        province: parsed.province || '',
        city: parsed.city || '',
        category: parsed.category || '',
        price_numeric: parsed.price_numeric || parsed.price_per_person || 0,
        price_per_person: parsed.price_per_person || parsed.price_numeric || 0,
        min_group_size: parsed.min_group_size || 1,
        max_group_size: parsed.max_group_size || undefined,
        duration: parsed.duration || '',
        included: parsed.included || [],
        requirements: parsed.requirements || '',
        cancellation_policy: parsed.cancellation_policy || '',
        main_image: parsed.main_image || (parsed.images?.[0] || ''),
        images: parsed.images || [],
        status: 'published',
        created_by: profile?.id
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating experience:', err);
      setError('No se pudo crear la experiencia.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Subir Template de Experiencia</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-3">
              Descarga la plantilla, complétala y súbela para crear la experiencia automáticamente.
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Download size={16} />
              Descargar plantilla
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subir archivo (.xlsx o .docx)</label>
            <div className="border border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept=".xlsx,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-700"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {parsed && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Previsualización</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div><strong>Título:</strong> {parsed.title || '-'}</div>
                <div><strong>Provincia:</strong> {parsed.province || '-'}</div>
                <div><strong>Precio:</strong> {parsed.price_per_person || '-'}</div>
                <div><strong>Categoría:</strong> {parsed.category || '-'}</div>
                <div><strong>Duración:</strong> {parsed.duration || '-'}</div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={handleParse}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            Analizar template
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading || !parsed}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-60"
          >
            Crear experiencia
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateUploadModal;
