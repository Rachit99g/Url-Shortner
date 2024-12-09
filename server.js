import express from 'express';
import bodyParser from 'body-parser'; // Default import for CommonJS module
import { isUri } from 'valid-url';
import { generate } from 'shortid';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// In-memory storage for URLs
const urlDatabase = {};

// Middleware
app.use(bodyParser.json()); // Use body-parser to parse JSON request bodies
app.use(express.static(join(__dirname))); // Serve static files from the current directory

// Route to create short URL
app.post('/shorten', (req, res) => {
  const { originalUrl } = req.body;

  if (!isUri(originalUrl)) {
    return res.status(401).json('Invalid URL');
  }

  const shortUrl = generate();
  // Store the original URL in memory
  urlDatabase[shortUrl] = originalUrl;

  res.json({ originalUrl, shortUrl: `http://localhost:${port}/${shortUrl}` });
});

// Route to redirect to the original URL
app.get('/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.status(404).json('URL not found');
  }
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
