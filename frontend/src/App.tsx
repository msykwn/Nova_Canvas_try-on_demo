import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './resource/index.css'
import './resource/chat.css'
import {ImageUploadComponent} from './components/ImageUpload.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ImageUploadComponent />
    </StrictMode>
)
