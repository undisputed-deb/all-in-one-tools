# Document & Image Processing Platform

A **production-grade** full-stack web application for processing PDFs and images, built with modern technologies and security best practices.

## Screenshots

*(To be added after UI implementation)*

## Features

### PDF Tools
- **Merge PDFs** - Combine multiple PDF files into one
- **Split PDF** - Split PDF into multiple files by page count
- **Compress PDF** - Reduce PDF file size
- **Password Protect PDF** - Add password protection to PDFs
- **Add Page Numbers** - Add page numbers to PDF documents
- **PDF → JPG/PNG** - Convert PDF pages to images
- **Images → PDF** - Convert multiple images to PDF
- **Excel → PDF** - Convert Excel files to PDF

### Image Tools
- **Upload & Process** - Upload images for processing
- **Resize** - Change image dimensions
- **Crop** - Crop images to specific dimensions
- **Rotate** - Rotate images by any angle
- **Convert Format** - Convert between JPG, PNG, WEBP
- **Compress** - Reduce image file size

## Tech Stack

### Backend
- **Java 17** - Modern Java version
- **Spring Boot 3.3.0** - Production-ready framework
- **Spring Security** - JWT-based authentication
- **Maven** - Dependency management
- **Apache PDFBox** - PDF processing
- **Apache POI** - Excel processing
- **Thumbnailator** - Image processing
- **Bucket4j** - Rate limiting
- **Local Filesystem** - No cloud dependencies

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **lucide-react** - Icon library

## Security Features

### JWT Authentication
- Stateless authentication using JSON Web Tokens
- Eliminates need for server-side sessions
- Enables horizontal scaling
- Tokens are signed with HMAC-SHA256 to prevent tampering

### CORS Configuration
- Controls cross-origin resource sharing
- Prevents unauthorized domains from accessing the API
- Configured for localhost during development
- Should be restricted to specific domains in production

### CSRF Protection
- Disabled for stateless JWT authentication
- Not needed because we don't use cookies or session tokens
- JWT in Authorization header is not vulnerable to CSRF

### Session Management
- Stateless session policy
- No server-side sessions created
- Each request is authenticated independently via JWT

### File Security
- File size limits (50MB max)
- MIME type validation
- Prevents directory traversal attacks
- Secure file storage with UUID naming

### Rate Limiting
- Prevents DoS attacks by limiting requests per user
- Protects CPU-intensive operations (PDF/image processing)
- Ensures fair access for all users
- Uses token bucket algorithm (10 requests per 60 seconds)

## Project Structure

```
.
├── backend/
│   ├── src/main/java/com/docprocessor/
│   │   ├── controller/          # REST API controllers
│   │   │   ├── AuthController
│   │   │   ├── PdfController
│   │   │   └── ImageController
│   │   ├── service/             # Business logic
│   │   │   ├── pdf/
│   │   │   │   ├── PdfService
│   │   │   │   └── PdfServiceImpl
│   │   │   └── image/
│   │   │       ├── ImageService
│   │   │       └── ImageServiceImpl
│   │   ├── storage/             # File storage
│   │   │   ├── StorageService
│   │   │   └── LocalStorageService
│   │   ├── security/            # JWT & authentication
│   │   │   ├── JwtUtil
│   │   │   ├── JwtAuthenticationFilter
│   │   │   ├── CustomUserDetailsService
│   │   │   └── SecurityConfig
│   │   ├── exception/           # Error handling
│   │   │   ├── GlobalExceptionHandler
│   │   │   ├── StorageException
│   │   │   ├── ProcessingException
│   │   │   ├── InvalidFileException
│   │   │   └── RateLimitExceededException
│   │   ├── dto/                 # Data transfer objects
│   │   │   ├── AuthRequest
│   │   │   ├── AuthResponse
│   │   │   ├── ProcessingResponse
│   │   │   └── ErrorResponse
│   │   └── config/              # Configuration
│   │       ├── SecurityConfig
│   │       └── RateLimitConfig
│   ├── pom.xml
│   └── start.sh
│
└── frontend/
    ├── src/
    │   ├── components/ui/       # Reusable UI components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   └── input.tsx
    │   ├── services/            # API integration
    │   │   └── api.ts
    │   ├── lib/                 # Utilities
    │   │   └── utils.ts
    │   ├── pages/               # Page components
    │   └── App.tsx
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

## Local Setup Instructions

### Prerequisites
- **Java 17** (OpenJDK recommended)
- **Maven 3.6+**
- **Node.js 18+** and npm

### Backend Setup

1. **Install Java 17** (if not already installed):
   ```bash
   # On macOS with Homebrew
   brew install openjdk@17

   # Add to PATH
   echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

