import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Image, Upload, Download, Merge, Scissors, Minimize2, Lock, Hash, FileImage, File, RotateCw, Crop, Video, Type, ImagePlus, Gauge } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { authAPI, pdfAPI, imageAPI, videoAPI, downloadFile } from './services/api'
import BalloonBackground from './components/ui/balloons-pop-background'
import './App.css'

function App() {
  const navigate = useNavigate()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'pdf' | 'image' | 'video'>('pdf')

  // Parameters for various operations
  const [width, setWidth] = useState('800')
  const [height, setHeight] = useState('600')
  const [pageCount, setPageCount] = useState('5')
  const [pdfPassword, setPdfPassword] = useState('')
  const [quality, setQuality] = useState('0.7')
  const [angle, setAngle] = useState('90')
  const [cropX, setCropX] = useState('0')
  const [cropY, setCropY] = useState('0')
  const [cropWidth, setCropWidth] = useState('400')
  const [cropHeight, setCropHeight] = useState('300')
  const [convertFormat, setConvertFormat] = useState('png')

  // Video parameters
  const [videoText, setVideoText] = useState('')
  const [textPosition, setTextPosition] = useState('bottom-left')
  const [fontSize, setFontSize] = useState('24')
  const [textColor, setTextColor] = useState('white')
  const [imagePosition, setImagePosition] = useState('top-left')
  const [videoSpeed, setVideoSpeed] = useState('1.0')
  const [overlayImage, setOverlayImage] = useState<File | null>(null)

  const handleLogout = () => {
    authAPI.logout()
    navigate('/signin')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
      setMessage('')
    }
  }

  // PDF Handlers
  const handlePdfCompress = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select a PDF file first')
      return
    }
    setProcessing(true)
    try {
      const response = await pdfAPI.compress(selectedFiles[0])
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`PDF compressed successfully! Size: ${(data.fileSize / 1024).toFixed(2)} KB`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to compress PDF'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handlePdfMerge = async () => {
    if (selectedFiles.length < 2) {
      setMessage('Please select at least 2 PDF files to merge')
      return
    }
    setProcessing(true)
    try {
      const response = await pdfAPI.merge(selectedFiles)
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`PDFs merged successfully! Size: ${(data.fileSize / 1024).toFixed(2)} KB`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to merge PDFs'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handlePdfSplit = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select a PDF file to split')
      return
    }
    setProcessing(true)
    try {
      const response = await pdfAPI.split(selectedFiles[0], parseInt(pageCount))
      const files = response.data
      for (const file of files) {
        await downloadFile(file.downloadUrl, file.filename)
      }
      setMessage(`PDF split into ${files.length} files successfully!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to split PDF'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handlePdfProtect = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select a PDF file to protect')
      return
    }
    if (!pdfPassword) {
      setMessage('Please enter a password')
      return
    }
    setProcessing(true)
    try {
      const response = await pdfAPI.protect(selectedFiles[0], pdfPassword)
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`PDF protected successfully!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to protect PDF'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handlePdfAddPageNumbers = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select a PDF file')
      return
    }
    setProcessing(true)
    try {
      const response = await pdfAPI.addPageNumbers(selectedFiles[0])
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`Page numbers added successfully!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to add page numbers'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handlePdfToJpg = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select a PDF file')
      return
    }
    setProcessing(true)
    try {
      const response = await pdfAPI.toJpg(selectedFiles[0])
      const files = response.data
      for (const file of files) {
        await downloadFile(file.downloadUrl, file.filename)
      }
      setMessage(`PDF converted to ${files.length} JPG images!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to convert to JPG'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handlePdfToPng = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select a PDF file')
      return
    }
    setProcessing(true)
    try {
      const response = await pdfAPI.toPng(selectedFiles[0])
      const files = response.data
      for (const file of files) {
        await downloadFile(file.downloadUrl, file.filename)
      }
      setMessage(`PDF converted to ${files.length} PNG images!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to convert to PNG'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleImagesToPdf = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select image files')
      return
    }
    setProcessing(true)
    try {
      const response = await pdfAPI.fromImages(selectedFiles)
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`Images converted to PDF successfully!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to convert images to PDF'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleExcelToPdf = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select an Excel file')
      return
    }
    setProcessing(true)
    try {
      const response = await pdfAPI.fromExcel(selectedFiles[0])
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`Excel converted to PDF successfully!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to convert Excel to PDF'}`)
    } finally {
      setProcessing(false)
    }
  }

  // Image Handlers
  const handleImageResize = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select an image file')
      return
    }
    setProcessing(true)
    try {
      const response = await imageAPI.resize(selectedFiles[0], parseInt(width), parseInt(height))
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`Image resized to ${width}x${height}! Size: ${(data.fileSize / 1024).toFixed(2)} KB`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to resize image'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleImageCrop = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select an image file')
      return
    }
    setProcessing(true)
    try {
      const response = await imageAPI.crop(
        selectedFiles[0],
        parseInt(cropX),
        parseInt(cropY),
        parseInt(cropWidth),
        parseInt(cropHeight)
      )
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`Image cropped successfully!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to crop image'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleImageRotate = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select an image file')
      return
    }
    setProcessing(true)
    try {
      const response = await imageAPI.rotate(selectedFiles[0], parseFloat(angle))
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`Image rotated ${angle} degrees!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to rotate image'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleImageConvert = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select an image file')
      return
    }
    setProcessing(true)
    try {
      const response = await imageAPI.convert(selectedFiles[0], convertFormat)
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`Image converted to ${convertFormat.toUpperCase()}!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to convert image'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleImageCompress = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select an image file')
      return
    }
    setProcessing(true)
    try {
      const response = await imageAPI.compress(selectedFiles[0], parseFloat(quality))
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`Image compressed! Size: ${(data.fileSize / 1024).toFixed(2)} KB`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to compress image'}`)
    } finally {
      setProcessing(false)
    }
  }

  // Video Handlers
  const handleVideoAddText = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select a video file')
      return
    }
    if (!videoText) {
      setMessage('Please enter text to add')
      return
    }
    setProcessing(true)
    try {
      const response = await videoAPI.addText(selectedFiles[0], videoText, textPosition, parseInt(fontSize), textColor)
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`Text added to video successfully!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to add text to video'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleVideoAddImage = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select a video file')
      return
    }
    if (!overlayImage) {
      setMessage('Please select an overlay image')
      return
    }
    setProcessing(true)
    try {
      const response = await videoAPI.addImage(selectedFiles[0], overlayImage, imagePosition)
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`Image overlay added to video successfully!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to add image to video'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleVideoChangeSpeed = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select a video file')
      return
    }
    setProcessing(true)
    try {
      const response = await videoAPI.changeSpeed(selectedFiles[0], parseFloat(videoSpeed))
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`Video speed changed to ${videoSpeed}x!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to change video speed'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleVideoMerge = async () => {
    if (selectedFiles.length < 2) {
      setMessage('Please select at least 2 video files to merge')
      return
    }
    setProcessing(true)
    try {
      const response = await videoAPI.merge(selectedFiles)
      const data = response.data
      await downloadFile(data.downloadUrl, data.filename)
      setMessage(`Videos merged successfully!`)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to merge videos'}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Balloon Background */}
      <BalloonBackground />

      {/* Main Content - positioned on top of background */}
      <div className="relative z-10 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Document & Image Processor</h1>
          <Button onClick={handleLogout} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">Logout</Button>
        </div>

        {/* File Upload and Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-6 w-6 text-blue-600" />
                <CardTitle>Upload Files</CardTitle>
              </div>
              <CardDescription>Select PDF or image files to process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.mp4,.mov,.avi,.mkv,.webm"
                  multiple
                  className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer cursor-pointer"
                />
                <p className="text-xs text-white/50">Hold Ctrl/Cmd to select multiple files</p>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="font-semibold text-green-400 mb-2">
                    ✓ {selectedFiles.length} file(s) selected:
                  </p>
                  <div className="space-y-1">
                    {selectedFiles.map((file, idx) => (
                      <p key={idx} className="text-sm text-white/80">
                        {idx + 1}. {file.name} <span className="text-white/50">({(file.size / 1024).toFixed(2)} KB)</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-6 w-6 text-green-600" />
                <CardTitle>Status</CardTitle>
              </div>
              <CardDescription>Processing status and downloads</CardDescription>
            </CardHeader>
            <CardContent>
              {processing ? (
                <p className="text-blue-300 font-semibold">Processing...</p>
              ) : message ? (
                <p className="text-sm text-white">{message}</p>
              ) : (
                <p className="text-sm text-white/60">Ready to process files</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('pdf')}
            variant={activeTab === 'pdf' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            PDF Tools
          </Button>
          <Button
            onClick={() => setActiveTab('image')}
            variant={activeTab === 'image' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Image className="h-4 w-4" />
            Image Tools
          </Button>
          <Button
            onClick={() => setActiveTab('video')}
            variant={activeTab === 'video' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Video Tools
          </Button>
        </div>

        {/* PDF Tools */}
        {activeTab === 'pdf' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Compress PDF */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Minimize2 className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Compress PDF</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handlePdfCompress}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Compress
                </Button>
              </CardContent>
            </Card>

            {/* Merge PDFs */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Merge className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Merge PDFs</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-white/60 mb-2">Select 2+ PDFs</p>
                <Button
                  onClick={handlePdfMerge}
                  disabled={selectedFiles.length < 2 || processing}
                  className="w-full"
                >
                  Merge
                </Button>
              </CardContent>
            </Card>

            {/* Split PDF */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Split PDF</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  type="number"
                  placeholder="Pages per file"
                  value={pageCount}
                  onChange={(e) => setPageCount(e.target.value)}
                  min="1"
                />
                <Button
                  onClick={handlePdfSplit}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Split
                </Button>
              </CardContent>
            </Card>

            {/* Protect PDF */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg">Protect PDF</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                />
                <Button
                  onClick={handlePdfProtect}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Protect
                </Button>
              </CardContent>
            </Card>

            {/* Add Page Numbers */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Page Numbers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handlePdfAddPageNumbers}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Add Numbers
                </Button>
              </CardContent>
            </Card>

            {/* PDF to JPG */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-pink-600" />
                  <CardTitle className="text-lg">PDF to JPG</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handlePdfToJpg}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Convert to JPG
                </Button>
              </CardContent>
            </Card>

            {/* PDF to PNG */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-teal-600" />
                  <CardTitle className="text-lg">PDF to PNG</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handlePdfToPng}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Convert to PNG
                </Button>
              </CardContent>
            </Card>

            {/* Images to PDF */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <File className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-lg">Images to PDF</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-white/60 mb-2">Select image files</p>
                <Button
                  onClick={handleImagesToPdf}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Create PDF
                </Button>
              </CardContent>
            </Card>

            {/* Excel to PDF */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-700" />
                  <CardTitle className="text-lg">Excel to PDF</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-white/60 mb-2">Select .xlsx file</p>
                <Button
                  onClick={handleExcelToPdf}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Convert
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Image Tools */}
        {activeTab === 'image' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Resize Image */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Minimize2 className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Resize Image</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  type="number"
                  placeholder="Width"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  min="1"
                />
                <Input
                  type="number"
                  placeholder="Height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="1"
                />
                <Button
                  onClick={handleImageResize}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Resize
                </Button>
              </CardContent>
            </Card>

            {/* Crop Image */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crop className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Crop Image</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="X"
                    value={cropX}
                    onChange={(e) => setCropX(e.target.value)}
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder="Y"
                    value={cropY}
                    onChange={(e) => setCropY(e.target.value)}
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder="Width"
                    value={cropWidth}
                    onChange={(e) => setCropWidth(e.target.value)}
                    min="1"
                  />
                  <Input
                    type="number"
                    placeholder="Height"
                    value={cropHeight}
                    onChange={(e) => setCropHeight(e.target.value)}
                    min="1"
                  />
                </div>
                <Button
                  onClick={handleImageCrop}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Crop
                </Button>
              </CardContent>
            </Card>

            {/* Rotate Image */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RotateCw className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Rotate Image</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  type="number"
                  placeholder="Angle (degrees)"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  step="1"
                />
                <Button
                  onClick={handleImageRotate}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Rotate
                </Button>
              </CardContent>
            </Card>

            {/* Convert Format */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Convert Format</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <select
                  className="w-full p-2 border border-white/20 bg-white/5 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white/40"
                  value={convertFormat}
                  onChange={(e) => setConvertFormat(e.target.value)}
                >
                  <option value="png" className="bg-zinc-900 text-white">PNG</option>
                  <option value="jpg" className="bg-zinc-900 text-white">JPG</option>
                  <option value="webp" className="bg-zinc-900 text-white">WEBP</option>
                </select>
                <Button
                  onClick={handleImageConvert}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Convert
                </Button>
              </CardContent>
            </Card>

            {/* Compress Image */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Minimize2 className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg">Compress Image</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  type="number"
                  placeholder="Quality (0.1 - 1.0)"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  min="0.1"
                  max="1.0"
                  step="0.1"
                />
                <Button
                  onClick={handleImageCompress}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Compress
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Video Tools */}
        {activeTab === 'video' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Add Text to Video */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Add Text to Video</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  type="text"
                  placeholder="Enter text"
                  value={videoText}
                  onChange={(e) => setVideoText(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="p-2 border border-white/20 bg-white/5 text-white rounded-md text-sm"
                    value={textPosition}
                    onChange={(e) => setTextPosition(e.target.value)}
                  >
                    <option value="top-left" className="bg-zinc-900">Top Left</option>
                    <option value="top-right" className="bg-zinc-900">Top Right</option>
                    <option value="bottom-left" className="bg-zinc-900">Bottom Left</option>
                    <option value="bottom-right" className="bg-zinc-900">Bottom Right</option>
                    <option value="center" className="bg-zinc-900">Center</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Font size"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    min="10"
                    max="100"
                  />
                </div>
                <select
                  className="w-full p-2 border border-white/20 bg-white/5 text-white rounded-md text-sm"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                >
                  <option value="white" className="bg-zinc-900">White</option>
                  <option value="black" className="bg-zinc-900">Black</option>
                  <option value="red" className="bg-zinc-900">Red</option>
                  <option value="yellow" className="bg-zinc-900">Yellow</option>
                  <option value="green" className="bg-zinc-900">Green</option>
                  <option value="blue" className="bg-zinc-900">Blue</option>
                </select>
                <Button
                  onClick={handleVideoAddText}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Add Text
                </Button>
              </CardContent>
            </Card>

            {/* Add Image to Video */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Add Image to Video</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-white/60">Select video above, then choose overlay image:</p>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={(e) => setOverlayImage(e.target.files?.[0] || null)}
                  className="w-full text-sm text-white file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-green-500 file:text-white"
                />
                <select
                  className="w-full p-2 border border-white/20 bg-white/5 text-white rounded-md text-sm"
                  value={imagePosition}
                  onChange={(e) => setImagePosition(e.target.value)}
                >
                  <option value="top-left" className="bg-zinc-900">Top Left</option>
                  <option value="top-right" className="bg-zinc-900">Top Right</option>
                  <option value="bottom-left" className="bg-zinc-900">Bottom Left</option>
                  <option value="bottom-right" className="bg-zinc-900">Bottom Right</option>
                  <option value="center" className="bg-zinc-900">Center</option>
                </select>
                <Button
                  onClick={handleVideoAddImage}
                  disabled={selectedFiles.length === 0 || !overlayImage || processing}
                  className="w-full"
                >
                  Add Image Overlay
                </Button>
              </CardContent>
            </Card>

            {/* Change Video Speed */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Change Video Speed</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  type="number"
                  placeholder="Speed (0.5 = slow, 2.0 = fast)"
                  value={videoSpeed}
                  onChange={(e) => setVideoSpeed(e.target.value)}
                  min="0.25"
                  max="4.0"
                  step="0.25"
                />
                <p className="text-xs text-white/60">0.5 = half speed, 1.0 = normal, 2.0 = double speed</p>
                <Button
                  onClick={handleVideoChangeSpeed}
                  disabled={selectedFiles.length === 0 || processing}
                  className="w-full"
                >
                  Change Speed
                </Button>
              </CardContent>
            </Card>

            {/* Merge Videos */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Merge className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Merge Videos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-white/60">Select 2+ video files to merge into one</p>
                <Button
                  onClick={handleVideoMerge}
                  disabled={selectedFiles.length < 2 || processing}
                  className="w-full"
                >
                  Merge Videos
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

export default App
