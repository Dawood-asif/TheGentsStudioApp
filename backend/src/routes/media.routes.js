const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { uploadDataImage } = require('../services/storageService');

const router = express.Router();

router.post('/upload-image', validate(z.object({
  body: z.object({
    imageData: z.string().min(40),
    folder: z.string().optional(),
    filePrefix: z.string().optional(),
  }),
})), asyncHandler(async (req, res) => {
  const publicUrl = await uploadDataImage({
    imageData: req.body.imageData,
    folder: req.body.folder || 'uploads',
    filePrefix: req.body.filePrefix || 'image',
  });

  res.status(201).json({
    success: true,
    data: { url: publicUrl },
  });
}));

module.exports = router;
