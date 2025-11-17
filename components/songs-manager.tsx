"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Music, Upload, Play, Pause, Search, Filter, Download, ExternalLink, ImageIcon, Info } from "lucide-react";
import Link from "next/link";

interface Song {
  id: string;
  title: string;
  file_url: string;
  duration: number | null;
  file_size: number | null;
  cover_image_url: string | null;
  artist: string | null;
  album: string | null;
  genre: string | null;
  description: string | null;
  created_at: string;
}

interface PostUsage {
  id: string;
  title: string;
  slug: string;
  published: boolean;
}

export function SongsManager() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title" | "duration">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [viewingUsageId, setViewingUsageId] = useState<string | null>(null);
  const [postUsage, setPostUsage] = useState<PostUsage[]>([]);
  const [editingMetadataId, setEditingMetadataId] = useState<string | null>(null);
  const [metadataForm, setMetadataForm] = useState({
    cover_image_url: "",
    artist: "",
    album: "",
    genre: "",
    description: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    filterAndSortSongs();
  }, [songs, searchQuery, sortBy, sortOrder]);

  const fetchSongs = async () => {
    try {
      const response = await fetch("/api/songs");
      const data = await response.json();
      setSongs(data.songs || []);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostUsage = async (songId: string) => {
    try {
      const response = await fetch(`/api/songs/${songId}/usage`);
      if (response.ok) {
        const data = await response.json();
        setPostUsage(data.posts || []);
      }
    } catch (error) {
      console.error("Failed to fetch post usage:", error);
    }
  };

  const filterAndSortSongs = () => {
    let filtered = songs.filter((song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "duration":
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
        case "date":
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredSongs(filtered);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("audio/mpeg") && !file.type.includes("audio/mp3")) {
      alert("Please upload an MP3 file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("File too large. Maximum size is 20MB");
      return;
    }

    setUploading(true);

    try {
      const audio = new Audio();
      const audioUrl = URL.createObjectURL(file);
      audio.src = audioUrl;

      let duration: number = 0;
      await new Promise((resolve) => {
        audio.onloadedmetadata = () => {
          duration = Math.round(audio.duration);
          URL.revokeObjectURL(audioUrl);
          resolve(null);
        };
      });

      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || "Failed to upload audio");
      }

      const uploadData = await uploadResponse.json();

      const createResponse = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name.replace(/\.mp3$/i, ""),
          file_url: uploadData.url,
          duration,
          file_size: file.size,
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create song record");
      }

      await fetchSongs();
      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Failed to upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will remove it from all associated posts. This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/songs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete song");
      }

      await fetchSongs();
      setSelectedSongs(new Set([...selectedSongs].filter((sid) => sid !== id)));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete song");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSongs.size === 0) return;

    if (!confirm(`Delete ${selectedSongs.size} selected song(s)? This cannot be undone.`)) {
      return;
    }

    const promises = Array.from(selectedSongs).map((id) =>
      fetch(`/api/songs/${id}`, { method: "DELETE" })
    );

    try {
      await Promise.all(promises);
      await fetchSongs();
      setSelectedSongs(new Set());
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Failed to delete some songs");
    }
  };

  const startEdit = (song: Song) => {
    setEditingId(song.id);
    setEditTitle(song.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/songs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });

      if (!response.ok) {
        throw new Error("Failed to update song");
      }

      await fetchSongs();
      setEditingId(null);
      setEditTitle("");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update song");
    }
  };

  const startEditMetadata = (song: Song) => {
    setEditingMetadataId(song.id);
    setMetadataForm({
      cover_image_url: song.cover_image_url || "",
      artist: song.artist || "",
      album: song.album || "",
      genre: song.genre || "",
      description: song.description || "",
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large. Maximum size is 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setMetadataForm((prev) => ({ ...prev, cover_image_url: data.url }));
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const saveMetadata = async () => {
    if (!editingMetadataId) return;

    try {
      const response = await fetch(`/api/songs/${editingMetadataId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: songs.find((s) => s.id === editingMetadataId)?.title || "",
          cover_image_url: metadataForm.cover_image_url || null,
          artist: metadataForm.artist || null,
          album: metadataForm.album || null,
          genre: metadataForm.genre || null,
          description: metadataForm.description || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update metadata");
      }

      await fetchSongs();
      setEditingMetadataId(null);
      setMetadataForm({
        cover_image_url: "",
        artist: "",
        album: "",
        genre: "",
        description: "",
      });
    } catch (error) {
      console.error("Metadata update error:", error);
      alert("Failed to update metadata");
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedSongs);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedSongs(newSelection);
  };

  const selectAll = () => {
    if (selectedSongs.size === filteredSongs.length) {
      setSelectedSongs(new Set());
    } else {
      setSelectedSongs(new Set(filteredSongs.map((s) => s.id)));
    }
  };

  const viewUsage = async (songId: string) => {
    setViewingUsageId(songId);
    await fetchPostUsage(songId);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-ink/60 dark:text-paper/60">Loading songs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white dark:bg-ink-light border border-mist dark:border-ink-light rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink/60 dark:text-paper/60 mb-1">
            Total Songs
          </h3>
          <p className="text-2xl font-bold text-ink dark:text-paper">
            {songs.length}
          </p>
        </div>
        <div className="bg-white dark:bg-ink-light border border-mist dark:border-ink-light rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink/60 dark:text-paper/60 mb-1">
            Total Duration
          </h3>
          <p className="text-2xl font-bold text-ink dark:text-paper">
            {formatDuration(songs.reduce((acc, s) => acc + (s.duration || 0), 0))}
          </p>
        </div>
        <div className="bg-white dark:bg-ink-light border border-mist dark:border-ink-light rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink/60 dark:text-paper/60 mb-1">
            Total Size
          </h3>
          <p className="text-2xl font-bold text-ink dark:text-paper">
            {formatFileSize(songs.reduce((acc, s) => acc + (s.file_size || 0), 0))}
          </p>
        </div>
        <div className="bg-white dark:bg-ink-light border border-mist dark:border-ink-light rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink/60 dark:text-paper/60 mb-1">
            Selected
          </h3>
          <p className="text-2xl font-bold text-ink dark:text-paper">
            {selectedSongs.size}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 dark:text-paper/40" />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-mist dark:border-ink-light rounded-md bg-paper dark:bg-ink"
            />
          </div>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split("-") as [typeof sortBy, typeof sortOrder];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="px-3 py-2 text-sm border border-mist dark:border-ink-light rounded-md bg-paper dark:bg-ink"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="duration-desc">Longest First</option>
            <option value="duration-asc">Shortest First</option>
          </select>
        </div>

        <div className="flex gap-2">
          {selectedSongs.size > 0 && (
            <Button
              onClick={handleBulkDelete}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedSongs.size})
            </Button>
          )}

          <input
            type="file"
            accept="audio/mpeg,audio/mp3"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            id="song-upload"
          />
          <label htmlFor="song-upload">
            <Button asChild disabled={uploading}>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload MP3"}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Songs List */}
      {filteredSongs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-mist dark:border-ink-light rounded-lg">
          <Music className="w-12 h-12 mx-auto mb-4 text-ink/30 dark:text-paper/30" />
          <p className="text-ink/60 dark:text-paper/60">
            {searchQuery ? "No songs match your search" : "No songs uploaded yet. Upload your first MP3 to get started!"}
          </p>
        </div>
      ) : (
        <div className="border border-mist dark:border-ink-light rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-mist/20 dark:bg-ink-light/20">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedSongs.size === filteredSongs.length && filteredSongs.length > 0}
                    onChange={selectAll}
                    className="rounded border-mist dark:border-ink-light"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-ink/70 dark:text-paper/70 uppercase tracking-wider">
                  Cover
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-ink/70 dark:text-paper/70 uppercase tracking-wider">
                  Title & Artist
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-ink/70 dark:text-paper/70 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-ink/70 dark:text-paper/70 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-ink/70 dark:text-paper/70 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-ink/70 dark:text-paper/70 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-ink/70 dark:text-paper/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist dark:divide-ink-light">
              {filteredSongs.map((song) => (
                <tr
                  key={song.id}
                  className={`hover:bg-mist/10 dark:hover:bg-ink-light/10 transition-colors ${
                    selectedSongs.has(song.id) ? "bg-mist/20 dark:bg-ink-light/20" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedSongs.has(song.id)}
                      onChange={() => toggleSelection(song.id)}
                      className="rounded border-mist dark:border-ink-light"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {song.cover_image_url ? (
                      <img
                        src={song.cover_image_url}
                        alt={song.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-mist/20 dark:bg-ink-light/20 flex items-center justify-center">
                        <Music className="w-6 h-6 text-ink/30 dark:text-paper/30" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === song.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-mist dark:border-ink-light rounded bg-paper dark:bg-ink"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPlayingId(playingId === song.id ? null : song.id)}
                          className="flex-shrink-0 w-8 h-8 rounded-full bg-sage/10 hover:bg-sage/20 dark:bg-sage-light/10 dark:hover:bg-sage-light/20 flex items-center justify-center transition-colors"
                        >
                          {playingId === song.id ? (
                            <Pause className="w-4 h-4 text-sage dark:text-sage-light" />
                          ) : (
                            <Play className="w-4 h-4 text-sage dark:text-sage-light ml-0.5" />
                          )}
                        </button>
                        <div>
                          <div className="text-sm font-medium text-ink dark:text-paper">
                            {song.title}
                          </div>
                          {song.artist && (
                            <div className="text-xs text-ink/60 dark:text-paper/60">
                              {song.artist}
                            </div>
                          )}
                          {playingId === song.id && (
                            <audio
                              src={song.file_url}
                              controls
                              autoPlay
                              className="mt-2 w-full max-w-sm"
                              onEnded={() => setPlayingId(null)}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink/70 dark:text-paper/70">
                    {formatDuration(song.duration)}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink/70 dark:text-paper/70">
                    {formatFileSize(song.file_size)}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink/70 dark:text-paper/70">
                    {formatDate(song.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      onClick={() => viewUsage(song.id)}
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                    >
                      View Posts
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === song.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => saveEdit(song.id)}
                          size="sm"
                          variant="default"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          size="sm"
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => window.open(song.file_url, "_blank")}
                          size="sm"
                          variant="ghost"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => startEditMetadata(song)}
                          size="sm"
                          variant="ghost"
                          title="Edit Metadata"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => startEdit(song)}
                          size="sm"
                          variant="ghost"
                          title="Edit Title"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(song.id, song.title)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Metadata Editor Modal */}
      {editingMetadataId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-paper dark:bg-ink border border-mist dark:border-ink-light rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-ink dark:text-paper">
                Edit Song Metadata
              </h3>
              <Button
                onClick={() => setEditingMetadataId(null)}
                variant="ghost"
                size="sm"
              >
                Close
              </Button>
            </div>

            <div className="space-y-4">
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-ink dark:text-paper mb-2">
                  Cover Image
                </label>
                <div className="flex items-start gap-4">
                  {metadataForm.cover_image_url ? (
                    <div className="relative">
                      <img
                        src={metadataForm.cover_image_url}
                        alt="Cover"
                        className="w-32 h-32 rounded object-cover"
                      />
                      <Button
                        onClick={() => setMetadataForm((prev) => ({ ...prev, cover_image_url: "" }))}
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded bg-mist/20 dark:bg-ink-light/20 flex items-center justify-center border-2 border-dashed border-mist dark:border-ink-light">
                      <ImageIcon className="w-12 h-12 text-ink/30 dark:text-paper/30" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                      id="cover-image-upload"
                    />
                    <label htmlFor="cover-image-upload">
                      <Button asChild disabled={uploadingImage}>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingImage ? "Uploading..." : "Upload Cover Image"}
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-ink/60 dark:text-paper/60 mt-2">
                      Recommended: Square image, at least 500x500px
                    </p>
                  </div>
                </div>
              </div>

              {/* Artist */}
              <div>
                <label className="block text-sm font-medium text-ink dark:text-paper mb-2">
                  Artist
                </label>
                <input
                  type="text"
                  value={metadataForm.artist}
                  onChange={(e) => setMetadataForm((prev) => ({ ...prev, artist: e.target.value }))}
                  placeholder="Artist name"
                  className="w-full px-3 py-2 border border-mist dark:border-ink-light rounded-md bg-paper dark:bg-ink text-ink dark:text-paper"
                />
              </div>

              {/* Album */}
              <div>
                <label className="block text-sm font-medium text-ink dark:text-paper mb-2">
                  Album
                </label>
                <input
                  type="text"
                  value={metadataForm.album}
                  onChange={(e) => setMetadataForm((prev) => ({ ...prev, album: e.target.value }))}
                  placeholder="Album name"
                  className="w-full px-3 py-2 border border-mist dark:border-ink-light rounded-md bg-paper dark:bg-ink text-ink dark:text-paper"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-medium text-ink dark:text-paper mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  value={metadataForm.genre}
                  onChange={(e) => setMetadataForm((prev) => ({ ...prev, genre: e.target.value }))}
                  placeholder="e.g., Poetry, Spoken Word, Indie"
                  className="w-full px-3 py-2 border border-mist dark:border-ink-light rounded-md bg-paper dark:bg-ink text-ink dark:text-paper"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-ink dark:text-paper mb-2">
                  Description
                </label>
                <textarea
                  value={metadataForm.description}
                  onChange={(e) => setMetadataForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional notes or description..."
                  rows={4}
                  className="w-full px-3 py-2 border border-mist dark:border-ink-light rounded-md bg-paper dark:bg-ink text-ink dark:text-paper resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-mist dark:border-ink-light">
                <Button
                  onClick={() => setEditingMetadataId(null)}
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button onClick={saveMetadata}>
                  Save Metadata
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Modal */}
      {viewingUsageId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-paper dark:bg-ink border border-mist dark:border-ink-light rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink dark:text-paper">
                Posts Using This Song
              </h3>
              <Button
                onClick={() => setViewingUsageId(null)}
                variant="ghost"
                size="sm"
              >
                Close
              </Button>
            </div>

            {postUsage.length === 0 ? (
              <p className="text-center text-ink/60 dark:text-paper/60 py-8">
                This song is not used in any posts yet.
              </p>
            ) : (
              <div className="space-y-2">
                {postUsage.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-3 border border-mist dark:border-ink-light rounded-md hover:bg-mist/10 dark:hover:bg-ink-light/10"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-ink dark:text-paper">
                        {post.title}
                      </div>
                      <div className="text-xs text-ink/60 dark:text-paper/60">
                        {post.published ? "Published" : "Draft"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/posts/${post.id}`}>
                          Edit
                        </Link>
                      </Button>
                      {post.published && (
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/library/${post.slug}`} target="_blank">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
