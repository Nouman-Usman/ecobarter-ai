'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Eye, Check, Wand2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { analyzeImageAndExtractDetails } from '@/lib/aiLogic';
import { useAuth } from '@/components/AuthProvider';
import { createItem } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';

const categories = [
  'Electronics',
  'Musical Instruments',
  'Kitchen',
  'Books',
  'Clothing',
  'Sports',
  'Tools',
  'Art & Crafts',
  'Home & Garden',
  'Toys & Games'
];

const conditions = [
  { value: 'excellent', label: 'Excellent (Like New)' },
  { value: 'good', label: 'Good (Minor Wear)' },
  { value: 'fair', label: 'Fair (Some Wear)' },
  { value: 'poor', label: 'Poor (Functional)' }
];

export default function UploadPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    category: '',
    condition: '',
    images: []
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event :any) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setImagePreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) return;
    
    setAnalyzingImage(true);
    try {
      const analyzedData = await analyzeImageAndExtractDetails(imageFile);
      
      // Update form data with analyzed information
      setFormData(prev => ({
        ...prev,
        title: analyzedData.title,
        description: analyzedData.description,
        value: analyzedData.value.toString(),
        category: analyzedData.category,
        condition: analyzedData.condition,
        images: [imageFile]
      }));
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      // You might want to show an error toast here
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    
    try {
      const itemData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        value: parseFloat(formData.value),
        images: imagePreview ? [imagePreview] : [],
        status: 'available' as const
      };

      const { data, error } = await createItem(itemData);
      
      if (error) {
        console.error('Error creating item:', error);
        // You might want to show an error toast here
        setLoading(false);
        return;
      }

      // Success! Redirect to matches
      router.push('/matches');
    } catch (error) {
      console.error('Error submitting item:', error);
      setLoading(false);
    }
  };

  // Show auth modal if user is not logged in
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-8">You need to sign in to list items for trade.</p>
          <Button 
            onClick={() => setShowAuthModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Sign In to Continue
          </Button>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Item</h1>
            <p className="text-gray-600">Share your item details to find the perfect trade</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {step} of 3</span>
              <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && 'Basic Information'}
                {step === 2 && 'Details & Pricing'}
                {step === 3 && 'Review & Submit'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Upload Image for AI Analysis</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          {imagePreview ? (
                            <div className="space-y-4">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="max-w-full max-h-48 mx-auto rounded-lg"
                              />
                              <p className="text-sm text-gray-600">Click to change image</p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500">Click to upload or drag and drop</p>
                              <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                            </>
                          )}
                        </label>
                      </div>
                      
                      {imageFile && (
                        <Button
                          onClick={handleAnalyzeImage}
                          disabled={analyzingImage}
                          className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                        >
                          {analyzingImage ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing Image...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4 mr-2" />
                              Analyze Image with AI
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-4">Or manually enter details:</p>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Item Title *</Label>
                          <Input
                            id="title"
                            placeholder="e.g., Vintage Acoustic Guitar"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            placeholder="Describe your item in detail..."
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="value">Estimated Value ($) *</Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder="450"
                      value={formData.value}
                      onChange={(e) => handleInputChange('value', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Condition *</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {!imageFile && (
                    <div className="space-y-2">
                      <Label>Images (Optional)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="additional-image-upload"
                        />
                        <label htmlFor="additional-image-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {imagePreview && (
                    <div className="space-y-2">
                      <Label>Current Image</Label>
                      <div className="border rounded-lg p-4">
                        <img 
                          src={imagePreview} 
                          alt="Item" 
                          className="max-w-full max-h-32 mx-auto rounded"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-green-600" />
                      Preview
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Title:</span>
                        <span className="ml-2 text-gray-900">{formData.title}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Description:</span>
                        <p className="mt-1 text-gray-900">{formData.description}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Value:</span>
                        <span className="ml-2 text-green-600 font-semibold">${formData.value}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Category:</span>
                        <span className="ml-2 text-gray-900">{formData.category}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Condition:</span>
                        <span className="ml-2 text-gray-900">
                          {conditions.find(c => c.value === formData.condition)?.label}
                        </span>
                      </div>
                      {imagePreview && (
                        <div>
                          <span className="font-medium text-gray-700">Image:</span>
                          <div className="mt-2">
                            <img 
                              src={imagePreview} 
                              alt="Item preview" 
                              className="max-w-full max-h-48 rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Publishing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Check className="w-4 h-4 mr-2" />
                        Publish Item
                      </div>
                    )}
                  </Button>
                )}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.title && formData.description;
      case 2:
        return formData.value && formData.category && formData.condition;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Item</h1>
          <p className="text-gray-600">Share your item details to find the perfect trade</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Basic Information'}
              {step === 2 && 'Details & Pricing'}
              {step === 3 && 'Review & Submit'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload Image for AI Analysis</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="max-w-full max-h-48 mx-auto rounded-lg"
                            />
                            <p className="text-sm text-gray-600">Click to change image</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                          </>
                        )}
                      </label>
                    </div>
                    
                    {imageFile && (
                      <Button
                        onClick={handleAnalyzeImage}
                        disabled={analyzingImage}
                        className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                      >
                        {analyzingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing Image...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Analyze Image with AI
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-4">Or manually enter details:</p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Item Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Vintage Acoustic Guitar"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your item in detail..."
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={4}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="value">Estimated Value ($) *</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="450"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Condition *</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {!imageFile && (
                  <div className="space-y-2">
                    <Label>Images (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="additional-image-upload"
                      />
                      <label htmlFor="additional-image-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                      </label>
                    </div>
                  </div>
                )}
                
                {imagePreview && (
                  <div className="space-y-2">
                    <Label>Current Image</Label>
                    <div className="border rounded-lg p-4">
                      <img 
                        src={imagePreview} 
                        alt="Item" 
                        className="max-w-full max-h-32 mx-auto rounded"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-green-600" />
                    Preview
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Title:</span>
                      <span className="ml-2 text-gray-900">{formData.title}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="mt-1 text-gray-900">{formData.description}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Value:</span>
                      <span className="ml-2 text-green-600 font-semibold">${formData.value}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <span className="ml-2 text-gray-900">{formData.category}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Condition:</span>
                      <span className="ml-2 text-gray-900">
                        {conditions.find(c => c.value === formData.condition)?.label}
                      </span>
                    </div>
                    {imagePreview && (
                      <div>
                        <span className="font-medium text-gray-700">Image:</span>
                        <div className="mt-2">
                          <img 
                            src={imagePreview} 
                            alt="Item preview" 
                            className="max-w-full max-h-48 rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Publishing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Check className="w-4 h-4 mr-2" />
                      Publish Item
                    </div>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}