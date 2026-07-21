"use strict";

"use client";

import React, { useState, useRef } from "react";

interface FileStatus {
  id: string;
  name: string;
  size: number;
  status: "idle" | "uploading" | "success" | "error";
  categoria?: string;
  resumo?: string;
  errorMsg?: string;
}

export default function Home() {
  const [clienteId, setClienteId] = useState("");
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        status: "idle" as const,
        rawFile: file,
      }));
      // @ts-ignore
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId.trim()) {
      alert("Por favor, informe o ID do Cliente.");
      return;
    }
    if (files.length === 0) {
      alert("Por favor, adicione pelo menos um arquivo.");
      return;
    }

    setIsProcessing(true);

    // Processa os arquivos um a um para exibir progresso individual
    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i];
      if (currentFile.status === "success") continue; // Pula os já processados com sucesso

      // Atualiza status para 'uploading'
      setFiles((prev) =>
        prev.map((f) => (f.id === currentFile.id ? { ...f, status: "uploading" } : f))
      );

      const formData = new FormData();
      formData.append("clienteId", clienteId);
      // @ts-ignore
      formData.append("file", currentFile.rawFile);

      try {
        const response = await fetch("/api/processar", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === currentFile.id
                ? {
                    ...f,
                    status: "success",
                    categoria: data.categoria,
                    resumo: data.resumo,
                    name: data.nomeArquivo, // Atualiza nome caso tenha sido renomeado
                  }
                : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === currentFile.id
                ? {
                    ...f,
                    status: "error",
                    errorMsg: data.error || "Falha no processamento.",
                  }
                : f
            )
          );
        }
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === currentFile.id
              ? {
                  ...f,
                  status: "error",
                  errorMsg: "Erro de conexão com o servidor.",
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case "Contratos":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Financeiro":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Documentos Pessoais":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Comprovantes":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <main className="container mx-auto min-h-screen px-4 py-12 flex flex-col items-center justify-center max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Agente Organizador de Documentos
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
          Classificação automatizada de documentos e geração de resumos usando inteligência artificial com Gemini 2.5 Flash.
        </p>
      </div>

      {/* Main card */}
      <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <form onSubmit={handleUpload} className="space-y-6">
          {/* Cliente ID */}
          <div className="space-y-2">
            <label htmlFor="clienteId" className="block text-sm font-semibold text-slate-200">
              Identificação do Cliente
            </label>
            <input
              id="clienteId"
              type="text"
              required
              disabled={isProcessing}
              placeholder="Ex: cliente-01"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all text-slate-100 placeholder:text-slate-600"
            />
          </div>

          {/* Upload Input Area */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200">
              Documentos
            </label>
            <div
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3
                ${
                  isProcessing
                    ? "border-slate-800 bg-slate-950/20 cursor-not-allowed opacity-55"
                    : "border-slate-800 hover:border-violet-500/60 bg-slate-950/50 hover:bg-slate-950/80"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                disabled={isProcessing}
                accept=".pdf,image/png,image/jpeg,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-violet-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Clique para selecionar os arquivos
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Suporta múltiplos PDFs, Imagens (PNG, JPG) e TXT
                </p>
              </div>
            </div>
          </div>

          {/* Files List to Process */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Fila de Arquivos ({files.length})
              </h3>
              <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-slate-900/30"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200 truncate block">
                          {file.name}
                        </span>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          ({formatSize(file.size)})
                        </span>
                      </div>

                      {/* Display results if processed */}
                      {file.status === "success" && (
                        <div className="mt-2 text-xs flex flex-wrap gap-2 items-center">
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getCategoryColor(
                              file.categoria
                            )}`}
                          >
                            {file.categoria}
                          </span>
                          <span className="text-slate-400 italic">
                            &ldquo;{file.resumo}&rdquo;
                          </span>
                        </div>
                      )}

                      {file.status === "error" && (
                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {file.errorMsg}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      {/* State indicator */}
                      {file.status === "uploading" && (
                        <span className="flex items-center gap-1.5 text-xs text-violet-400">
                          <svg
                            className="animate-spin h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processando...
                        </span>
                      )}

                      {file.status === "success" && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Pronto
                        </span>
                      )}

                      {file.status === "idle" && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleRemoveFile(file.id)}
                          className="p-1 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isProcessing || files.length === 0}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Organizando Documentos...
              </>
            ) : (
              "Iniciar Organização"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
