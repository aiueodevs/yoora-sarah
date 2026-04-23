"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  FileText,
  Loader2,
  Package,
  Send,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

import {
  getPortalCopilotApprovalSummariesAction,
  getPortalCopilotBriefCopilotAction,
  getPortalCopilotBriefSummariesAction,
  getPortalCopilotContentDraftAction,
  getPortalCopilotForecastSummariesAction,
  getPortalCopilotKnowledgeAction,
  getPortalCopilotLaunchReadinessInsightAction,
  getPortalCopilotMerchandisingInsightAction,
  getPortalCopilotOnboardingAction,
  getPortalCopilotPerformanceInsightAction,
  getPortalCopilotProductionPlanSummariesAction,
  getPortalCopilotWorkflowStatusAction,
  recordPortalCopilotEventAction,
} from "@/app/actions/portal-copilot";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function PortalCopilot() {
  const pathname = usePathname();
  const isLoginPage = pathname.startsWith("/login");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Halo. Saya asisten portal Yoora Sarah.\n\nSaya bisa membantu dengan:\n- Ringkasan brief, persetujuan, forecast, dan rencana produksi\n- SOP, kebijakan, onboarding, dan kejelasan tugas\n- Kesiapan rilis, performa, dan insight merchandising\n- Draft konten dari brief terbaru\n\nApa yang ingin Anda ketahui?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<{
    briefs_count: number;
    approvals_count: number;
    forecasts_count: number;
    plans_count: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    if (!isOpen) {
      return;
    }

    void recordPortalCopilotEventAction("portal_copilot_open");

    if (workflowStatus) {
      return;
    }

    getPortalCopilotWorkflowStatusAction().then((status) => {
      if (!status) {
        return;
      }

      setWorkflowStatus({
        briefs_count: status.briefs_count,
        approvals_count: status.approvals_count,
        forecasts_count: status.forecasts_count,
        plans_count: status.plans_count,
      });
    });
  }, [isLoginPage, isOpen, workflowStatus]);

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isLoginPage, messages]);

  if (isLoginPage) {
    return null;
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await recordPortalCopilotEventAction("portal_copilot_query_submitted", {
        queryLength: userMessage.content.length,
      });

      const response = await processQuery(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Mohon maaf, ada sedikit gangguan. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const processQuery = async (query: string): Promise<string> => {
    const queryLower = query.toLowerCase();

    if (queryLower.includes("brief")) {
      if (
        queryLower.includes("copilot") ||
        queryLower.includes("draft") ||
        queryLower.includes("arah")
      ) {
        const note = await getPortalCopilotBriefCopilotAction();
        if (note) {
          return [
            `Copilot brief untuk ${note.title}:`,
            "",
            note.summary,
            "",
            `Arah konsep: ${note.concept_direction}`,
            `Risiko review: ${note.review_risk}`,
            `Langkah berikutnya: ${note.next_action}`,
          ].join("\n");
        }
      }

      const summaries = await getPortalCopilotBriefSummariesAction();
      if (summaries.length > 0) {
        const list = summaries
          .slice(0, 5)
          .map((brief) => `- ${brief.title} - ${brief.status}`)
          .join("\n");
        return `Brief terbaru:\n\n${list}\n\nTotal: ${summaries.length} brief`;
      }
      return "Tidak ada brief yang ditemukan.";
    }

    if (
      queryLower.includes("sop") ||
      queryLower.includes("policy") ||
      queryLower.includes("kebijakan") ||
      queryLower.includes("knowledge")
    ) {
      const articles = await getPortalCopilotKnowledgeAction(query);
      if (articles.length > 0) {
        return [
          "Asisten pengetahuan:",
          "",
          ...articles.slice(0, 3).map(
            (article) =>
              `- ${article.title}: ${article.summary} Langkah berikutnya: ${article.next_action}`,
          ),
        ].join("\n");
      }
      return "Knowledge article belum tersedia.";
    }

    if (
      queryLower.includes("onboarding") ||
      queryLower.includes("sdm") ||
      queryLower.includes("task clarity")
    ) {
      const items = await getPortalCopilotOnboardingAction();
      if (items.length > 0) {
        return [
          "Onboarding dan kejelasan tugas:",
          "",
          ...items.slice(0, 2).map(
            (item) => `- ${item.title}: ${item.summary} Langkah berikutnya: ${item.next_action}`,
          ),
        ].join("\n");
      }
      return "Panduan onboarding belum tersedia.";
    }

    if (queryLower.includes("approval") || queryLower.includes("approve")) {
      const summaries = await getPortalCopilotApprovalSummariesAction();
      if (summaries.length > 0) {
        const list = summaries
          .slice(0, 5)
          .map((approval) => `- ${approval.artifact_type}: ${approval.status}`)
          .join("\n");
        return `Persetujuan terbaru:\n\n${list}\n\nTotal: ${summaries.length} item`;
      }
      return "Tidak ada approval yang ditemukan.";
    }

    if (
      queryLower.includes("content") ||
      queryLower.includes("caption") ||
      queryLower.includes("campaign")
    ) {
      const draft = await getPortalCopilotContentDraftAction();
      if (draft) {
        return [
          draft.title,
          "",
          `Hook: ${draft.hook}`,
          `Caption: ${draft.caption}`,
          `CTA: ${draft.call_to_action}`,
          `Source: ${draft.source_context}`,
        ].join("\n");
      }
      return "Draf konten belum tersedia.";
    }

    if (queryLower.includes("forecast") || queryLower.includes("planning")) {
      const summaries = await getPortalCopilotForecastSummariesAction();
      if (summaries.length > 0) {
        const list = summaries
          .slice(0, 5)
          .map((forecast) => `- ${forecast.run_id} - ${forecast.status}`)
          .join("\n");
        return `Forecast terbaru:\n\n${list}\n\nTotal: ${summaries.length} run`;
      }
      return "Tidak ada forecast yang ditemukan.";
    }

    if (queryLower.includes("production") || queryLower.includes("plan")) {
      const summaries = await getPortalCopilotProductionPlanSummariesAction();
      if (summaries.length > 0) {
        const list = summaries
          .slice(0, 5)
          .map((plan) => `- ${plan.plan_number} - ${plan.status}`)
          .join("\n");
        return `Rencana produksi terbaru:\n\n${list}\n\nTotal: ${summaries.length} rencana`;
      }
      return "Tidak ada production plan yang ditemukan.";
    }

    if (
      queryLower.includes("launch") ||
      queryLower.includes("readiness")
    ) {
      const insight = await getPortalCopilotLaunchReadinessInsightAction();
      if (insight) {
        return [
          `${insight.title}:`,
          "",
          insight.summary,
          "",
          ...insight.risks.map((risk) => `- Risiko: ${risk}`),
          ...insight.next_actions.map((item) => `- Langkah: ${item}`),
        ].join("\n");
      }
    }

    if (queryLower.includes("performance")) {
      const insight = await getPortalCopilotPerformanceInsightAction();
      if (insight) {
        return [
          `${insight.title}:`,
          "",
          insight.summary,
          "",
          ...insight.risks.map((risk) => `- Risiko: ${risk}`),
          ...insight.next_actions.map((item) => `- Langkah: ${item}`),
        ].join("\n");
      }
    }

    if (
      queryLower.includes("merchandising") ||
      queryLower.includes("assortment")
    ) {
      const insight = await getPortalCopilotMerchandisingInsightAction();
      if (insight) {
        return [
          `${insight.title}:`,
          "",
          insight.summary,
          "",
          ...insight.risks.map((risk) => `- Risiko: ${risk}`),
          ...insight.next_actions.map((item) => `- Langkah: ${item}`),
        ].join("\n");
      }
    }

    if (
      queryLower.includes("status") ||
      queryLower.includes("dashboard") ||
      queryLower.includes("overview")
    ) {
      const status = await getPortalCopilotWorkflowStatusAction();
      if (status) {
        return (
          "Status workflow portal:\n\n" +
          `- Brief: ${status.briefs_count}\n` +
          `- Persetujuan: ${status.approvals_count}\n` +
          `- Forecast: ${status.forecasts_count}\n` +
          `- Rencana produksi: ${status.plans_count}`
        );
      }
      return "Tidak dapat mengambil status workflow.";
    }

    if (queryLower.includes("halo") || queryLower.includes("hai")) {
      return "Halo. Ada yang bisa saya bantu terkait workflow portal?";
    }

    return (
      "Saya bisa membantu Anda dengan:\n\n" +
      '- Brief summary: ketik "brief"\n' +
      '- Brief copilot: ketik "brief copilot"\n' +
      '- Persetujuan: ketik "approval"\n' +
      '- Forecast: ketik "forecast"\n' +
      '- Rencana produksi: ketik "plan"\n' +
      '- SOP / kebijakan: ketik "SOP" atau "policy"\n' +
      '- Onboarding: ketik "onboarding"\n' +
      '- Draft konten: ketik "content"\n' +
      '- Kesiapan rilis: ketik "launch"\n' +
      '- Performa: ketik "performance"\n' +
      '- Merchandising: ketik "merchandising"\n' +
      '- Ringkasan status: ketik "status"\n\n' +
      "Apa yang ingin Anda ketahui?"
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-stone-700/10 bg-gradient-to-br from-stone-800 to-stone-950 text-amber-50 shadow-[0_22px_44px_rgba(37,24,20,0.22)] transition hover:scale-105 hover:shadow-[0_28px_56px_rgba(37,24,20,0.28)]"
        aria-label="Buka asisten portal"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-[28px] border border-[rgba(143,116,99,0.16)] bg-[linear-gradient(180deg,rgba(255,253,250,0.98),rgba(245,237,231,0.96))] shadow-[0_32px_80px_rgba(37,24,20,0.22)]">
          <div className="flex items-center justify-between border-b border-[rgba(143,116,99,0.14)] bg-[linear-gradient(90deg,rgba(248,241,235,0.96),rgba(255,251,247,0.92))] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-stone-800 to-stone-950">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-stone-900">Portal Copilot</h3>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
                  Asisten internal
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              aria-label="Tutup asisten"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {workflowStatus && (
            <div className="flex flex-wrap gap-2 border-b border-[rgba(143,116,99,0.14)] bg-[rgba(255,251,247,0.74)] px-4 py-2 text-xs">
              <span className="flex items-center gap-1 text-stone-600">
                <FileText className="h-3 w-3" /> {workflowStatus.briefs_count} Brief
              </span>
              <span className="flex items-center gap-1 text-stone-600">
                <ClipboardCheck className="h-3 w-3" /> {workflowStatus.approvals_count} Persetujuan
              </span>
              <span className="flex items-center gap-1 text-stone-600">
                <TrendingUp className="h-3 w-3" /> {workflowStatus.forecasts_count} Forecast
              </span>
              <span className="flex items-center gap-1 text-stone-600">
                <Package className="h-3 w-3" /> {workflowStatus.plans_count} Rencana
              </span>
            </div>
          )}

          <div className="h-[400px] overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-stone-800 to-stone-950 text-amber-50"
                        : "bg-[rgba(255,251,247,0.82)] text-stone-700"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-[rgba(255,251,247,0.82)] px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                    <span className="text-sm text-stone-500">Memproses...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-[rgba(143,116,99,0.14)] px-4 py-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Tanyakan tentang workflow..."
                className="flex-1 rounded-full border border-[rgba(143,116,99,0.18)] bg-[rgba(255,251,247,0.86)] px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:bg-white focus:outline-none focus:ring-0"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-amber-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Kirim pertanyaan"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
