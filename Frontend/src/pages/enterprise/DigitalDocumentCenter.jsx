import React, { useState, useEffect } from 'react';
import { FileCheck, Shield, Clock, CheckCircle2, FileText, Lock, Key, Eye } from 'lucide-react';
import { fetchMemberDocuments, signDocument } from '../../services/enterpriseApi';

export default function DigitalDocumentCenter() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [signing, setSigning] = useState(false);

  const loadDocs = () => {
    fetchMemberDocuments(1).then((data) => {
      setDocuments(data || []);
      if (data && data.length > 0) setSelectedDoc(data[0]);
    });
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleSign = async () => {
    if (!selectedDoc) return;
    setSigning(true);
    try {
      const updated = await signDocument(selectedDoc.id, 'John Kamau (Member)');
      setSelectedDoc(updated);
      loadDocs();
    } catch (err) {
      console.error(err);
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-semibold mb-1 text-sm uppercase">
            <FileCheck className="w-4 h-4" /> Cryptographic Vault & Workflow
          </div>
          <h1 className="text-3xl font-extrabold">Digital Document Workflow Hub</h1>
          <p className="text-teal-100 text-sm mt-1">
            Complete document lifecycle management with versioning, audit trail, and digital signatures.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" /> Member Documents
          </h2>

          <div className="space-y-3">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full text-left p-4 rounded-xl border transition duration-150 ${
                  selectedDoc?.id === doc.id
                    ? 'border-teal-600 bg-teal-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                    {doc.version}
                  </span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {doc.approvalStatus}
                  </span>
                </div>
                <p className="font-bold text-slate-900 mt-2 text-sm">{doc.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Document Details & Version/Signature Inspection */}
        {selectedDoc && (
          <div className="lg:col-span-2 space-y-6">
            {/* Metadata Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{selectedDoc.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Category: {selectedDoc.category}</p>
                </div>
                <button
                  onClick={handleSign}
                  disabled={signing || selectedDoc.digitalSignature?.verified}
                  className={`px-4 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2 ${
                    selectedDoc.digitalSignature?.verified
                      ? 'bg-emerald-600 cursor-default'
                      : 'bg-teal-600 hover:bg-teal-700 shadow-lg'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  {selectedDoc.digitalSignature?.verified ? 'Digitally Signed & Sealed' : 'Sign Digitally Now'}
                </button>
              </div>

              {/* Digital Signature Audit Box */}
              {selectedDoc.digitalSignature && (
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-teal-400 font-bold uppercase flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> SHA-256 Digital Signature Audit
                    </span>
                    <span className="text-emerald-400 font-bold">VERIFIED HASH</span>
                  </div>
                  <p className="text-slate-300">Signed By: {selectedDoc.digitalSignature.signedBy}</p>
                  <p className="text-slate-300">Timestamp: {new Date(selectedDoc.digitalSignature.timestamp).toLocaleString()}</p>
                  <p className="text-slate-400 break-all">Hash: {selectedDoc.digitalSignature.signatureHash}</p>
                </div>
              )}

              {/* Version History */}
              <div className="space-y-3">
                <h4 className="text-md font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" /> Version History Log
                </h4>
                <div className="space-y-2">
                  {selectedDoc.versions?.map((v, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-extrabold text-teal-700 mr-2">{v.version}</span>
                        <span className="text-slate-700 font-medium">{v.note}</span>
                      </div>
                      <span className="text-slate-400">{v.updatedAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
