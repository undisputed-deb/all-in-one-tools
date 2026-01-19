# Document & Image Processing Service

yo this is a full-stack app for processing documents, images, and videos. built with spring boot backend and react frontend. pretty straightforward stuff.

## what it does

- **pdf stuff**: merge, split, compress, protect with passwords, add page numbers, convert to images
- **image editing**: resize, crop, rotate, convert formats, compress
- **video editing**: add text overlays, add image watermarks, change playback speed, merge multiple videos

## tech stack

**backend**
- spring boot 3.x
- java 17
- jwt auth
- ffmpeg for video processing
- imagemagick for images
- apache pdfbox for pdfs

**frontend**
- react + typescript
- vite
- tailwind css
- axios for api calls

## getting started

### prerequisites

you need these installed:
- java 17+
- node.js 18+
- maven
- ffmpeg
- imagemagick

### backend setup

```bash
cd backend
mvn clean install
./start.sh
```

backend runs on `http://localhost:8080`

### frontend setup

```bash
cd frontend
npm install
npm run dev
```

frontend runs on `http://localhost:5173`

## environment variables

**backend** (`backend/.env`)
```
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000
```

**frontend** (`frontend/.env`)
```
VITE_API_URL=http://localhost:8080
```

## api endpoints

### auth
- `POST /api/auth/register` - create account
- `POST /api/auth/login` - get jwt token

### pdf
- `POST /api/pdf/merge` - merge multiple pdfs
- `POST /api/pdf/split` - split pdf into pages
- `POST /api/pdf/compress` - reduce file size
- `POST /api/pdf/protect` - add password protection
- `POST /api/pdf/add-page-numbers` - add page numbers
- `POST /api/pdf/to-jpg` - convert to jpg images
- `POST /api/pdf/to-png` - convert to png images
- `POST /api/pdf/from-images` - create pdf from images
- `POST /api/pdf/from-excel` - convert excel to pdf

### image
- `POST /api/image/resize` - resize image
- `POST /api/image/crop` - crop image
- `POST /api/image/rotate` - rotate image
- `POST /api/image/convert` - convert format
- `POST /api/image/compress` - compress image

### video
- `POST /api/video/add-text` - add text overlay
- `POST /api/video/add-image` - add image watermark
- `POST /api/video/change-speed` - adjust playback speed
- `POST /api/video/merge` - merge multiple videos

## authentication

all endpoints except `/api/auth/**` require jwt token in header:
```
Authorization: Bearer <your-token>
```

## file storage

processed files are temporarily stored in `backend/temp/` and can be downloaded via:
```
GET /api/{service}/download/{filename}
```

## deployment

check `render.yaml` for deployment config. works with render.com out of the box.

## security features

- jwt authentication
- bcrypt password hashing
- cors configuration
- rate limiting
- input validation

## notes

- temp files are auto-cleaned after processing
- max file upload size is configurable in spring boot properties
- video processing requires ffmpeg installed on system
- image processing requires imagemagick installed

## license

do whatever you want with it

## contributing

prs welcome. just keep it clean and working.
