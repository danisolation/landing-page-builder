"use client";

import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";
import type { Section, SectionType, SectionContent } from "@/types";
import { defaultContent } from "@/components/sections/section-constants";

// Editor state
interface EditorState {
  sections: Section[];
  selectedSectionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  // History for undo/redo
  past: Section[][];
  future: Section[][];
}

type EditorAction =
  | { type: "SET_SECTIONS"; payload: Section[] }
  | { type: "SELECT_SECTION"; payload: string | null }
  | { type: "ADD_SECTION"; payload: { type: SectionType; index: number } }
  | { type: "UPDATE_SECTION"; payload: { id: string; content: SectionContent } }
  | { type: "DELETE_SECTION"; payload: string }
  | { type: "REORDER_SECTIONS"; payload: { fromIndex: number; toIndex: number } }
  | { type: "DUPLICATE_SECTION"; payload: string }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "MARK_DIRTY" }
  | { type: "MARK_CLEAN" }
  | { type: "SET_SAVING"; payload: boolean };

const initialState: EditorState = {
  sections: [],
  selectedSectionId: null,
  isDirty: false,
  isSaving: false,
  past: [],
  future: [],
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_SECTIONS":
      return { ...state, sections: action.payload, isDirty: false, past: [], future: [] };

    case "SELECT_SECTION":
      return { ...state, selectedSectionId: action.payload };

    case "ADD_SECTION": {
      const { type, index } = action.payload;
      const newSection: Section = {
        id: `temp-${Date.now()}`,
        type,
        content: defaultContent[type],
        order: index,
        pageId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const newSections = [...state.sections];
      newSections.splice(index, 0, newSection);
      // Reorder
      newSections.forEach((s, i) => (s.order = i));
      return {
        ...state,
        sections: newSections,
        selectedSectionId: newSection.id,
        isDirty: true,
        past: [...state.past, state.sections],
        future: [],
      };
    }

    case "UPDATE_SECTION": {
      const { id, content } = action.payload;
      const newSections = state.sections.map((s) =>
        s.id === id ? { ...s, content, updatedAt: new Date().toISOString() } : s
      );
      return {
        ...state,
        sections: newSections,
        isDirty: true,
        past: [...state.past, state.sections],
        future: [],
      };
    }

    case "DELETE_SECTION": {
      const newSections = state.sections
        .filter((s) => s.id !== action.payload)
        .map((s, i) => ({ ...s, order: i }));
      return {
        ...state,
        sections: newSections,
        selectedSectionId: state.selectedSectionId === action.payload ? null : state.selectedSectionId,
        isDirty: true,
        past: [...state.past, state.sections],
        future: [],
      };
    }

    case "REORDER_SECTIONS": {
      const { fromIndex, toIndex } = action.payload;
      const newSections = [...state.sections];
      const [moved] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, moved);
      newSections.forEach((s, i) => (s.order = i));
      return {
        ...state,
        sections: newSections,
        isDirty: true,
        past: [...state.past, state.sections],
        future: [],
      };
    }

    case "DUPLICATE_SECTION": {
      const section = state.sections.find((s) => s.id === action.payload);
      if (!section) return state;
      const index = state.sections.indexOf(section);
      const duplicated: Section = {
        ...section,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const newSections = [...state.sections];
      newSections.splice(index + 1, 0, duplicated);
      newSections.forEach((s, i) => (s.order = i));
      return {
        ...state,
        sections: newSections,
        isDirty: true,
        past: [...state.past, state.sections],
        future: [],
      };
    }

    case "UNDO": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        ...state,
        sections: previous,
        past: newPast,
        future: [state.sections, ...state.future],
        isDirty: true,
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        ...state,
        sections: next,
        past: [...state.past, state.sections],
        future: newFuture,
        isDirty: true,
      };
    }

    case "MARK_DIRTY":
      return { ...state, isDirty: true };

    case "MARK_CLEAN":
      return { ...state, isDirty: false, past: [], future: [] };

    case "SET_SAVING":
      return { ...state, isSaving: action.payload };

    default:
      return state;
  }
}

// Context
interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  // Actions
  setSections: (sections: Section[]) => void;
  selectSection: (id: string | null) => void;
  addSection: (type: SectionType, index: number) => void;
  updateSection: (id: string, content: SectionContent) => void;
  deleteSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  duplicateSection: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const setSections = useCallback((sections: Section[]) => {
    dispatch({ type: "SET_SECTIONS", payload: sections });
  }, []);

  const selectSection = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_SECTION", payload: id });
  }, []);

  const addSection = useCallback((type: SectionType, index: number) => {
    dispatch({ type: "ADD_SECTION", payload: { type, index } });
  }, []);

  const updateSection = useCallback((id: string, content: SectionContent) => {
    dispatch({ type: "UPDATE_SECTION", payload: { id, content } });
  }, []);

  const deleteSection = useCallback((id: string) => {
    dispatch({ type: "DELETE_SECTION", payload: id });
  }, []);

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: "REORDER_SECTIONS", payload: { fromIndex, toIndex } });
  }, []);

  const duplicateSection = useCallback((id: string) => {
    dispatch({ type: "DUPLICATE_SECTION", payload: id });
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
        setSections,
        selectSection,
        addSection,
        updateSection,
        deleteSection,
        reorderSections,
        duplicateSection,
        undo,
        redo,
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorState() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorState must be used within EditorProvider");
  }
  return context;
}
