"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BookDemoModal } from "@/components/modals/book-demo-modal";
import { AuditModal } from "@/components/modals/audit-modal";

interface ModalContextType {
  openDemoModal: () => void;
  openAuditModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  const openDemoModal = () => setDemoModalOpen(true);
  const openAuditModal = () => setAuditModalOpen(true);

  return (
    <ModalContext.Provider value={{ openDemoModal, openAuditModal }}>
      {children}
      <BookDemoModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
      <AuditModal open={auditModalOpen} onOpenChange={setAuditModalOpen} />
    </ModalContext.Provider>
  );
}

