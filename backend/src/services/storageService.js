const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

let client = null;

function getSupabaseClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new ApiError(500, 'Supabase Storage is not configured');
  }

  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }

  return client;
}

function parseDataImage(imageData) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(imageData || '');

  if (!match) {
    throw new ApiError(400, 'Invalid image data. Expected data:image/...;base64,...');
  }

  const mimeType = match[1];
  const base64 = match[2];
  const extension = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  const buffer = Buffer.from(base64, 'base64');

  return { mimeType, extension, buffer };
}

async function uploadDataImage({ imageData, folder = 'uploads', filePrefix = 'image' }) {
  const supabase = getSupabaseClient();
  const { mimeType, extension, buffer } = parseDataImage(imageData);

  if (buffer.length > 2.5 * 1024 * 1024) {
    throw new ApiError(413, 'Image is too large. Please upload a smaller image.');
  }

  const safePrefix = String(filePrefix).replace(/[^a-zA-Z0-9-_]/g, '-');
  const path = `${folder}/${safePrefix}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(env.supabaseMediaBucket)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new ApiError(500, 'Supabase image upload failed', error);
  }

  const { data } = supabase.storage
    .from(env.supabaseMediaBucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

module.exports = { uploadDataImage };
