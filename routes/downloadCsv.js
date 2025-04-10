const express = require('express');
const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv').parse;
const supabase = require('../supaBaseclient');
const Request = require('../models/Request');
const router = express.Router();
const Image = require('../models/Image');

router.get('/:requestId', async (req, res) => {
  try {
    console.log('Request ID:', req.params.requestId);
    // const request = await Request.findOne({ requestId: req.params.requestId });
    // console.log('Request:', request);
    // if (!request) {
    //   return res.status(402).json({ error: 'Request not found' });
    // }

    const images = await Image.find({ requestId: req.params.requestId });

    // Prepare CSV data
    const csvData = images.map(img => {
      return img.inputUrls.map((url, index) => ({
        'Request ID': req.params.requestId,
        'Product Name': img.productName,
        'Input URL': url,
        'Output URL': img.outputUrls[index] || '',
      }));
    }).flat();

    // Convert the data to CSV format
    const csv = json2csv(csvData);
    const fileName = `request-${req.params.requestId}.csv`;

    // Upload the CSV file to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('csvstorage') // Make sure your bucket name is correct
      .upload(fileName, Buffer.from(csv), {
        cacheControl: '3600', // Set cache control to 1 hour
        upsert: true, // If the file already exists, overwrite it
      });

    if (error) {
      throw error;
    }

    // Get the public URL of the uploaded file
    const publicUrl = await supabase.storage
      .from('csvstorage')
      .getPublicUrl(fileName)
    console.log('Public URL:', publicUrl);
    // Return the public URL to the client
    res.json({ fileUrl: publicUrl });

  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Error generating CSV file' });
  }
});

module.exports = router;
