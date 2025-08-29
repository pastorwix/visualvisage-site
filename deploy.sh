#!/bin/bash

echo "🚀 Visual Visage - Quick Deploy Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from your Visual Visage project directory"
    exit 1
fi

echo "✅ Project directory confirmed"
echo ""

# Show current file sizes
echo "📊 Current Image Sizes:"
echo "========================"
find assets -name "*.jpg" -o -name "*.png" | xargs ls -lh | awk '{print $5, $9}' | sort -hr | head -10

echo ""
echo "⚠️  WARNING: Some images are very large and will slow your site!"
echo ""

# Create optimized assets folder
echo "📁 Creating optimized assets folder..."
mkdir -p assets/optimized

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Open assets/optimize-images.html in your browser"
echo "2. Use TinyPNG or Squoosh to optimize your images"
echo "3. Save optimized images to assets/optimized/"
echo "4. Deploy to Netlify:"
echo "   - Go to netlify.com"
echo "   - Drag and drop your project folder"
echo "   - Get a live URL instantly!"
echo ""

# Check for large files
large_files=$(find assets -name "*.jpg" -o -name "*.png" | xargs ls -lh | awk '$5 ~ /[0-9]+M/ {print $9, $5}' | head -5)

if [ ! -z "$large_files" ]; then
    echo "🚨 CRITICAL: These files need immediate optimization:"
    echo "$large_files"
    echo ""
    echo "💡 Quick fix: Use TinyPNG.com to compress them"
fi

echo ""
echo "🌐 Your site will be much faster after image optimization!"
echo "📱 Test on mobile devices to see the difference"
echo ""
echo "Ready to deploy? 🚀" 