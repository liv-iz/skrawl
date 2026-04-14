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

  // Laplacian-variance blur metric.
  // Higher = sharper. Threshold used by the app: 80.
  function computeBlurVariance(imageData) {
    const { data, width, height } = imageData;
    const gray = new Float32Array(width * height);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      gray[j] = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    }

    let sum = 0, sumSq = 0, count = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        const v =
          -4 * gray[i]
          + gray[i - 1] + gray[i + 1]
          + gray[i - width] + gray[i + width];
        sum += v;
        sumSq += v * v;
        count++;
      }
    }
    if (count === 0) return 0;
    const mean = sum / count;
    return sumSq / count - mean * mean;
  }

  function computeVarianceFromCanvas(ctx, w, h) {
    const targetW = 320;
    const scale = targetW / w;
    const sw = targetW;
    const sh = Math.max(1, Math.round(h * scale));
    const off = document.createElement('canvas');
    off.width = sw;
    off.height = sh;
    const octx = off.getContext('2d');
    octx.drawImage(ctx.canvas, 0, 0, sw, sh);
    const imgData = octx.getImageData(0, 0, sw, sh);
    return computeBlurVariance(imgData);
  }

  function handleTakePhoto() {
    if (!stream) { return; }
    const v = video();
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0);
    const variance = computeVarianceFromCanvas(ctx, canvas.width, canvas.height);
    canvas.toBlob(function (blob) {
      deliverCapture(blob, variance);
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
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const variance = computeVarianceFromCanvas(ctx, canvas.width, canvas.height);
      canvas.toBlob(function (blob) { deliverCapture(blob, variance); }, 'image/jpeg', 0.9);
    };
    img.src = url;
  }

  function deliverCapture(blob, variance) {
    if (onCaptureCallback) onCaptureCallback(blob, variance);
  }

  function handleBack() {
    if (onCancelCallback) onCancelCallback();
  }

  window.Camera = { open, close, computeBlurVariance };
})();
