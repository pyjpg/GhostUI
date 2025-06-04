// src/pdfjsWorker.ts
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import workerUrl from 'pdfjs-dist/build/pdf.worker?url';

GlobalWorkerOptions.workerSrc = workerUrl;
