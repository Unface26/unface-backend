# Unface Backend - Age Detection API

Backend service for Unface age detection using AWS Rekognition.

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure AWS Credentials

#### Option A: Create AWS Account (if you don't have one)
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the signup process

#### Option B: Set up Rekognition
1. Log into AWS Console
2. Go to IAM (Identity and Access Management)
3. Create a new IAM user:
   - **Username**: `unface-rekognition`
   - **Access type**: Programmatic access
   - **Permissions**: Attach policy `AmazonRekognitionFullAccess`
4. Save the Access Key ID and Secret Access Key

#### Option C: Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your AWS credentials:
   ```
   AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
   AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
   AWS_REGION=us-east-1
   PORT=3001
   ```

### 3. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### 4. Test the API

```bash
curl http://localhost:3001/health
```

You should see: `{"status":"ok","service":"unface-age-detection"}`

## Deployment Options

### Option 1: Railway (Easiest - FREE tier)
1. Go to https://railway.app
2. Connect your GitHub repo
3. Add environment variables in Railway dashboard
4. Deploy!

### Option 2: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect repo
4. Add environment variables
5. Deploy

### Option 3: AWS Lambda (Most cost-effective for production)
1. Use Serverless Framework or AWS SAM
2. Deploy as Lambda function
3. Minimal cost (~$0 for small usage)

## Frontend Configuration

After deploying backend, update frontend `.env`:

```
VITE_AGE_DETECTION_API_URL=https://your-backend-url.com
```

## Cost Estimate

- **AWS Rekognition**: $1 per 1,000 face detections
- **Estimated monthly cost** (10,000 users, 2 checks per call): ~$20
- **Free tier**: First 5,000 detections free per month

## API Endpoints

### POST /api/detect-age

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response:**
```json
{
  "ageRange": {
    "low": 25,
    "high": 32
  },
  "estimatedAge": 28,
  "isAdult": true,
  "confidence": 99.5
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "unface-age-detection"
}
```

## Security Notes

- Never commit `.env` to git
- Use environment variables in production
- Consider adding API key authentication
- Rate limit to prevent abuse
- Monitor AWS costs

## Troubleshooting

### "No face detected"
- Ensure image quality is good
- Face must be clearly visible
- Image must be in JPEG/PNG format

### "AWS credentials error"
- Verify credentials in `.env`
- Check IAM user has Rekognition permissions
- Ensure region is correct

### "Request too large"
- Reduce image quality in frontend
- Current limit: 10MB
- AWS max: 5MB per image
