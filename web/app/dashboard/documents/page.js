'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { applicationsAPI, documentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Upload, Trash2, FileText, Eye } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function DocumentsPage() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp]   = useState(null);
  const [documents, setDocuments]       = useState([]);
  const [file, setFile]                 = useState(null);
  const [uploading, setUploading]       = useState(false);

  useEffect(() => {
    applicationsAPI.getMy().then(res => {
      const active = res.data.data.filter(a => ['PENDING','PROCESSING','PRINTING','READY'].includes(a.status));
      setApplications(active);
    });
  }, []);

  const loadDocs = async (app) => {
    setSelectedApp(app);
    const res = await documentsAPI.getByApplication(app.id);
    setDocuments(res.data.data);
  };

  const handleUpload = async () => {
    if (!file || !selectedApp) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await documentsAPI.upload(selectedApp.id, fd);
      toast.success('Document uploaded');
      setFile(null);
      loadDocs(selectedApp);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return;
    await documentsAPI.delete(docId);
    toast.success('Deleted');
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={t('docs.title')}
        subtitle={t('docs.subtitle')}
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Application selector */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-3">
            {t('docs.active.apps')}
          </p>
          {applications.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-[#94a3b8] text-sm">{t('docs.no.active')}</p>
            </Card>
          ) : applications.map(app => (
            <button key={app.id} onClick={() => loadDocs(app)}
              className={`
                w-full text-left p-4 rounded-2xl border-2 transition-all duration-200
                ${selectedApp?.id === app.id
                  ? 'border-[#f59e0b] bg-amber-50'
                  : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'}
              `}>
              <p className="font-semibold text-sm text-[#0f172a]">{app.type.replace(/_/g, ' ')}</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">{app.agency?.name} · {t(`status.${app.status}`)}</p>
            </button>
          ))}
        </div>

        {/* Upload + list */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedApp ? (
            <Card className="flex flex-col items-center justify-center py-20 text-center">
              <FileText size={36} className="text-[#cbd5e1] mb-3"/>
              <p className="font-medium text-[#64748b]">{t('docs.select')}</p>
              <p className="text-sm text-[#94a3b8] mt-1">{t('docs.select.sub')}</p>
            </Card>
          ) : (
            <>
              {/* Upload card */}
              <Card>
                <h3 className="font-bold text-[#0f172a] mb-4 text-sm">{t('docs.upload')}</h3>

                <label className={`
                  flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all
                  ${file ? 'border-[#f59e0b] bg-amber-50' : 'border-[#e2e8f0] hover:border-[#f59e0b] hover:bg-amber-50/50'}
                `}>
                  <Upload size={24} className={file ? 'text-[#f59e0b]' : 'text-[#94a3b8]'} />
                  <p className="text-sm font-semibold text-[#0f172a] mt-2">
                    {file ? file.name : t('docs.click')}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-1">{t('docs.types')}</p>
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => setFile(e.target.files[0])}
                    className="hidden"/>
                </label>

                {file && (
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-[#64748b] truncate">{file.name}</p>
                    <Button variant="gold" size="sm" loading={uploading} onClick={handleUpload}>
                      <Upload size={14}/> {uploading ? t('docs.uploading') : t('docs.upload')}
                    </Button>
                  </div>
                )}
              </Card>

              {/* Document list */}
              <Card>
                <h3 className="font-bold text-[#0f172a] mb-4 text-sm">
                  {t('docs.uploaded')}
                  <span className="ml-2 text-xs font-normal text-[#94a3b8]">({documents.length})</span>
                </h3>

                {documents.length === 0 ? (
                  <p className="text-center text-sm text-[#94a3b8] py-8">{t('docs.none')}</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <div key={doc.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-[#f1f5f9] hover:border-[#e2e8f0] transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-[#64748b]"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0f172a] truncate">{doc.fileName}</p>
                          <p className="text-xs text-[#94a3b8]">
                            {doc.fileType} · {new Date(doc.uploadedAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a href={`http://localhost:3000${doc.fileUrl}`} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="sm"><Eye size={14}/></Button>
                          </a>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                            <Trash2 size={14} className="text-[#ef4444]"/>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}