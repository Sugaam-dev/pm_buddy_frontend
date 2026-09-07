"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Upload,
  Plus,
  FileText,
  Tag,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { KnowledgeDocument, KnowledgeSearchResult } from "@/types/api";

export function KnowledgeView() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KnowledgeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newDocType, setNewDocType] = useState("architecture");
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await api.getKnowledgeDocuments();
      setDocuments(docs);
    } catch (err: any) {
      console.error("Failed to load knowledge documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const results = await api.searchKnowledge(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      console.error("Semantic search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    try {
      setUploading(true);
      setActionError(null);
      await api.uploadKnowledgeDocument(uploadFile, undefined, newDocType);
      setShowUploadModal(false);
      setUploadFile(null);
      await fetchDocuments();
    } catch (err: any) {
      setActionError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      setUploading(true);
      setActionError(null);
      await api.createKnowledgeDocument({
        title: newTitle.trim(),
        content: newContent.trim(),
        document_type: newDocType,
      });
      setShowCreateModal(false);
      setNewTitle("");
      setNewContent("");
      await fetchDocuments();
    } catch (err: any) {
      setActionError(err.message || "Failed to create document");
    } finally {
      setUploading(false);
    }
  };

  const handleViewDoc = async (id: string) => {
    try {
      const doc = await api.getKnowledgeDocument(id);
      setSelectedDoc(doc);
    } catch (err: any) {
      console.error("Failed to load document details:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Knowledge Base & Operational Memory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Grounded vector search with pgvector (768-d Gemini embeddings) & tenant isolation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActionError(null);
              setShowUploadModal(true);
            }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/60 px-3 py-2 rounded-xl text-xs font-medium transition"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => {
              setActionError(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-medium transition shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Document</span>
          </button>
        </div>
      </div>

      {/* Semantic Vector Search Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search knowledge with pgvector semantic similarity (e.g. 'payment gateway architecture', 'runbook for p0 incident')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-medium transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSearching ? "Searching..." : "Vector Search"}</span>
          </button>
          {searchResults.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              Clear
            </button>
          )}
        </form>

        {/* Semantic Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Semantic Matches ({searchResults.length})
              </p>
              <span className="text-[10px] text-slate-500">Cosine Similarity Ranked</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {searchResults.map((res, i) => (
                <div
                  key={res.chunk_id || i}
                  className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-200">{res.document_title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Score: {(res.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                    {res.content}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 italic">
                    Citation: {res.citation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Documents Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Indexed Documents ({documents.length})
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No knowledge documents ingested yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">Upload a PDF, DOCX, MD, or TXT file to enable grounded RAG.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleViewDoc(doc.id)}
                className="bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{doc.title}</h4>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                      {doc.document_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Tag className="w-3 h-3 text-slate-500" />
                    <span>Source: {doc.source_type}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400/90 font-medium capitalize">{doc.status}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Upload Knowledge Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                {actionError}
              </div>
            )}

            <form onSubmit={handleFileUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Type</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="architecture">Architecture (ADR)</option>
                  <option value="runbook">Runbook / SOP</option>
                  <option value="prd">Product Requirement (PRD)</option>
                  <option value="rfc">RFC / Technical Spec</option>
                  <option value="policy">Governance Policy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select File (PDF, DOCX, TXT, MD)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-50"
                >
                  {uploading ? "Ingesting & Chunking..." : "Upload & Vectorize"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Create Knowledge Document</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Microservices Database Migration Runbook"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Type</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="architecture">Architecture (ADR)</option>
                  <option value="runbook">Runbook / SOP</option>
                  <option value="prd">Product Requirement (PRD)</option>
                  <option value="rfc">RFC / Technical Spec</option>
                  <option value="policy">Governance Policy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Content (Markdown / Text)</label>
                <textarea
                  rows={8}
                  placeholder="Type or paste the document content here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-50"
                >
                  {uploading ? "Embedding Chunks..." : "Save & Embed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Detail Preview */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedDoc.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Type: <span className="font-mono text-slate-300">{selectedDoc.document_type}</span> | Chunks:{" "}
                  <span className="font-mono text-slate-300">{selectedDoc.chunks?.length || 0}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Indexed Chunks & Embeddings
              </h4>
              {selectedDoc.chunks?.map((c: any) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300 space-y-1.5"
                >
                  <div className="text-[10px] text-blue-400 font-semibold">Chunk #{c.chunk_index + 1} ({c.token_count || 0} tokens)</div>
                  <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{c.content}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
