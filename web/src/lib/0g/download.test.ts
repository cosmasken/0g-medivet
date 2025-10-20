import { downloadFromStorage, downloadFileAsBlob, triggerFileDownload, previewFile, verifyFileExists } from './downloader';

// Mock the 0G SDK
jest.mock('@0glabs/0g-ts-sdk', () => ({
    Indexer: jest.fn().mockImplementation(() => ({
        download: jest.fn(),
        getFileInfo: jest.fn()
    }))
}));

describe('0G Download Functions', () => {
    const mockRootHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const mockFileData = new Uint8Array([1, 2, 3, 4, 5]);

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock URL.createObjectURL and revokeObjectURL
        global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = jest.fn();
    });

    describe('downloadFromStorage', () => {
        it('should download file successfully', async () => {
            const { Indexer } = require('@0glabs/0g-ts-sdk');
            const mockIndexer = new Indexer();
            mockIndexer.download.mockResolvedValue(mockFileData);

            const [data, error] = await downloadFromStorage(mockRootHash);

            expect(data).toEqual(mockFileData);
            expect(error).toBeNull();
            expect(mockIndexer.download).toHaveBeenCalledWith(mockRootHash);
        });

        it('should handle invalid root hash', async () => {
            const [data, error] = await downloadFromStorage('unknown');

            expect(data).toBeNull();
            expect(error).toBeInstanceOf(Error);
            expect(error?.message).toContain('Invalid root hash');
        });

        it('should handle download failure', async () => {
            const { Indexer } = require('@0glabs/0g-ts-sdk');
            const mockIndexer = new Indexer();
            mockIndexer.download.mockRejectedValue(new Error('Network error'));

            const [data, error] = await downloadFromStorage(mockRootHash);

            expect(data).toBeNull();
            expect(error).toBeInstanceOf(Error);
            expect(error?.message).toBe('Network error');
        });
    });

    describe('downloadFileAsBlob', () => {
        it('should create blob URL successfully', async () => {
            const { Indexer } = require('@0glabs/0g-ts-sdk');
            const mockIndexer = new Indexer();
            mockIndexer.download.mockResolvedValue(mockFileData);

            const [blobUrl, error] = await downloadFileAsBlob(mockRootHash, 'test.txt', 'text/plain');

            expect(blobUrl).toBe('blob:mock-url');
            expect(error).toBeNull();
            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });

        it('should handle blob creation failure', async () => {
            const { Indexer } = require('@0glabs/0g-ts-sdk');
            const mockIndexer = new Indexer();
            mockIndexer.download.mockResolvedValue(null);

            const [blobUrl, error] = await downloadFileAsBlob(mockRootHash, 'test.txt');

            expect(blobUrl).toBeNull();
            expect(error).toBeInstanceOf(Error);
        });
    });

    describe('verifyFileExists', () => {
        it('should verify file exists using getFileInfo', async () => {
            const { Indexer } = require('@0glabs/0g-ts-sdk');
            const mockIndexer = new Indexer();
            mockIndexer.getFileInfo.mockResolvedValue({ size: 1024 });

            const [exists, error] = await verifyFileExists(mockRootHash);

            expect(exists).toBe(true);
            expect(error).toBeNull();
        });

        it('should fallback to download if getFileInfo fails', async () => {
            const { Indexer } = require('@0glabs/0g-ts-sdk');
            const mockIndexer = new Indexer();
            mockIndexer.getFileInfo.mockRejectedValue(new Error('Method not available'));
            mockIndexer.download.mockResolvedValue(mockFileData);

            const [exists, error] = await verifyFileExists(mockRootHash);

            expect(exists).toBe(true);
            expect(error).toBeNull();
        });

        it('should return false for non-existent file', async () => {
            const { Indexer } = require('@0glabs/0g-ts-sdk');
            const mockIndexer = new Indexer();
            mockIndexer.getFileInfo.mockRejectedValue(new Error('Method not available'));
            mockIndexer.download.mockRejectedValue(new Error('File not found'));

            const [exists, error] = await verifyFileExists(mockRootHash);

            expect(exists).toBe(false);
            expect(error).toBeNull();
        });
    });

    describe('previewFile', () => {
        it('should create preview URL for previewable file', async () => {
            const { Indexer } = require('@0glabs/0g-ts-sdk');
            const mockIndexer = new Indexer();
            mockIndexer.download.mockResolvedValue(mockFileData);

            const [previewUrl, error] = await previewFile(mockRootHash, 'image/jpeg');

            expect(previewUrl).toBe('blob:mock-url');
            expect(error).toBeNull();
        });

        it('should reject non-previewable file types', async () => {
            const [previewUrl, error] = await previewFile(mockRootHash, 'application/octet-stream');

            expect(previewUrl).toBeNull();
            expect(error).toBeInstanceOf(Error);
            expect(error?.message).toContain('not previewable');
        });
    });

    describe('triggerFileDownload', () => {
        it('should trigger file download successfully', async () => {
            const { Indexer } = require('@0glabs/0g-ts-sdk');
            const mockIndexer = new Indexer();
            mockIndexer.download.mockResolvedValue(mockFileData);

            // Mock DOM elements
            const mockLink = {
                href: '',
                download: '',
                style: { display: '' },
                click: jest.fn()
            };
            document.createElement = jest.fn(() => mockLink as any);
            document.body.appendChild = jest.fn();
            document.body.removeChild = jest.fn();

            const [success, error] = await triggerFileDownload(mockRootHash, 'test.txt');

            expect(success).toBe(true);
            expect(error).toBeNull();
            expect(mockLink.click).toHaveBeenCalled();
            expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
            expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
        });
    });
});