3. **Set environment variables** (optional):
   ```bash
   export JWT_SECRET=your-super-secret-key-at-least-256-bits
   ```

4. **Build and run**:
   ```bash
   # Using the start script
   ./start.sh

   # Or manually
   export JAVA_HOME=/opt/homebrew/opt/openjdk@17
   mvn spring-boot:run
   ```

5. **Backend will start on**: `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```bash
   echo "VITE_API_URL=http://localhost:8080" > .env
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Frontend will start on**: `http://localhost:5173`

## API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Demo Users**:
- Username: `admin`, Password: `admin123`
- Username: `user`, Password: `user123`

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "expiresIn": 86400000
}
```

#### Validate Token
```http
GET /api/auth/validate
Authorization: Bearer <token>
```

### PDF Operations

All PDF endpoints require authentication via JWT token in the Authorization header.

#### Merge PDFs
```http
POST /api/pdf/merge
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [file1.pdf, file2.pdf, ...]
```

#### Split PDF
```http
POST /api/pdf/split
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: document.pdf
pageCount: 5
```

#### Compress PDF
```http
POST /api/pdf/compress
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: document.pdf
```

#### Password Protect PDF
```http
POST /api/pdf/protect
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: document.pdf
password: mySecurePassword
```

#### Add Page Numbers
```http
POST /api/pdf/add-page-numbers
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: document.pdf
```

#### PDF to JPG/PNG
```http
POST /api/pdf/to-jpg
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: document.pdf
```

#### Images to PDF
```http
POST /api/pdf/from-images
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [image1.jpg, image2.png, ...]
```

#### Excel to PDF
```http
POST /api/pdf/from-excel
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: spreadsheet.xlsx
```

### Image Operations

All image endpoints require authentication via JWT token.

#### Resize Image
```http
POST /api/image/resize
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: image.jpg
width: 800
height: 600
```

#### Crop Image
```http
POST /api/image/crop
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: image.jpg
x: 100
y: 100
width: 400
height: 300
```

#### Rotate Image
```http
POST /api/image/rotate
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: image.jpg
angle: 90
```

#### Convert Image Format
```http
POST /api/image/convert
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: image.jpg
format: png
```

#### Compress Image
```http
POST /api/image/compress
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: image.jpg
quality: 0.8
```

## Testing the API

### Using curl

1. **Login**:
   ```bash
   TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}' \
     | jq -r '.token')
   ```

2. **Compress a PDF**:
   ```bash
   curl -X POST http://localhost:8080/api/pdf/compress \
     -H "Authorization: Bearer $TOKEN" \
     -F "file=@document.pdf" \
     -o compressed.pdf
   ```

3. **Resize an image**:
   ```bash
   curl -X POST http://localhost:8080/api/image/resize \
     -H "Authorization: Bearer $TOKEN" \
     -F "file=@photo.jpg" \
     -F "width=800" \
     -F "height=600" \
     -o resized.jpg
   ```

## Environment Variables

### Backend
Create a `.env` file or set environment variables:

```bash
# JWT Secret (minimum 256 bits)
JWT_SECRET=your-256-bit-secret-key-change-this-in-production-environment

# Optional overrides
SERVER_PORT=8080
STORAGE_LOCATION=./uploads
TEMP_STORAGE_LOCATION=./temp
MAX_FILE_SIZE=52428800
```

### Frontend
Create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:8080
```

## Production Deployment Notes

### Backend
1. **Use a strong JWT secret** (at least 256 bits, random)
2. **Configure CORS** for your production domain
3. **Enable HTTPS** (use nginx or similar as reverse proxy)
4. **Set up proper logging** (Logback configuration)
5. **Configure file cleanup** (scheduled task for temp files)
6. **Use a process manager** (systemd, PM2, or Docker)
7. **Set up monitoring** (Spring Boot Actuator + Prometheus)

### Frontend
1. **Build for production**: `npm run build`
2. **Serve static files** via nginx or CDN
3. **Update API URL** in environment variables
4. **Enable HTTPS**
5. **Configure CSP headers**

## License

This project is for educational and demonstration purposes.

## Credits

Built with:
- Spring Boot Team
- React Team
- Tailwind Labs
- shadcn/ui
- Apache PDFBox
- Apache POI
- Thumbnailator
- Bucket4j

---

**Note**: This is a demonstration project. For production use, consider:
- Database integration for user management
- Cloud storage (AWS S3, Google Cloud Storage)
- Horizontal scaling with load balancers
- Comprehensive test coverage
- CI/CD pipeline
- Security audits
