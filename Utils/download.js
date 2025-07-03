const https = require('https');
const fs = require('fs');

// Function to detect the type of image file
const detectImageType = (buffer) => {
  // Magic numbers for different image file formats
  const jpegMagicNumber = Buffer.from([0xFF, 0xD8, 0xFF]);
  const pngMagicNumber = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const gifMagicNumber = Buffer.from([0x47, 0x49, 0x46]);

  // Compare the first few bytes with magic numbers
  if (buffer.slice(0, 3).equals(jpegMagicNumber)) {
    return 'JPEG';
  } else if (buffer.slice(0, 8).equals(pngMagicNumber)) {
    return 'PNG';
  } else if (buffer.slice(0, 3).equals(gifMagicNumber)) {
    return 'GIF';
  } else {
    return 'Unknown'; // Unknown image type
  }
};

// Function to download a file from a URL
const downloadFile = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      // Check if response is successful
      if (response.statusCode !== 200) {
        reject(`Failed to download file, status code: ${response.statusCode}`);
        return;
      }
      const buffers = [];
      response.on('data', (chunk) => {
        buffers.push(chunk);
      });
      response.on('end', () => {
        const buffer = Buffer.concat(buffers);
        const fileType = detectImageType(buffer);
        const fileName = `downloaded-image.${fileType.toLowerCase()}`;
        const filePath = `./${fileName}`;
        fs.writeFile(filePath, buffer, (err) => {
          if (err) {
            reject(`Error saving file: ${err}`);
            return;
          }
          resolve({ fileType, filePath });
        });
      });
    }).on('error', err => {
      reject(`Error downloading file: ${err}`);
    });
  });
};

module.exports = { downloadFile };

