import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from 'lib/constants';
import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useOutletContext } from 'react-router';

interface UploadProps {
    onComplete?: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { isSignedIn } = useOutletContext<AuthContext>();

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const processFile = (file: File) => {
        if (!isSignedIn) return;

        // Clear any existing progress processes
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Basic validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!allowedTypes.includes(file.type)) {
            console.error('Invalid file type');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            console.error('File too large');
            return;
        }

        setFile(file);
        setProgress(0);

        const reader = new FileReader();

        reader.onerror = (e) => {
            console.error('File reading failed:', e);
            setFile(null);
            setProgress(0);
        };

        reader.onload = (e) => {
            const base64 = e.target?.result as string;

            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        timeoutRef.current = setTimeout(() => {
                            onComplete?.(base64);
                            timeoutRef.current = null;
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }
                    return prev + PROGRESS_STEP;
                });
            }, PROGRESS_INTERVAL_MS);
        };

        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (!isSignedIn) return;

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.png,.jpeg"
                        disabled={!isSignedIn}
                        onChange={handleChange}
                    />
                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn
                                ? 'Click to upload or just drag and drop'
                                : 'Sign in or sign up with Puter to upload'}
                        </p>
                        <p className="help">Supports JPG, PNG, formats up to 10MBs</p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className="check" />
                            ) : (
                                <ImageIcon className="image" />
                            )}
                        </div>
                        <h3>{file.name}</h3>
                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%` }} />

                            <p className="status-text">
                                {progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;
