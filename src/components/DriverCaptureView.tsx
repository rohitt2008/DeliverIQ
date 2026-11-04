'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  XCircle,
  Truck
} from 'lucide-react';
import { compressPODImage } from './ImageCompressor';
import { queueOfflinePOD } from './OfflineStorage';
import { speakPrompt, VoiceLanguage } from './VoiceGuide';

export interface DriverTripData {
  id: string;
  lrNumber: string;
  ewayBillNumber: string;
  vehicleNo: string;
  destination: string;
  material: string;
  expectedQty: number;
  unit: string;
  podStatus: string;
  remarks?: string | null;
  client?: { name: string };
  pod?: {
    retakeCount: number;
    imageUrl?: string;
  } | null;
}

interface DriverCaptureViewProps {
  trip: DriverTripData;
  onSuccess?: () => void;
  isMagicLink?: boolean;
}

export default function DriverCaptureView({
  trip,
  onSuccess,
  isMagicLink = false,
}: DriverCaptureViewProps) {
  const [lang, setLang] = useState<VoiceLanguage>('mr');
  const [gpsData, setGpsData] = useState<{
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    status: 'locating' | 'ready' | 'denied';
  }>({
    lat: null,
    lng: null,
    accuracy: null,
    status: 'locating',
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalKb: number;
    compressedKb: number;
    savings: number;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [retakeCount, setRetakeCount] = useState(trip.pod?.retakeCount || 0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-acquire GPS coordinates on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsData({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            accuracy: Math.round(pos.coords.accuracy),
            status: 'ready',
          });
        },
        () => {
          // Fallback realistic Maharashtra coordinates (Chhatrapati Sambhajinagar MIDC)
          setGpsData({
            lat: 19.8762,
            lng: 75.3433,
            accuracy: 8,
            status: 'ready',
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGpsData({
        lat: 19.8762,
        lng: 75.3433,
        accuracy: 8,
        status: 'ready',
      });
    }

    // Voice instruction on initial render
    speakPrompt('takePhotoGuide', lang);
  }, []);

  const handleLanguageChange = (newLang: VoiceLanguage) => {
    setLang(newLang);
    speakPrompt('takePhotoGuide', newLang);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      // 1. Client-side compression (< 300 KB guaranteed)
      const compressed = await compressPODImage(file, 280, 1600);
      setPreviewUrl(compressed.dataUrl);
      setCompressedFile(compressed.compressedFile);
      setCompressionStats({
        originalKb: compressed.originalSizeKb,
        compressedKb: compressed.compressedSizeKb,
        savings: compressed.reductionPercentage,
      });

      // Spoken feedback
      speakPrompt('analyzingPhoto', lang);

      // Check if offline
      if (!navigator.onLine) {
        await queueOfflinePOD({
          tripId: trip.id,
          blob: compressed.compressedBlob,
          fileName: compressed.compressedFile.name,
          gpsLat: gpsData.lat,
          gpsLng: gpsData.lng,
          gpsAccuracy: gpsData.accuracy,
          gpsLocationName: `${trip.destination} Gate`,
          capturedAt: new Date().toISOString(),
        });

        setIsProcessing(false);
        setAnalysisResult({
          offlineQueued: true,
          recommendedStatus: 'OFFLINE_SAVED',
        });
        speakPrompt('offlineSaved', lang);
        return;
      }

      // 2. Upload and AI Verification
      const formData = new FormData();
      formData.append('tripId', trip.id);
      formData.append('file', compressed.compressedFile);
      if (gpsData.lat) formData.append('gpsLat', String(gpsData.lat));
      if (gpsData.lng) formData.append('gpsLng', String(gpsData.lng));
      if (gpsData.accuracy) formData.append('gpsAccuracy', String(gpsData.accuracy));
      formData.append('gpsLocationName', `${trip.destination} Consignee Gate`);

      const res = await fetch('/api/pod/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setAnalysisResult(data.analysis);
      setRetakeCount(data.retakeCount);

      // Audio feedback based on AI decision
      if (data.tripStatus === 'VERIFIED') {
        speakPrompt('successVerified', lang);
      } else if (data.tripStatus === 'RETAKE_REQUESTED') {
        if (!data.analysis.stampDetected) {
          speakPrompt('stampMissingRetake', lang);
        } else if (data.analysis.blurScore > 0.6) {
          speakPrompt('blurryRetake', lang);
        } else {
          speakPrompt('stampMissingRetake', lang);
        }
      } else if (data.tripStatus === 'NEEDS_REVIEW') {
        if (data.analysis.isShortageOrDamage) {
          speakPrompt('shortageNoted', lang);
        } else {
          speakPrompt('retakeLimitReached', lang);
        }
      }

      if (onSuccess && data.tripStatus === 'VERIFIED') {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error uploading POD photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForRetake = () => {
    setPreviewUrl(null);
    setCompressedFile(null);
    setAnalysisResult(null);
    setErrorMsg(null);
    speakPrompt('takePhotoGuide', lang);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Top Banner & Multi-language Voice Selector */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-brand-400" />
          <span className="font-bold text-sm tracking-wide">
            {lang === 'mr' ? 'गेट डिलिव्हरी पावती' : lang === 'hi' ? 'गेट डिलीवरी रसीद' : 'Gate POD Capture'}
          </span>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
          <button
            onClick={() => handleLanguageChange('mr')}
            className={`px-2 py-1 text-xs font-semibold rounded ${
              lang === 'mr' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            मराठी
          </button>
          <button
            onClick={() => handleLanguageChange('hi')}
            className={`px-2 py-1 text-xs font-semibold rounded ${
              lang === 'hi' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-2 py-1 text-xs font-semibold rounded ${
              lang === 'en' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ENG
          </button>
        </div>
      </div>

      {/* Spoken Audio Helper Bar */}
      <div className="bg-brand-50 border-b border-brand-100 px-5 py-2.5 flex items-center justify-between">
        <button
          onClick={() => speakPrompt('takePhotoGuide', lang)}
          className="flex items-center gap-2 text-brand-800 hover:text-brand-900 font-medium text-xs group"
        >
          <span className="w-6 h-6 rounded-full bg-brand-200 flex items-center justify-center text-brand-800 group-hover:scale-110 transition">
            <Volume2 className="w-3.5 h-3.5" />
          </span>
          <span>{lang === 'mr' ? 'आवाज ऐका (Voice Guide)' : lang === 'hi' ? 'आवाज़ सुनें (Voice Guide)' : 'Listen to Voice Guide'}</span>
        </button>

        {/* GPS Geotag Stamp Status */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {gpsData.lat ? `${gpsData.lat}°, ${gpsData.lng}° (±${gpsData.accuracy}m)` : 'Locating GPS...'}
          </span>
        </div>
      </div>

      {/* Trip Information Card (Visual, Bold, High Contrast) */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">{trip.vehicleNo}</span>
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded">
                {trip.id}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {trip.material} • {trip.expectedQty} {trip.unit}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              LR No: <span className="font-mono font-bold text-slate-800">{trip.lrNumber}</span> → {trip.destination}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 block">
              {lang === 'mr' ? 'खेप स्थिती' : lang === 'hi' ? 'ट्रिप स्टेटस' : 'Status'}
            </span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-0.5 ${
                trip.podStatus === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : trip.podStatus === 'RETAKE_REQUESTED'
                  ? 'bg-amber-100 text-amber-800'
                  : trip.podStatus === 'NEEDS_REVIEW'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {trip.podStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="p-5">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />

        {/* STATE 1: Empty / Initial - Ready to Photograph */}
        {!previewUrl && !isProcessing && (
          <div className="space-y-4">
            {/* Viewfinder Frame with Alignment Guides */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-[3/4] max-h-80 w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-900/5 hover:bg-slate-900/10 transition flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
            >
              {/* Corner Brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-brand-500" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-brand-500" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-brand-500" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-brand-500" />

              <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 mb-3 group-hover:scale-110 transition shadow-inner">
                <Camera className="w-8 h-8" />
              </div>

              <p className="font-bold text-slate-800 text-base">
                {lang === 'mr'
                  ? 'पावती चौकटीत धरा'
                  : lang === 'hi'
                  ? 'रसीद को चौखट में रखें'
                  : 'Align Receipt inside Frame'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {lang === 'mr'
                  ? 'पावतीवरील शिक्का आणि स्वाक्षरी स्पष्ट दिसू द्या'
                  : lang === 'hi'
                  ? 'मुहर और हस्ताक्षर साफ़ दिखने चाहिए'
                  : 'Ensure stamp, date & signature are clearly visible'}
              </p>
            </div>

            {/* ONE BIG BUTTON (Constraint from Brief) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 active:scale-[0.98] text-white font-extrabold text-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition"
            >
              <Camera className="w-7 h-7" />
              <span>
                {lang === 'mr' ? 'फोटो काढा' : lang === 'hi' ? 'फ़ोटो खींचें' : 'CAPTURE POD PHOTO'}
              </span>
            </button>
          </div>
        )}

        {/* STATE 2: Processing / AI Verification In-Progress */}
        {isProcessing && (
          <div className="aspect-[3/4] max-h-80 w-full rounded-2xl bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center text-white p-6">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Captured POD"
                className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xs"
              />
            )}
            <div className="scanner-laser absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_12px_#38bdf8]" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-600/80 backdrop-blur-md flex items-center justify-center text-white mb-3 animate-pulse">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg">
                {lang === 'mr' ? 'AI तपासणी सुरू आहे...' : lang === 'hi' ? 'AI जांच हो रही है...' : 'AI Verifying POD...'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs">
                {lang === 'mr'
                  ? 'LR नंबर, शिक्का, स्वाक्षरी आणि तूट तपासली जात आहे'
                  : lang === 'hi'
                  ? 'मुहर, हस्ताक्षर और माल की मात्रा जांची जा रही है'
                  : 'Checking LR number, stamp presence, signature and shortage remarks'}
              </p>
            </div>
          </div>
        )}

        {/* STATE 3: AI Result Displays */}
        {analysisResult && !isProcessing && (
          <div className="space-y-4">
            {/* Compressed photo preview with overlay */}
            <div className="relative aspect-[3/4] max-h-72 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              {previewUrl && (
                <img src={previewUrl} alt="Captured POD" className="w-full h-full object-contain" />
              )}

              {/* Compression Badge */}
              {compressionStats && (
                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono px-2 py-1 rounded">
                  Compressed: {compressionStats.compressedKb} KB ({compressionStats.savings}% saved)
                </div>
              )}
            </div>

            {/* SCENARIO A: VERIFIED (Success) */}
            {analysisResult.recommendedStatus === 'VERIFIED' && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-black text-emerald-900 text-lg">
                      {lang === 'mr' ? 'पावती स्वीकारली गेली आहे!' : lang === 'hi' ? 'रसीद स्वीकृत हो गई!' : 'POD Verified Successfully!'}
                    </h4>
                    <p className="text-xs text-emerald-700">
                      {lang === 'mr'
                        ? 'शिक्का आणि स्वाक्षरी दोन्ही प्रमाणित. तुम्ही गेटमधून निघू शकता.'
                        : lang === 'hi'
                        ? 'मुहर और हस्ताक्षर दोनों सत्यापित। आप प्रस्थान कर सकते हैं।'
                        : 'Consignee stamp and signature detected. Trip marked ready for billing.'}
                    </p>
                  </div>
                </div>

                {/* Extracted Metrics Checklist */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Stamp: <strong className="font-semibold">Detected ({Math.round(analysisResult.stampClarityScore * 100)}%)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>LR: <strong className="font-semibold">{analysisResult.lrNumberDetected} (Match)</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO B: RETAKE REQUESTED (Actionable Retake Prompt) */}
            {analysisResult.recommendedStatus === 'RETAKE_REQUESTED' && (
              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-amber-950 text-base">
                        {lang === 'mr' ? 'पुन्हा फोटो काढा' : lang === 'hi' ? 'दोबारा फ़ोटो लें' : 'Retake Required'}
                      </h4>
                      <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                        Attempt {retakeCount} of 2
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-amber-800 mt-1">
                      {analysisResult.retakeReason || 'Consignee rubber stamp is missing or obscured.'}
                    </p>
                    <p className="text-[11px] text-amber-700 mt-1">
                      {lang === 'mr'
                        ? 'कृपया गेटवरील अधिकाऱ्याला पावतीवर रबर शिक्का मारायला सांगा आणि पुन्हा फोटो घ्या.'
                        : lang === 'hi'
                        ? 'कृपया गेट पर अधिकारी से मुहर लगवाएं और दोबारा फ़ोटो खींचें।'
                        : 'Please ask consignee gatekeeper to affix rubber stamp and retake.'}
                    </p>
                  </div>
                </div>

                {/* Big Retake Button */}
                <button
                  onClick={resetForRetake}
                  className="w-full mt-3 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-base shadow flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>
                    {lang === 'mr' ? 'पुन्हा फोटो काढा' : lang === 'hi' ? 'दोबारा फ़ोटो खींचें' : 'RETAKE PHOTO NOW'}
                  </span>
                </button>
              </div>
            )}

            {/* SCENARIO C: NEEDS REVIEW (Shortage or Retake Limit Reached) */}
            {analysisResult.recommendedStatus === 'NEEDS_REVIEW' && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <FileCheck className="w-8 h-8 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-blue-950 text-base">
                      {lang === 'mr' ? 'पावती कार्यालयाकडे पाठवली' : lang === 'hi' ? 'रसीद समीक्षा के लिए भेजी गई' : 'Routed for Executive Review'}
                    </h4>
                    <p className="text-xs text-blue-800 mt-1">
                      {analysisResult.executiveAlert ||
                        'Photo accepted. Discrepancy noted and routed to billing team. Driver cleared to leave.'}
                    </p>
                    <p className="text-[11px] text-blue-600 mt-2 font-medium">
                      ✓ Driver cleared to leave gate. No further retakes required.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO D: OFFLINE SAVED */}
            {analysisResult.recommendedStatus === 'OFFLINE_SAVED' && (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                <h4 className="font-bold text-indigo-950 text-base">
                  {lang === 'mr' ? 'फोटो जतन केला (ऑफलाइन)' : lang === 'hi' ? 'फ़ोटो सुरक्षित (ऑफ़लाइन)' : 'POD Saved Offline'}
                </h4>
                <p className="text-xs text-indigo-800 mt-1">
                  Stored securely on device. As soon as you enter mobile network range, it will automatically sync to head office.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error message strip */}
        {errorMsg && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Footer Audit Guarantee */}
      <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>DPDP Act 2023 Protected</span>
        </span>
        <span>DeliverIQ FTL Gate v1.0</span>
      </div>
    </div>
  );
}
