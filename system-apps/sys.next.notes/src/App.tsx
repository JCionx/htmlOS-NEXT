import { useState, useEffect, useLayoutEffect } from "react";
import "./App.css";
import { TextCursor, Trash, FilePlus, Copy, File } from "lucide-react";
import NoteViewer from "./Components/NoteViewer";
import * as api from "@htmlos-next/api";
import {
  AppShell,
  Sidebar,
  SidebarTitle,
  SidebarItem,
  SidebarButton,
  Popup,
  PopupTitle,
  PopupDescription,
  PopupActions,
  PopupButton,
  PopupInput,
  Toolbar,
  ToolbarTitle,
  ToolbarActions,
  ToolbarButton,
  ToolbarExpandSidebarButton,
  Content,
  ContextMenu,
  EmptyView,
} from "@htmlos-next/ui";
import i18n from "./i18n";
import { useTranslation } from "react-i18next";

function App() {
  const [isMobile, setIsMobile] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [inputValue, setInputValue] = useState("");

  const [newNotePopupOpen, setNewNotePopupOpen] = useState(false);
  const [renameNotePopupOpen, setRenameNotePopupOpen] = useState(false);
  const [deleteNotePopupOpen, setDeleteNotePopupOpen] = useState(false);

  const [noteContextMenuOpen, setNoteContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<{
    name: string;
    isDirectory: boolean;
  }>({ name: "", isDirectory: false });

  useEffect(() => {
    const handleGlobalClick = () => {
      if (noteContextMenuOpen) {
        setNoteContextMenuOpen(false);
      }
    };

    window.addEventListener("click", handleGlobalClick);

    return () => window.removeEventListener("click", handleGlobalClick);
  }, [noteContextMenuOpen]);

  async function saveNote(path: string, content: string) {
    await api.saveInternalFile(path, content);
  }

  async function fetchNotes() {
    const notes = await api.listInternalDirectory("");
    if (notes) {
      const filteredNotes = notes.filter(
        (note: any) => !note.isDirectory && note.name.endsWith(".txt"),
      );
      return filteredNotes;
    } else {
      return [];
    }
  }

  const closePopups = () => {
    setNewNotePopupOpen(false);
    setRenameNotePopupOpen(false);
    setDeleteNotePopupOpen(false);
    setInputValue("");
  };

  const createNewNote = (title: string) => {
    if (!title.trim()) return;
    const noteName = title.endsWith(".txt") ? title : `${title}.txt`;
    saveNote(noteName, "").then(() => {
      fetchNotes().then((fetchedNotes) => {
        setNotes(fetchedNotes);
        setSelectedNote({ name: noteName, isDirectory: false });
      });
    });
    closePopups();
  };

  useLayoutEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get("theme") === "dark" ? "dark" : "light";
    const deviceType =
      urlParams.get("mobile") === "true" ? "mobile" : "desktop";
    const language = urlParams.get("lang") || "en";
    i18n.changeLanguage(language);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("device-type", deviceType);
    setIsMobile(deviceType === "mobile");
  }, []);

  const { t } = useTranslation();

  useEffect(() => {
    fetchNotes().then((fetchedNotes) => {
      setNotes(fetchedNotes);
    });
  }, []);

  async function selectNote(noteName: string) {
    setSelectedNote({ name: noteName, isDirectory: false });
    if (isMobile) {
      setSidebarOpen(false);
    }
  }

  const renameCurrentNote = (newTitle: string) => {
    if (!newTitle.trim()) return;
    const newNoteName = newTitle.endsWith(".txt")
      ? newTitle
      : `${newTitle}.txt`;
    api.moveInternalFile(selectedNote.name, newNoteName).then(() => {
      fetchNotes().then((fetchedNotes) => {
        setNotes(fetchedNotes);
        setSelectedNote({ name: newNoteName, isDirectory: false });
      });
    });
    closePopups();
  };

  const deleteCurrentNote = () => {
    setDeleteNotePopupOpen(false);
    api.deleteInternalFile(selectedNote.name).then(() => {
      fetchNotes().then((fetchedNotes) => {
        setNotes(fetchedNotes);
        setSelectedNote({ name: "", isDirectory: false });
        if (isMobile) {
          setSidebarOpen(true);
        }
      });
    });
  };

  return (
    <AppShell
      isMobile={isMobile}
      sidebarOpen={sidebarOpen}
      accentColor="#fbcd14"
      sidebar={
        <Sidebar
          open={sidebarOpen}
          footer={
            <SidebarButton onClick={() => setNewNotePopupOpen(true)}>
              <FilePlus size={isMobile ? 24 : 18} className="mr-2" />
              {t("sidebar.button")}
            </SidebarButton>
          }
        >
          <SidebarTitle>{t("sidebar.title")}</SidebarTitle>
          {notes.map((note, index) => (
            <SidebarItem
              key={index}
              selected={selectedNote.name === note.name}
              onClick={() => selectNote(note.name)}
              onContextMenu={(e) => {
                let x: number, y: number;

                if ("clientX" in e) {
                  x = e.clientX;
                  y = e.clientY;
                } else {
                  x = e.touches[0].clientX;
                  y = e.touches[0].clientY;
                }

                e.stopPropagation();
                setSelectedNote({ name: note.name, isDirectory: false });
                setNoteContextMenuOpen(true);
                setContextMenuPosition({ x, y });
              }}
            >
              <div>{note.name.replace(/\.txt$/i, "")}</div>
            </SidebarItem>
          ))}
        </Sidebar>
      }
    >
      <Content expanded={!sidebarOpen}>
        {selectedNote.name ? (
          <NoteViewer selectedNote={selectedNote} />
        ) : (
          <EmptyView icon={File} label={t("empty.title")} />
        )}
      </Content>

      <Popup open={newNotePopupOpen}>
        <PopupTitle>{t("popup.new.title")}</PopupTitle>
        <PopupDescription>{t("popup.new.description")}</PopupDescription>
        <PopupInput
          autoFocus
          placeholder={t("popup.new.placeholder")}
          value={inputValue}
          onChange={setInputValue}
          onSubmit={createNewNote}
        ></PopupInput>
        <PopupActions orientation="horizontal">
          <PopupButton type="secondary" onClick={closePopups}>
            {t("popup.cancel")}
          </PopupButton>
          <PopupButton onClick={() => createNewNote(inputValue)}>
            {t("popup.new.submit")}
          </PopupButton>
        </PopupActions>
      </Popup>

      <Popup open={renameNotePopupOpen}>
        <PopupTitle>{t("popup.rename.title")}</PopupTitle>
        <PopupDescription>{t("popup.rename.description")}</PopupDescription>
        <PopupInput
          autoFocus
          placeholder={selectedNote.name.replace(/\.txt$/i, "")}
          value={inputValue}
          onChange={setInputValue}
          onSubmit={renameCurrentNote}
        ></PopupInput>
        <PopupActions orientation="horizontal">
          <PopupButton type="secondary" onClick={closePopups}>
            {t("popup.cancel")}
          </PopupButton>
          <PopupButton onClick={() => renameCurrentNote(inputValue)}>
            {t("popup.rename.submit")}
          </PopupButton>
        </PopupActions>
      </Popup>

      <Popup open={deleteNotePopupOpen}>
        <PopupTitle>{t("popup.delete.title")}</PopupTitle>
        <PopupDescription>{t("popup.delete.description")}</PopupDescription>
        <PopupActions orientation="horizontal">
          <PopupButton type="secondary" onClick={closePopups}>
            {t("popup.cancel")}
          </PopupButton>
          <PopupButton onClick={() => deleteCurrentNote()}>
            {t("popup.delete.submit")}
          </PopupButton>
        </PopupActions>
      </Popup>

      <Toolbar expanded={!sidebarOpen}>
        <ToolbarExpandSidebarButton
          onToggleSidebar={() => {
            setSidebarOpen(!sidebarOpen);
          }}
          expanded={!sidebarOpen}
        />
        <ToolbarTitle>{selectedNote.name.replace(/\.txt$/i, "")}</ToolbarTitle>
        <ToolbarActions>
          {selectedNote.name && (
            <>
              <ToolbarButton onClick={() => setRenameNotePopupOpen(true)}>
                <TextCursor size={isMobile ? 24 : 18} />
              </ToolbarButton>
              <ToolbarButton onClick={() => setDeleteNotePopupOpen(true)}>
                <Trash size={isMobile ? 24 : 18} />
              </ToolbarButton>
            </>
          )}
        </ToolbarActions>
      </Toolbar>
      <ContextMenu
        open={noteContextMenuOpen}
        x={contextMenuPosition.x}
        y={contextMenuPosition.y}
      >
        <SidebarItem
          onClick={async () => {
            setNoteContextMenuOpen(false);
            const newNoteName = `${selectedNote.name.replace(/\.txt$/i, "")} - Copy.txt`;
            const content = await api.loadInternalFileAsText(selectedNote.name);
            saveNote(newNoteName, content ? content : "").then(() => {
              fetchNotes().then((fetchedNotes) => {
                setNotes(fetchedNotes);
                setSelectedNote({ name: newNoteName, isDirectory: false });
              });
            });
          }}
        >
          <Copy size={isMobile ? 24 : 18} />
          <span>{t("context.duplicate")}</span>
        </SidebarItem>
        <SidebarItem
          onClick={() => {
            setRenameNotePopupOpen(true);
          }}
        >
          <TextCursor size={isMobile ? 24 : 18} />
          <span>{t("context.rename")}</span>
        </SidebarItem>
        <SidebarItem
          onClick={() => {
            setDeleteNotePopupOpen(true);
          }}
        >
          <Trash size={isMobile ? 24 : 18} />
          <span>{t("context.delete")}</span>
        </SidebarItem>
      </ContextMenu>
    </AppShell>
  );
}

export default App;
