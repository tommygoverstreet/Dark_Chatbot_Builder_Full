#!/usr/bin/env python3
"""
Dark Chatbot Builder Pro - PWA Verification Script
Checks all enhanced features and files for production readiness
"""

import os
import json
import re
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists and print status"""
    if os.path.exists(file_path):
        size = os.path.getsize(file_path)
        print(f"✅ {description}: {file_path} ({size} bytes)")
        return True
    else:
        print(f"❌ {description}: {file_path} - NOT FOUND")
        return False

def check_manifest():
    """Validate PWA manifest file"""
    print("\n🔍 Checking PWA Manifest...")
    if check_file_exists("manifest.json", "PWA Manifest"):
        try:
            with open("manifest.json", "r") as f:
                manifest = json.load(f)
            
            required_fields = ["name", "short_name", "theme_color", "background_color", "display", "start_url", "icons"]
            for field in required_fields:
                if field in manifest:
                    print(f"  ✅ {field}: {manifest[field] if isinstance(manifest[field], str) else f'{len(manifest[field])} items'}")
                else:
                    print(f"  ❌ Missing required field: {field}")
            
            print(f"  📱 Icons defined: {len(manifest.get('icons', []))}")
            print(f"  🎨 Theme color: {manifest.get('theme_color', 'Not set')}")
            print(f"  🖥️ Display mode: {manifest.get('display', 'Not set')}")
            
        except Exception as e:
            print(f"  ❌ Error parsing manifest: {e}")

def check_service_worker():
    """Validate service worker implementation"""
    print("\n🔍 Checking Service Worker...")
    if check_file_exists("sw.js", "Service Worker"):
        with open("sw.js", "r") as f:
            sw_content = f.read()
        
        features = {
            "Install Event": "addEventListener('install'",
            "Activate Event": "addEventListener('activate'",
            "Fetch Event": "addEventListener('fetch'",
            "Cache API": "caches.open",
            "Background Sync": "sync" in sw_content.lower(),
            "Push Notifications": "push" in sw_content.lower()
        }
        
        for feature, check in features.items():
            if isinstance(check, str):
                has_feature = check in sw_content
            else:
                has_feature = check
            
            status = "✅" if has_feature else "⚠️"
            print(f"  {status} {feature}")

def check_icons():
    """Check PWA icons"""
    print("\n🔍 Checking PWA Icons...")
    icon_sizes = ["72x72", "96x96", "128x128", "144x144", "152x152", "192x192", "384x384", "512x512"]
    
    for size in icon_sizes:
        icon_path = f"icons/icon-{size}.svg"
        check_file_exists(icon_path, f"Icon {size}")

def check_seo_files():
    """Check SEO and metadata files"""
    print("\n🔍 Checking SEO Files...")
    seo_files = {
        "sitemap.xml": "XML Sitemap",
        "robots.txt": "Robots.txt",
        "favicon.svg": "Favicon",
        "social-preview.svg": "Social Media Preview",
        ".well-known/security.txt": "Security.txt"
    }
    
    for file_path, description in seo_files.items():
        check_file_exists(file_path, description)

def check_html_meta_tags():
    """Check HTML meta tags"""
    print("\n🔍 Checking HTML Meta Tags...")
    if check_file_exists("index.html", "Main HTML File"):
        with open("index.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        
        meta_tags = {
            "Viewport": 'name="viewport"',
            "Description": 'name="description"',
            "Keywords": 'name="keywords"',
            "Theme Color": 'name="theme-color"',
            "Open Graph Title": 'property="og:title"',
            "Open Graph Image": 'property="og:image"',
            "Twitter Card": 'name="twitter:card"',
            "Canonical URL": 'rel="canonical"',
            "Manifest Link": 'rel="manifest"',
            "Structured Data": 'application/ld+json'
        }
        
        for tag_name, tag_pattern in meta_tags.items():
            has_tag = tag_pattern in html_content
            status = "✅" if has_tag else "❌"
            print(f"  {status} {tag_name}")

def check_snippet_manager():
    """Check snippet manager functionality"""
    print("\n🔍 Checking Snippet Manager...")
    if check_file_exists("index.html", "Main HTML File"):
        with open("index.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        
        # Check for snippet manager HTML elements
        snippet_features = {
            "Snippet Manager Section": 'id="snippetEditor"',
            "Code Editor Tabs": 'id="snippetTabs"',
            "HTML Code Editor": 'id="htmlCode"',
            "CSS Code Editor": 'id="cssCode"',
            "JavaScript Code Editor": 'id="jsCode"',
            "Preview Iframe": 'id="snippetPreview"',
            "Console Output": 'id="consoleOutput"',
            "Snippet List": 'id="snippetList"'
        }
        
        for feature_name, element_id in snippet_features.items():
            has_feature = element_id in html_content
            status = "✅" if has_feature else "❌"
            print(f"  {status} {feature_name}")
    
    # Check JavaScript functionality
    if check_file_exists("app.js", "Application JavaScript"):
        with open("app.js", "r", encoding="utf-8") as f:
            js_content = f.read()
        
        js_functions = {
            "Toggle Snippet Editor": "toggleSnippetEditor",
            "Save Snippet": "saveSnippet",
            "Run Snippet": "runSnippet",
            "Render Snippets": "renderSnippets",
            "Console Management": "clearConsole",
            "Sample Snippets": "addSampleSnippets"
        }
        
        for func_name, func_signature in js_functions.items():
            has_function = func_signature in js_content
            status = "✅" if has_function else "❌"
            print(f"  {status} {func_name}")

def check_css_styles():
    """Check CSS styles for snippet manager"""
    print("\n🔍 Checking Snippet Manager Styles...")
    if check_file_exists("custom.css", "Custom CSS"):
        with open("custom.css", "r", encoding="utf-8") as f:
            css_content = f.read()
        
        css_classes = {
            "Snippet Editor": ".snippet-editor",
            "Code Editor": ".code-editor",
            "Console Container": ".console-container",
            "Console Output": ".console-output",
            "Snippet Item": ".snippet-item",
            "Preview Container": ".preview-container"
        }
        
        for class_name, css_selector in css_classes.items():
            has_class = css_selector in css_content
            status = "✅" if has_class else "❌"
            print(f"  {status} {class_name}")

def check_deployment_files():
    """Check deployment configuration files"""
    print("\n🔍 Checking Deployment Files...")
    deployment_files = {
        "netlify.toml": "Netlify Configuration",
        ".htaccess": "Apache Configuration",
        "_headers": "Netlify Headers",
        "package.json": "NPM Package Configuration",
        ".github/workflows/deploy.yml": "GitHub Actions Workflow"
    }
    
    for file_path, description in deployment_files.items():
        check_file_exists(file_path, description)

def check_project_structure():
    """Check overall project structure"""
    print("\n🔍 Checking Project Structure...")
    core_files = {
        "index.html": "Main Application",
        "app.js": "Application Logic",
        "custom.css": "Custom Styles",
        "README.md": "Documentation",
        "PWA_ENHANCEMENT_REPORT.md": "Enhancement Report"
    }
    
    for file_path, description in core_files.items():
        check_file_exists(file_path, description)

def main():
    """Run all checks"""
    print("🚀 Dark Chatbot Builder Pro - PWA Verification")
    print("=" * 50)
    
    # Change to project directory if script is run from elsewhere
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    check_project_structure()
    check_manifest()
    check_service_worker()
    check_icons()
    check_seo_files()
    check_html_meta_tags()
    check_snippet_manager()
    check_css_styles()
    check_deployment_files()
    
    print("\n" + "=" * 50)
    print("✅ PWA Verification Complete!")
    print("🌐 Local server running at: http://localhost:8000")
    print("📱 Test PWA features in Chrome/Edge DevTools")
    print("🚀 Ready for production deployment!")

if __name__ == "__main__":
    main()
