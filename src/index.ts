import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RekognitionClient, DetectFacesCommand } from '@aws-sdk/client-rekognition';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large base64 images

// AWS Rekognition client
const rekognitionClient = new RekognitionClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

interface AgeDetectionRequest {
    image: string; // base64 encoded image
}

interface AgeDetectionResponse {
    ageRange: {
        low: number;
        high: number;
    };
    estimatedAge: number;
    isAdult: boolean;
    confidence: number;
}

// Age detection endpoint
app.post('/api/detect-age', async (req, res) => {
    try {
        const { image }: AgeDetectionRequest = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        // Remove base64 prefix if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Call AWS Rekognition
        const command = new DetectFacesCommand({
            Image: {
                Bytes: imageBuffer,
            },
            Attributes: ['ALL'], // Include age range and other attributes
        });

        const response = await rekognitionClient.send(command);

        if (!response.FaceDetails || response.FaceDetails.length === 0) {
            return res.status(404).json({ error: 'No face detected in image' });
        }

        // Get the first face (primary face)
        const face = response.FaceDetails[0];

        if (!face.AgeRange) {
            return res.status(500).json({ error: 'Age range not available' });
        }

        const ageRange = {
            low: face.AgeRange.Low || 0,
            high: face.AgeRange.High || 0,
        };

        const estimatedAge = Math.round((ageRange.low + ageRange.high) / 2);

        // ADJUSTED: Use estimated age (average) instead of LOW age to reduce false positives
        // Flag as minor only if ESTIMATED age is under 16 (very conservative)
        // This prevents cases like "17-23" from being flagged (estimated: 20)
        const isAdult = estimatedAge >= 16;

        const ageDetectionResponse: AgeDetectionResponse = {
            ageRange,
            estimatedAge,
            isAdult,
            confidence: face.Confidence || 0,
        };

        console.log('[Age Detection]', {
            ageRange,
            estimatedAge,
            isAdult,
            confidence: face.Confidence,
            reasoning: `Estimated age ${estimatedAge} → ${isAdult ? 'ADULT' : 'MINOR'}`,
        });

        return res.json(ageDetectionResponse);
    } catch (error) {
        console.error('[Age Detection Error]', error);
        return res.status(500).json({
            error: 'Failed to detect age',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'unface-age-detection' });
});

app.listen(PORT, () => {
    console.log(`🚀 Unface Age Detection API running on port ${PORT}`);
    console.log(`   AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
});
