const express = require('express');

const json2csv = require('json2csv').parse;
const supabase = require('../supaBaseclient');

const router = express.Router();
const Image = require('../models/Image');

router.get('/:requestId', async (req, res) => {
  try {
    console.log('Request ID:', req.params.requestId);


    const images = await Image.find({ requestId: req.params.requestId });


    const csvData = images.map(img => {
      return img.inputUrls.map((url, index) => ({
        'Request ID': req.params.requestId,
        'Product Name': img.productName,
        'Input URL': url,
        'Output URL': img.outputUrls[index] || '',
      }));
    }).flat();


    const csv = json2csv(csvData);
    const fileName = `request-${req.params.requestId}.csv`;


    const { data, error } = await supabase
      .storage
      .from('csvstorage') 
      .upload(fileName, Buffer.from(csv), {
        cacheControl: '3600', 
        upsert: true, 
      });

    if (error) {
      throw error;
    }


    const publicUrl = await supabase.storage
      .from('csvstorage')
      .getPublicUrl(fileName)
    console.log('Public URL:', publicUrl);

    res.json({ fileUrl: publicUrl });

  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Error generating CSV file' });
  }
});

module.exports = router;
