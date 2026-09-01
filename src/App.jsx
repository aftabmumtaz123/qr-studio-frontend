import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QRProvider } from './contexts/QRContext';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import SavedQRs from './pages/SavedQRs';
import QRSettings from './pages/QRSettings';
import Analytics from './pages/Analytics';
import URLShortener from './pages/URLShortener';

// QR Forms
import URLForm from './pages/forms/URLForm';
import TextForm from './pages/forms/TextForm';
import EmailForm from './pages/forms/EmailForm';
import SMSForm from './pages/forms/SMSForm';
import WhatsAppForm from './pages/forms/WhatsAppForm';
import PhoneForm from './pages/forms/PhoneForm';
import VCardForm from './pages/forms/VCardForm';
import WiFiForm from './pages/forms/WiFiForm';
import EventForm from './pages/forms/EventForm';
import PDFForm from './pages/forms/PDFForm';
import ImageForm from './pages/forms/ImageForm';
import AppForm from './pages/forms/AppForm';
import SocialForm from './pages/forms/SocialForm';
import InstagramForm from './pages/forms/InstagramForm';
import LinkedInForm from './pages/forms/LinkedInForm';
import TwitterForm from './pages/forms/TwitterForm';
import SpotifyForm from './pages/forms/SpotifyForm';
import PayPalForm from './pages/forms/PayPalForm';
import DynamicURLForm from './pages/forms/DynamicURLForm';

function App() {
  return (
    <ErrorBoundary>
      <QRProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="shortener" element={<URLShortener />} />
              <Route path="shortened" element={<URLShortener />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="qr/url" element={<URLForm />} />
              <Route path="qr/text" element={<TextForm />} />
              <Route path="qr/email" element={<EmailForm />} />
              <Route path="qr/sms" element={<SMSForm />} />
              <Route path="qr/whatsapp" element={<WhatsAppForm />} />
              <Route path="qr/phone" element={<PhoneForm />} />
              <Route path="qr/vcard" element={<VCardForm />} />
              <Route path="qr/wifi" element={<WiFiForm />} />
              <Route path="qr/event" element={<EventForm />} />
              <Route path="qr/pdf" element={<PDFForm />} />
              <Route path="qr/image" element={<ImageForm />} />
              <Route path="qr/app" element={<AppForm />} />
              <Route path="qr/social" element={<SocialForm />} />
              <Route path="qr/instagram" element={<InstagramForm />} />
              <Route path="qr/linkedin" element={<LinkedInForm />} />
              <Route path="qr/twitter" element={<TwitterForm />} />
              <Route path="qr/spotify" element={<SpotifyForm />} />
              <Route path="qr/paypal" element={<PayPalForm />} />
              <Route path="qr/dynamic" element={<DynamicURLForm />} />
              <Route path="settings" element={<QRSettings />} />
              <Route path="saved" element={<SavedQRs />} />
            </Route>
          </Routes>
        </Router>
      </QRProvider>
    </ErrorBoundary>
  );
}

export default App;
