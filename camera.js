(function () {
  'use strict';

  let stream = null;
  let onCaptureCallback = null;
  let onCancelCallback = null;

  const video = () => document.getElementById('camera-video');
  const fallback = () => document.getElementById('camera-fallback');
  const fileInputFallback = () => document.getElementById('file-input-fallback');
  const fileInputAlt = () => document.getElementById('file-input-alt');
  const takeBtn = () => document.getElementById('btn-take-photo-capture');
  const backBtn = () => document.getElementById('btn-camera-back');

  async function open(onCapture, onCancel) {
    onCaptureCallback = onCapture;
    onCancelCallback = onCancel;

    fallback().classList.remove('active');
    video().style.display = 'block';

    takeBtn().onclick = function (e) { e.stopPropagation(); handleTakePhoto(); };
    backBtn().onclick = function (e) { e.stopPropagation(); handleBack(); };
    fileInputFallback().onchange = handleFileSelected;
    fileInputAlt().onchange = handleFileSelected;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      video().srcObject = stream;
      await video().play();
    } catch (err) {
      console.warn('Camera unavailable:', err.message);
      showFallback();
    }
  }

  function showFallback() {
    video().style.display = 'none';
    fallback().classList.add('active');
    stopStream();
  }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  function close() {
    stopStream();
    if (video()) { video().srcObject = null; }
    if (takeBtn()) takeBtn().onclick = null;
    if (backBtn()) backBtn().onclick = null;
    if (fileInputFallback()) fileInputFallback().onchange = null;
    if (fileInputAlt()) fileInputAlt().onchange = null;
    onCaptureCallback = null;
    onCancelCallback = null;
  }

  function handleTakePhoto() {
    if (!stream) { return; }
    const v = video();
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext('2d').drawImage(v, 0, 0);
    canvas.toBlob(function (blob) {
      deliverCapture(blob);
    }, 'image/jpeg', 0.9);
  }

  function handleFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const maxW = 1920;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(function (blob) { deliverCapture(blob); }, 'image/jpeg', 0.9);
    };
    img.src = url;
  }

  function deliverCapture(blob) {
    if (onCaptureCallback) onCaptureCallback(blob);
  }

  function handleBack() {
    if (onCancelCallback) onCancelCallback();
  }

  window.Camera = { open, close };
})();
