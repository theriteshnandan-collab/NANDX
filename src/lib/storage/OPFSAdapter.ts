/**
 * 📂 OPFS ADAPTER: Origin-Private File System for 1GB+ Files
 * 
 * 🎓 MISSION: Use the browser's Origin-Private File System (OPFS)
 * for storing large files locally. This bypasses IndexedDB's size
 * limits and provides near-native filesystem performance.
 * 
 * PATTERN: Adapter (wraps the OPFS API with Nandix-friendly methods)
 */

export class OPFSAdapter {
    private root: FileSystemDirectoryHandle | null = null;

    /**
     * Initialize the OPFS root directory.
     */
    async initialize(): Promise<boolean> {
        try {
            if (typeof navigator === "undefined" || !navigator.storage) {
                console.warn("[OPFS] ⚠️ OPFS not available in this environment.");
                return false;
            }
            this.root = await navigator.storage.getDirectory();
            console.log("[OPFS] 📂 Origin-Private File System initialized.");
            return true;
        } catch (err) {
            console.error("[OPFS] ❌ Failed to initialize:", err);
            return false;
        }
    }

    /**
     * Write a file to OPFS (supports streaming for large files).
     */
    async writeFile(fileName: string, data: ArrayBuffer | Uint8Array): Promise<boolean> {
        if (!this.root) return false;

        try {
            const fileHandle = await this.root.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(data);
            await writable.close();
            console.log(`[OPFS] ✅ Written: ${fileName} (${data.byteLength} bytes)`);
            return true;
        } catch (err) {
            console.error(`[OPFS] ❌ Write failed for ${fileName}:`, err);
            return false;
        }
    }

    /**
     * Write a file chunk by chunk (for streaming large transfers).
     */
    async writeChunk(fileName: string, chunk: Uint8Array, offset: number): Promise<boolean> {
        if (!this.root) return false;

        try {
            const fileHandle = await this.root.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable({ keepExistingData: true });
            await writable.seek(offset);
            await writable.write(chunk);
            await writable.close();
            return true;
        } catch (err) {
            console.error(`[OPFS] ❌ Chunk write failed for ${fileName}:`, err);
            return false;
        }
    }

    /**
     * Read a file from OPFS.
     */
    async readFile(fileName: string): Promise<ArrayBuffer | null> {
        if (!this.root) return null;

        try {
            const fileHandle = await this.root.getFileHandle(fileName);
            const file = await fileHandle.getFile();
            return await file.arrayBuffer();
        } catch (err) {
            console.warn(`[OPFS] ⚠️ Read failed for ${fileName}:`, err);
            return null;
        }
    }

    /**
     * Delete a file from OPFS.
     */
    async deleteFile(fileName: string): Promise<boolean> {
        if (!this.root) return false;

        try {
            await this.root.removeEntry(fileName);
            console.log(`[OPFS] 🗑️ Deleted: ${fileName}`);
            return true;
        } catch (err) {
            console.warn(`[OPFS] ⚠️ Delete failed for ${fileName}:`, err);
            return false;
        }
    }

    /**
     * List all files in OPFS.
     */
    async listFiles(): Promise<string[]> {
        if (!this.root) return [];

        const files: string[] = [];
        try {
            for await (const [name] of (this.root as any).entries()) {
                files.push(name);
            }
        } catch (err) {
            console.warn(`[OPFS] ⚠️ List failed:`, err);
        }
        return files;
    }

    /**
     * Get file size.
     */
    async getFileSize(fileName: string): Promise<number> {
        if (!this.root) return 0;

        try {
            const fileHandle = await this.root.getFileHandle(fileName);
            const file = await fileHandle.getFile();
            return file.size;
        } catch {
            return 0;
        }
    }
}

export const opfsAdapter = new OPFSAdapter();
