"use client";

import React, { createContext, useContext, useState } from "react";
import { format } from "date-fns";
import { Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// --- Types ---
export interface ShiftUser {
  id: string;
  fullName: string | null;
  username: string;
}

export interface ShiftCellDetails {
  date: Date;
  shiftType: "SANG" | "CHIEU" | "TOI" | "DEM";
}

interface ShiftAssignmentState {
  isOpen: boolean;
  selectedCell: ShiftCellDetails | null;
  users: ShiftUser[];
  selectedUserId: string;
  searchQuery: string;
  isPending: boolean;
}

interface ShiftAssignmentActions {
  onOpenChange: (open: boolean) => void;
  setSelectedUserId: (id: string) => void;
  setSearchQuery: (query: string) => void;
  submit: () => void;
}

interface ShiftAssignmentContextValue {
  state: ShiftAssignmentState;
  actions: ShiftAssignmentActions;
}

// --- Context ---
const ShiftAssignmentContext =
  createContext<ShiftAssignmentContextValue | null>(null);

export function useShiftAssignment() {
  const context = useContext(ShiftAssignmentContext);
  if (!context) {
    throw new Error(
      "Shift components must be used within a ShiftAssignmentProvider",
    );
  }
  return context;
}

// --- 1. Provider ---
interface ShiftAssignmentProviderProps {
  children: React.ReactNode;
  selectedCell: ShiftCellDetails | null;
  onClose: () => void;
  users: ShiftUser[];
  onAssign: (userId: string) => void;
  isPending: boolean;
}

function ShiftAssignmentProvider({
  children,
  selectedCell,
  onClose,
  users,
  onAssign,
  isPending,
}: ShiftAssignmentProviderProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const state: ShiftAssignmentState = {
    isOpen: !!selectedCell,
    selectedCell,
    users,
    selectedUserId,
    searchQuery,
    isPending,
  };

  const actions: ShiftAssignmentActions = {
    onOpenChange: (open) => {
      if (!open) {
        onClose();
        setSelectedUserId("");
        setSearchQuery("");
      }
    },
    setSelectedUserId,
    setSearchQuery,
    submit: () => {
      if (selectedUserId) {
        onAssign(selectedUserId);
        setSelectedUserId("");
        setSearchQuery("");
      }
    },
  };

  return (
    <ShiftAssignmentContext.Provider value={{ state, actions }}>
      {children}
    </ShiftAssignmentContext.Provider>
  );
}

// --- 2. Root (Frame) ---
function ShiftAssignmentRoot() {
  const { state, actions } = useShiftAssignment();
  return (
    <Dialog open={state.isOpen} onOpenChange={actions.onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <ShiftAssignmentHeader />
        <div className="flex flex-col gap-4 py-4">
          <ShiftAssignmentInfo />
          <ShiftAssignmentUserSelect />
          <ShiftAssignmentFooter />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- 3. Internal Composed Parts ---
const SHIFT_LABELS: Record<string, string> = {
  SANG: "Sáng (5h30-12h)",
  CHIEU: "Chiều (12h-18h)",
  TOI: "Tối (18h-22h)",
  DEM: "Đêm (22h-2.5h)",
};

function ShiftAssignmentHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Phân Ca Làm Việc</DialogTitle>
    </DialogHeader>
  );
}

function ShiftAssignmentInfo() {
  const { state } = useShiftAssignment();

  if (!state.selectedCell) return null;

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      Bạn đang gán ca{" "}
      <strong>{SHIFT_LABELS[state.selectedCell.shiftType]}</strong> vào ngày{" "}
      <strong>{format(state.selectedCell.date, "dd/MM/yyyy")}</strong>
    </div>
  );
}

function ShiftAssignmentUserSelect() {
  const { state, actions } = useShiftAssignment();

  // Derived state: Filter users based on query
  const filteredUsers = state.users.filter((u) => {
    const nameStr = (u.fullName || u.username).toLowerCase();
    return nameStr.includes(state.searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">Lựa chọn nhân viên</label>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Tìm kiếm theo Tên / Username..."
          className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          value={state.searchQuery}
          onChange={(e) => actions.setSearchQuery(e.target.value)}
        />
      </div>

      {/* Select List */}
      <div className="flex flex-col border rounded-md max-h-48 overflow-y-auto dark:border-gray-700">
        {filteredUsers.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-400 italic">
            Không tìm thấy nhân viên
          </div>
        ) : (
          filteredUsers.map((u) => (
            <button
              key={u.id}
              className={`text-left px-3 py-2 text-sm transition-colors border-b last:border-b-0 dark:border-gray-700 ${
                state.selectedUserId === u.id
                  ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-300"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              onClick={() => actions.setSelectedUserId(u.id)}
            >
              {u.fullName || u.username}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function ShiftAssignmentFooter() {
  const { state, actions } = useShiftAssignment();

  return (
    <Button
      className="mt-2 w-full"
      onClick={actions.submit}
      disabled={!state.selectedUserId || state.isPending}
    >
      {state.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Xác nhận
    </Button>
  );
}

// --- Explicit Export ---
export const ShiftAssignmentModal = Object.assign(ShiftAssignmentRoot, {
  Provider: ShiftAssignmentProvider,
});
