import { useEffect, useState } from "react";

import * as api from "@htmlos-next/api";

interface NoteViewerProps {
  selectedNote: { name: string; isDirectory: boolean };
}

function NoteViewer({ selectedNote }: NoteViewerProps) {
  const [content, setContent] = useState("");

  async function fetchNote(path: string) {
    const content = await api.loadInternalFileAsText(path);
    return content;
  }

  async function saveNote(path: string, content: string) {
    await api.saveInternalFile(path, content);
  }

  useEffect(() => {
    async function loadContent() {
      if (selectedNote.name) {
        const noteContent = await fetchNote(selectedNote.name);
        setContent(noteContent ? noteContent : "");
      } else {
        setContent("");
      }
    }
    loadContent();
  }, [selectedNote]);

  if (selectedNote.name === "") {
    return (
      <div className="no-content">
        <h3>No note selected</h3>
        <p>Please select or create a note in the sidebar.</p>
      </div>
    );
  } else {
    return (
      <textarea
        className="note-textarea"
        value={content}
        onChange={(e) => {
          const newContent = e.target.value;
          setContent(newContent);
          saveNote(selectedNote.name, newContent);
        }}
      />
    );
  }
}

export default NoteViewer;
