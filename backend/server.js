import express from 'express';
import cors from 'cors';
import axios from 'axios';
import http from 'http';
import https from 'https';
import { parseHtml } from './parser.js';
import dotenv from 'dotenv';

dotenv.config();

const httpAgent = new http.Agent({ maxHeaderSize: 65536 });
const httpsAgent = new https.Agent({ maxHeaderSize: 65536 });

const app = express();
const PORT = process.env.PORT || 3001;

const frontendUrlRaw = process.env.VITE_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
const frontendUrl = frontendUrlRaw.replace(/\/$/, '');

app.use(cors({ 
  origin: [frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173', 'https://page-pulse-six-sigma.vercel.app'] 
}));
app.use(express.json());
app.disable("x-powered-by");

app.post('/api/audit', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: { code: 400, message: 'URL is required' } });
  }

  let validUrl;
  try {
    validUrl = new URL(url);
    if (!['http:', 'https:'].includes(validUrl.protocol)) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Invalid protocol. Use http or https.' } });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: { code: 400, message: 'Invalid URL format' } });
  }

  const startTime = Date.now();

  try {
    const response = await axios.get(validUrl.href, {
      timeout: 10000,
      validateStatus: () => true,
      maxRedirects: 5,
      decompress: true,

      maxContentLength: 5 * 1024 * 1024,
      maxBodyLength: 5 * 1024 * 1024,

      httpAgent,
      httpsAgent,

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",

        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

        "Accept-Language":
          "en-US,en;q=0.9",

        "Accept-Encoding":
          "gzip, deflate, br"
      }
    });

    const responseTime = Date.now() - startTime;
    const contentType = response.headers['content-type'] || '';

    if (response.status === 401) {
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: "Authentication is required to access this page."
        }
      });
    }

    if (response.status === 403) {
      return res.status(403).json({
        success: false,
        error: {
          code: 403,
          message: "This website blocks automated requests and cannot be analyzed."
        }
      });
    }

    if (response.status === 429) {
      return res.status(429).json({
        success: false,
        error: {
          code: 429,
          message: "Too many requests. The website is rate limiting access."
        }
      });
    }

    const isHtml =
      contentType.startsWith("text/html") ||
      contentType.includes("application/xhtml+xml");

    if (!isHtml) {
      return res.status(415).json({
        success: false,
        error: {
          code: 415,
          message: "URL does not point to an HTML page."
        }
      });
    }

    const report = parseHtml(response.data);

    res.json({
      success: true,
      data: {
        status: response.status,
        responseTime,
        finalUrl:
          response.request?.res?.responseUrl || validUrl.href,
        ...report
      }
    });
  } catch (error) {

    const responseTime = Date.now() - startTime;

    let statusCode = 500;
    let message = "Unexpected server error.";

    switch (error.code) {

      case "ECONNABORTED":
        statusCode = 504;
        message = "The request timed out.";
        break;

      case "ENOTFOUND":
        statusCode = 404;
        message = "Domain could not be resolved.";
        break;

      case "ECONNREFUSED":
        statusCode = 502;
        message = "Connection was refused by the remote server.";
        break;

      case "ECONNRESET":
        statusCode = 502;
        message = "Connection was reset by the remote server.";
        break;

      case "ERR_BAD_RESPONSE":
        statusCode = 502;
        message = "The remote server returned an invalid response.";
        break;

      case "ERR_NETWORK":
        statusCode = 502;
        message = "Unable to reach the website.";
        break;

      default:
        if (error.message?.includes("Header overflow")) {
          statusCode = 502;
          message = "The target server returned too many headers.";
        }
        else if (error.request) {
          statusCode = 502;
          message = "No response was received from the website.";
        }
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode,
        message,
        details: error.message
      },
      responseTime
    });


  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
